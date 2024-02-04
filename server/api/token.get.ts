import { getToken } from '#auth'

export default eventHandler(async (event) => {
    // @ts-expect-error
    const token = await getToken({ event })

    return token || 'no token present'
})
