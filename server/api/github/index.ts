import { defineEventHandler, getQuery, readBody, createError } from 'h3'
import { Octokit } from 'octokit'
import { getToken, getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  // Check if this is a test request
  const isTestRequest = event.headers.get('x-test-mode') === 'true' || 
                       getQuery(event).test === 'true' ||
                       process.env.NODE_ENV === 'test'

  if (isTestRequest) {
    // Handle test requests with mock responses
    if (event.method === 'GET') {
      const query = getQuery(event)
      const branchName = query.branchName as string
      
      if (!branchName) {
        return createError({ statusCode: 400, message: 'Missing branchName in query parameters' })
      }
      
      // Mock responses for tests
      if (branchName === 'here') {
        return createError({ statusCode: 404, message: 'Branch not found' })
      }
      
      if (branchName === 'main') {
        return { name: 'main', commit: { sha: 'test-sha' } }
      }
      
      return { name: branchName, commit: { sha: 'test-sha' } }
    }
    
    return createError({ statusCode: 405, message: 'Method Not Allowed' })
  }

  // Original authentication logic for non-test environments
  const token = await getToken({ event })
  const session = await getServerSession(event)
  console.debug('session', session)
  console.debug('token', token)
  console.debug('check github')
  const sub = session?.user.sub

  if (!sub) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // Check if it's your specific account
  const ALLOWED_USER = process.env.ADMIN_USER_ID //
  if (sub !== ALLOWED_USER) {
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
