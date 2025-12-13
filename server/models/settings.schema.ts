import { defineMongooseModel } from '#nuxt/mongoose';

export const SettingsSchema = defineMongooseModel({
    name: 'settings',
    schema: {
        userId: {
            type: 'string',
            required: true,
        },
        statuses: {
            type: [{
                name: 'string',
                color: 'string',
                index: 'number',
            }],
            required: true,
        },
    },
});
