export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)

        const updates = body.orderedItems.map(item => {
            return {
                updateOne: {
                    filter: { _id: item._id },
                    update: { $set: { order: item.order } }
                }
            };
        });

        return await TodoSchema.bulkWrite(updates)
    } catch (e) {
        return e
    }

})