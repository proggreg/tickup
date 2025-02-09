import { defineEventHandler, getQuery, readBody, createError } from 'h3'
import { Octokit } from 'octokit'
import { getToken } from '#auth'

export default defineEventHandler(async (event) => {
  const token = await getToken({ event })

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // Check if it's your specific account
  const ALLOWED_USER = process.env.ADMIN_USER_ID //
  if (token.sub !== ALLOWED_USER) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden: Access restricted',
    })
  }
  console.log('github endpoint')
  const config = useRuntimeConfig()
  const octokit = new Octokit({ auth: config.github.personal })
  const githubOwner = 'proggreg' // TODO: Ideally get this from config or env
  const githubRepo = 'tickup' // TODO: Ideally get this from config or env

  if (event.method === 'GET') {
    const query = getQuery(event)
    const branchName = query.branchName as string
    console.log('get branch', branchName)
    if (!branchName) {
      return createError({ statusCode: 400, message: 'Missing branchName in query parameters' })
    }

    try {
      const branch = await octokit.rest.repos.getBranch({
        owner: githubOwner,
        repo: githubRepo,
        branch: branchName,
      })
      return branch.data
    }
    catch (error: any) {
      console.error('Error fetching branch:', error)
    //   return createError({ statusCode: error.status || 500, message: error.message || 'Failed to fetch branch' })
    }
  }
  else if (event.method === 'POST') {
    const body = await readBody(event)
    const branchName = body.branchName as string
    let sha = body.sha as string

    console.log('create branch ', branchName)

    if (!branchName) {
      return createError({ statusCode: 400, message: 'Missing branchName request body' })
    }

    try {
      const ref = `refs/heads/${branchName}`
      if (!sha) {
        sha = await octokit.rest.repos.getBranch({
          owner: githubOwner,
          repo: githubRepo,
          branch: 'main',
        }).then(({ data }) => {
          console.log('main branch', data)
          return data.commit.sha
        })
      }

      console.log('sha', sha)

      console.log('ref', ref)
      if (!sha) {
        return createError({ statusCode: 400, message: 'SHA Cannot be found' })
      }
      const newRef = {
        owner: githubOwner,
        repo: githubRepo,
        ref,
        sha,
      }
      console.log('newRef', newRef)
      const newBranch = await octokit.request(`POST /repos/${githubOwner}/${githubRepo}/git/refs`, {
        owner: githubOwner,
        repo: githubRepo,
        ref: ref,
        sha: sha,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
      //   const newBranch = await octokit.rest.git.createRef(newRef)
      return newBranch.data
    }
    catch (error: any) {
      console.error('Error creating branch:', error)
      return createError({ statusCode: error.status || 500, message: error.message || 'Failed to create branch' })
    }
  }
  else {
    return createError({ statusCode: 405, message: 'Method Not Allowed' })
  }
})
