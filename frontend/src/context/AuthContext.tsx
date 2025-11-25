import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

interface User {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_superuser: boolean;
}

interface Enrollment {
    cursos: number[];
    talleres: number[];
}

interface AuthContextType {
    user: User | null;
    login: (token: string, refresh: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
    isAdmin: boolean;
    enrollments: Enrollment;
    refreshEnrollments: () => Promise<void>;
    isEnrolledInCourse: (courseId: number) => boolean;
    isEnrolledInWorkshop: (workshopId: number) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [enrollments, setEnrollments] = useState<Enrollment>({ cursos: [], talleres: [] });

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    // We can get basic info from token, but better to fetch profile or trust token claims if we put them there
                    // Since we updated the serializer, let's try to use the token claims first for speed
                    if (decoded.is_superuser !== undefined) {
                        setUser({
                            username: decoded.username,
                            email: decoded.email,
                            first_name: decoded.first_name,
                            last_name: '', // Token might not have it, but profile fetch will update it
                            is_superuser: decoded.is_superuser
                        });
                        setIsAuthenticated(true);
                        // Fetch enrollments after setting user
                        fetchEnrollments(token);
                    } else {
                        // Fallback to fetch profile if token doesn't have new claims yet
                        fetchUserProfile(token);
                    }
                }
            } catch (e) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const fetchUserProfile = async (token: string) => {
        try {
            const response = await axios.get('http://localhost:8000/api/profile/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
            setIsAuthenticated(true);
            // Fetch enrollments after setting user
            await fetchEnrollments(token);
        } catch (error) {
            console.error("Failed to fetch user profile", error);
            logout();
        }
    };

    const fetchEnrollments = async (token?: string) => {
        try {
            const authToken = token || localStorage.getItem('access_token');
            if (!authToken) return;

            console.log('🔍 Fetching enrollments...');
            const response = await axios.get('http://localhost:8000/api/my-enrollments/', {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            console.log('📦 Enrollment response:', response.data);

            // Backend serializers return ForeignKey IDs directly in 'curso' and 'taller' fields
            const courseIds = response.data.cursos.map((c: any) => c.curso).filter((id: any) => id !== undefined);
            const workshopIds = response.data.talleres.map((t: any) => t.taller).filter((id: any) => id !== undefined);

            console.log('📚 Course IDs:', courseIds);
            console.log('🎨 Workshop IDs:', workshopIds);

            setEnrollments({
                cursos: courseIds,
                talleres: workshopIds
            });
        } catch (error) {
            console.error("❌ Failed to fetch enrollments", error);
        }
    };

    const refreshEnrollments = async () => {
        await fetchEnrollments();
    };

    const isEnrolledInCourse = (courseId: number): boolean => {
        return enrollments.cursos.includes(courseId);
    };

    const isEnrolledInWorkshop = (workshopId: number): boolean => {
        return enrollments.talleres.includes(workshopId);
    };

    const login = (token: string, refresh: string) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', refresh);

        const decoded: any = jwtDecode(token);
        setUser({
            username: decoded.username,
            email: decoded.email,
            first_name: decoded.first_name,
            last_name: '',
            is_superuser: decoded.is_superuser
        });
        setIsAuthenticated(true);
        // Fetch enrollments after login
        fetchEnrollments(token);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setIsAuthenticated(false);
        setEnrollments({ cursos: [], talleres: [] });
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated,
            loading,
            isAdmin: user?.is_superuser || false,
            enrollments,
            refreshEnrollments,
            isEnrolledInCourse,
            isEnrolledInWorkshop
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
