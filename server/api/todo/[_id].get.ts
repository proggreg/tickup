export default defineEventHandler(async (event) => {
  try {
    if (!event.context.params || !event.context.params._id) {
      throw new Error('no id')
    }
<<<<<<< HEAD

    return await TodoSchema.find({ list_id: event.context.params._id })
  } catch (e) {
    return e
  }
})
=======
    const todo = await TodoSchema.findById(event.context.params._id)
    console.log('got todo', todo)
    return todo
  } catch (e) {
    return e
  }
})
>>>>>>> 0861ca5 (Add input and todoDialogOpen refs, setTextFieldFocus and openTodoDialog functions, and TodoDetail component)
