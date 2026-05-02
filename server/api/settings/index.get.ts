export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);

        return await SettingsSchema.find({ userId: query.userId });
    }
    catch (error) {
        return error;
    }
});
