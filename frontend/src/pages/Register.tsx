import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Sparkles, Check } from 'lucide-react';
import { API_URL } from '../config/api';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        origen: 'OTRO'
    });
    const [error, setError] = useState('');
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        number: false,
        special: false
    });
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'password') {
            setPasswordCriteria({
                length: value.length >= 8,
                uppercase: /[A-Z]/.test(value),
                number: /[0-9]/.test(value),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!Object.values(passwordCriteria).every(Boolean)) {
            setError('La contraseña no cumple con todos los requisitos.');
            return;
        }
        try {

            await axios.post(`${API_URL}/register/`, formData);
            navigate('/login');
        } catch (err: any) {
            console.error('Registration Error:', err.response?.data || err.message);

            let errorMsg = 'Error al registrarse. Intenta nuevamente.';

            if (err.response?.data) {
                const data = err.response.data;
                if (typeof data === 'object') {
                    // Handle Django DRF error format
                    const messages = [];
                    if (data.username) messages.push(`Usuario: ${data.username[0]}`);
                    if (data.email) messages.push(`Email: ${data.email[0]}`);
                    if (data.password) messages.push(`Contraseña: ${data.password[0]}`);
                    if (data.non_field_errors) messages.push(data.non_field_errors[0]);

                    if (messages.length > 0) {
                        errorMsg = messages.join(' ');
                    } else {
                        // Fallback for other fields
                        errorMsg = Object.values(data).flat().join(' ');
                    }
                } else {
                    errorMsg = data;
                }
            }

            setError(errorMsg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-tmm-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-tmm-pink/20 backdrop-blur-sm">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-tmm-pink/20 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <UserPlus className="h-8 w-8 text-tmm-black" />
                    </div>
                    <h2 className="text-4xl font-serif font-bold text-tmm-black mb-2">
                        Únete a nuestra comunidad
                    </h2>
                    <p className="text-tmm-black/60">
                        Crea tu cuenta y comienza tu viaje creativo
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
                            <label htmlFor="username" className="block text-sm font-medium text-tmm-black mb-2 pl-1">Nombre de Usuario</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none block w-full px-4 py-4 border border-tmm-black/20 rounded-xl placeholder-tmm-black/40 focus:outline-none focus:ring-2 focus:ring-tmm-pink focus:border-tmm-pink transition-all bg-tmm-white focus:bg-white"
                                placeholder="Elige un nombre único"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-tmm-black mb-2 pl-1">Correo Electrónico</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none block w-full px-4 py-4 border border-tmm-black/20 rounded-xl placeholder-tmm-black/40 focus:outline-none focus:ring-2 focus:ring-tmm-pink focus:border-tmm-pink transition-all bg-tmm-white focus:bg-white"
                                placeholder="tucorreo@ejemplo.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-tmm-black mb-2 pl-1">Nombre</label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    className="appearance-none block w-full px-4 py-4 border border-tmm-black/20 rounded-xl placeholder-tmm-black/40 focus:outline-none focus:ring-2 focus:ring-tmm-pink focus:border-tmm-pink transition-all bg-tmm-white focus:bg-white"
                                    placeholder="Tu nombre"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-tmm-black mb-2 pl-1">Apellido</label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    className="appearance-none block w-full px-4 py-4 border border-tmm-black/20 rounded-xl placeholder-tmm-black/40 focus:outline-none focus:ring-2 focus:ring-tmm-pink focus:border-tmm-pink transition-all bg-tmm-white focus:bg-white"
                                    placeholder="Tu apellido"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-tmm-black mb-2 pl-1">Contraseña</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-4 border border-tmm-black/20 rounded-xl placeholder-tmm-black/40 focus:outline-none focus:ring-2 focus:ring-tmm-pink focus:border-tmm-pink transition-all bg-tmm-white focus:bg-white"
                                placeholder="Crea una contraseña segura"
                                value={formData.password}
                                onChange={handleChange}
                            />

                            {/* Password Strength Indicator */}
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <div className={`flex items-center text-xs ${passwordCriteria.length ? 'text-tmm-green' : 'text-tmm-black/40'}`}>
                                    {passwordCriteria.length ? <Check className="w-3 h-3 mr-1" /> : <div className="w-3 h-3 mr-1 rounded-full border border-tmm-black/20" />}
                                    Mínimo 8 caracteres
                                </div>
                                <div className={`flex items-center text-xs ${passwordCriteria.uppercase ? 'text-tmm-green' : 'text-tmm-black/40'}`}>
                                    {passwordCriteria.uppercase ? <Check className="w-3 h-3 mr-1" /> : <div className="w-3 h-3 mr-1 rounded-full border border-tmm-black/20" />}
                                    Una mayúscula
                                </div>
                                <div className={`flex items-center text-xs ${passwordCriteria.number ? 'text-tmm-green' : 'text-tmm-black/40'}`}>
                                    {passwordCriteria.number ? <Check className="w-3 h-3 mr-1" /> : <div className="w-3 h-3 mr-1 rounded-full border border-tmm-black/20" />}
                                    Un número
                                </div>
                                <div className={`flex items-center text-xs ${passwordCriteria.special ? 'text-tmm-green' : 'text-tmm-black/40'}`}>
                                    {passwordCriteria.special ? <Check className="w-3 h-3 mr-1" /> : <div className="w-3 h-3 mr-1 rounded-full border border-tmm-black/20" />}
                                    Un carácter especial
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="origen" className="block text-sm font-medium text-tmm-black mb-2 pl-1">¿Cómo nos conociste?</label>
                            <select
                                id="origen"
                                name="origen"
                                className="appearance-none block w-full px-4 py-4 border border-tmm-black/20 rounded-xl placeholder-tmm-black/40 focus:outline-none focus:ring-2 focus:ring-tmm-pink focus:border-tmm-pink transition-all bg-tmm-white focus:bg-white"
                                value={formData.origen}
                                onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                            >
                                <option value="INSTAGRAM">Instagram</option>
                                <option value="GOOGLE">Google / Web</option>
                                <option value="REFERIDO">Referido por amigo</option>
                                <option value="EVENTO">Evento Presencial</option>
                                <option value="OTRO">Otro</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-tmm-black bg-tmm-pink hover:bg-tmm-pink/80 focus:outline-none focus:ring-4 focus:ring-tmm-pink/20 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Crear Cuenta
                            <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-sm text-tmm-black/60">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/login" className="font-bold text-tmm-black hover:text-tmm-pink transition-colors">
                                Inicia sesión aquí
                            </Link>
                        </p>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default Register;
