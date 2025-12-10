export const API_ROUTES = {
    AUTH: {
        LOGIN: '/token/',
        REGISTER: '/register/',
        REFRESH: '/token/refresh/',
        ACTIVATE: (uid: string, token: string) => `/activate/${uid}/${token}/`,
        RESET_PASSWORD_REQUEST: '/password-reset/',
        RESET_PASSWORD_CONFIRM: (uid: string, token: string) => `/password-reset-confirm/${uid}/${token}/`,
        PROFILE: '/user/profile/',
    },
    WORKSHOPS: {
        LIST: '/talleres/',
        DETAIL: (id: number | string) => `/talleres/${id}/`,
        ADMIN_LIST: '/admin-talleres/',
        ADMIN_DETAIL: (id: number | string) => `/admin-talleres/${id}/`,
    },
    COURSES: {
        LIST: '/cursos/',
        DETAIL: (id: number | string) => `/cursos/${id}/`,
        ADMIN_LIST: '/admin-cursos/',
        ADMIN_DETAIL: (id: number | string) => `/admin-cursos/${id}/`,
        MY_COURSES: '/mis-cursos/',
    },
    CHECKOUT: '/checkout/',
    ORDERS: {
        LIST: '/user/orders/',
        DETAIL: (id: number | string) => `/user/orders/${id}/`,
        CREATE: '/checkout/',
    },
    PAYMENTS: {
        VERIFY: '/admin/payments/verify/',
        UPLOAD: '/transacciones/',
    },
    ADMIN: {
        DASHBOARD: '/admin/dashboard-stats/',
        CLIENTS: '/admin/clientes/',
        CLIENT_DETAIL: (id: number | string) => `/admin/clientes/${id}/`,
    }
};
