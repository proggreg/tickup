import { defineEventHandler, getQuery, readBody, createError } from 'h3'
import { Octokit } from 'octokit'

export default defineEventHandler(async (event) => {
    console.log('github endpoint')
    const config = useRuntimeConfig()
    const octokit = new Octokit({ auth: config.githubToken })
    const githubOwner = 'proggreg' // TODO: Ideally get this from config or env
    const githubRepo = 'tickup' // TODO: Ideally get this from config or env

    if (event.method === 'GET') {
        const query = getQuery(event)
        const branchName = query.branchName as string

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
            return createError({ statusCode: error.status || 500, message: error.message || 'Failed to fetch branch' })
        }
    }
    else if (event.method === 'POST') {
        const body = await readBody(event)
        const branchName = body.branchName as string

        console.log('create branch ', branchName)

        if (!branchName) {
            return createError({ statusCode: 400, message: 'Missing branchName request body' })
        }

        try {
            const ref = `refs/heads/${branchName}`
            const sha = await octokit.rest.repos.getBranch({
                owner: 'proggreg',
                repo: 'tickup',
                branch: 'main',
            }).then(({ data }) => {
                return data.commit.sha
            })

            console.log('sha', sha)

            if (!sha) {
                return createError({ statusCode: 400, message: 'SHA Cannot be found' })
            }
            const newBranch = await octokit.rest.git.createRef({
                owner: githubOwner,
                repo: githubRepo,
                ref,
                sha,
            })
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
