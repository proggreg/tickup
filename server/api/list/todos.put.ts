export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // @ts-ignore
    const updates = body.orderedItems.map((item: any) => {
      return {
        updateOne: {
          filter: { _id: item._id },
          update: { $set: { order: item.order } },
        },
      }
    })

    return await TodoSchema.bulkWrite(updates)
  }
  catch (e) {
    return e
  }
})
