import { MongoClient } from 'mongodb'
import { getEmbedding } from './get-embeddings'

export default defineEventHandler(async (event) => {
    try {
        console.log(process.env.MONGODB_URI)
        const client = new MongoClient(process.env.MONGODB_URI)

        await client.connect()
        const db = client.db('Tickup-PROD')
        const collection = db.collection('todos')
        const { q, id } = getQuery(event)

        const queryEmbeddings = await getEmbedding(q)

        const pipeline = [
            {
                $vectorSearch: {
                    index: 'vector_index',
                    queryVector: queryEmbeddings,
                    path: 'embedding',
                    exact: true,
                    limit: 10,
                },
            },
        ]

        console.log('queryEmbeddings', queryEmbeddings)
        const todos = await collection.aggregate(pipeline).toArray()
        const userTodos = todos.filter(todo =>
            todo.userId === id)
        const normalSearchTodos = await TodoSchema.find({ userId: id, name: { $regex: q, $options: 'i' } }).sort({ createdAt: -1 })
        console.log('normalSearchTodos', normalSearchTodos)
        userTodos.push(...normalSearchTodos)
        return userTodos
    }
    catch (error) {
        return error
    }
})
