const prefix = '/api';
export const APIRoutes = {
    list: {
        get: (id: string) => `${prefix}/list/${id}`,
        post: `${prefix}/list`,
        put: (id: string) => `${prefix}/list/${id}`,
        delete: (id: string) => `${prefix}/list/${id}`,
    },
};
