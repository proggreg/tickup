import { Octokit } from 'octokit'

export default defineEventHandler(async (event) => {
    console.log('github GET endpoint')
    const config = useRuntimeConfig()
    const octokit = new Octokit({ auth: config.githubToken })
    const githubOwner = 'proggreg' // TODO: Ideally get this from config or env
    const githubRepo = 'tickup' // TODO: Ideally get this from config or env

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
})
