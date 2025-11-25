import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogIn, ArrowRight } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/token/', {
                username,
                password
            });
            login(response.data.access, response.data.refresh);

            // Decode token to check if user is admin
            const decoded: any = JSON.parse(atob(response.data.access.split('.')[1]));
            if (decoded.is_superuser) {
                navigate('/admin/dashboard');
            } else {
                navigate('/profile');
            }
        } catch (err) {
            setError('Credenciales inválidas. Por favor intenta de nuevo.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-pink/20 via-white to-brand-pink/10 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-white/50 backdrop-blur-sm">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-brand-pink/10 rounded-full flex items-center justify-center mb-6">
                        <LogIn className="h-8 w-8 text-brand-pink" />
                    </div>
                    <h2 className="text-4xl font-heading font-bold text-gray-900 mb-2">
                        Bienvenida de nuevo
                    </h2>
                    <p className="text-gray-500">
                        Ingresa tus datos para continuar
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2 pl-1">Usuario</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none block w-full px-4 py-4 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all bg-gray-50 focus:bg-white"
                                placeholder="Ej: tu_usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2 pl-1">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                                <a href="#" className="text-sm font-medium text-brand-pink hover:text-brand-pink/80">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-4 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all bg-gray-50 focus:bg-white"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-brand-pink hover:bg-brand-pink/90 focus:outline-none focus:ring-4 focus:ring-brand-pink/20 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Ingresar
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            ¿Aún no tienes cuenta?{' '}
                            <Link to="/register" className="font-bold text-brand-pink hover:text-brand-pink/80 transition-colors">
                                Regístrate gratis aquí
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
