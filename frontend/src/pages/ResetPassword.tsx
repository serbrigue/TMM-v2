import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { motion } from 'framer-motion';

const ResetPassword = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Las contraseñas no coinciden');
            return;
        }

        setStatus('loading');
        try {
            const response = await client.post(`/auth/password-reset-confirm/${uid}/${token}/`, { password });
            setStatus('success');
            setMessage(response.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.error || 'Error al restablecer la contraseña.');
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl"
            >
                <h2 className="text-3xl font-bold font-serif mb-6 text-tmm-black text-center">Nueva Contraseña</h2>

                {status === 'success' ? (
                    <div className="text-green-600 text-center">
                        <div className="text-5xl mb-4">🎉</div>
                        <p className="text-lg font-medium">{message}</p>
                        <p className="text-sm text-gray-500 mt-4">Redirigiendo al login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="pass" className="block text-sm font-medium text-gray-700 mb-1">
                                Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                id="pass"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tmm-pink focus:border-transparent transition-all outline-none"
                                placeholder="••••••••"
                                minLength={8}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                id="confirm"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tmm-pink focus:border-transparent transition-all outline-none"
                                placeholder="••••••••"
                                minLength={8}
                            />
                        </div>

                        {status === 'error' && (
                            <div className="text-red-500 text-sm text-center">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full py-4 bg-tmm-black text-white rounded-full font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'loading' ? 'Guardando...' : 'Cambiar Contraseña'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
