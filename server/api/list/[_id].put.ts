export default defineEventHandler(async (event) => {
    try {

        if (!event.context.params?._id) {
            throw createError({
                statusCode: 500,
                statusMessage: "ID parameter is required"
            })
        }
        const body = await readBody(event)
        return await ListSchema.findOneAndUpdate({ _id: event.context.params?._id }, body, { new: true })
    } catch (error) {
        return error
    }
})