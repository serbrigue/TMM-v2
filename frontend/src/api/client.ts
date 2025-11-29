import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const response = await axios.post(`${baseURL}/token/refresh/`, {
                        refresh: refreshToken
                    });

                    if (response.status === 200) {
                        const { access } = response.data;
                        localStorage.setItem('access_token', access);

                        // Update header for original request
                        originalRequest.headers.Authorization = `Bearer ${access}`;
                        client.defaults.headers.common['Authorization'] = `Bearer ${access}`;

                        return client(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    // Logout user if refresh fails
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            } else {
                // No refresh token available
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default client;
