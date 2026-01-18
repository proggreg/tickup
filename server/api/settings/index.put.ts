export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const options = { upsert: true };
        return await SettingsSchema.updateOne({ userId: body.userId }, { statuses: body.statuses }, options);
    }
    catch (error) {
        return error;
    }
});
