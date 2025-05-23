export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const payload = { ...body };
    console.log('body', body)
    const { result } = await runTask("prompt", { payload });


    return { result };
});