import { getToken } from '#auth'

export default eventHandler(async (event) => {
    // @ts-expect-error
    const token = await getToken({ event })
    //TODO delete?
    //console.log('this token')

    // return token || 'no token present'
})
