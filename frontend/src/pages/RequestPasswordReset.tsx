import React, { useState } from 'react';
import client from '../api/client';
import { motion } from 'framer-motion';

const RequestPasswordReset = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const response = await client.post('/auth/password-reset/', { email });
            setStatus('success');
            setMessage(response.data.message);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.error || 'Error al solicitar la recuperación.');
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl"
            >
                <h2 className="text-3xl font-bold font-serif mb-2 text-tmm-black text-center">Recuperar Contraseña</h2>
                <p className="text-gray-600 text-center mb-6">Ingresa tu correo para recibir un enlace de recuperación.</p>

                {status === 'success' ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-center">
                        <p>{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tmm-pink focus:border-transparent transition-all outline-none"
                                placeholder="tu@email.com"
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
                            {status === 'loading' ? 'Enviando...' : 'Enviar Enlace'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default RequestPasswordReset;
