import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { motion } from 'framer-motion';

const ActivateAccount = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const activate = async () => {
            try {
                const response = await client.get(`/auth/activate/${uid}/${token}/`);
                setStatus('success');
                setMessage(response.data.message || 'Cuenta activada correctamente.');
                setTimeout(() => navigate('/login'), 3000);
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Error al activar la cuenta.');
            }
        };
        activate();
    }, [uid, token, navigate]);

    return (
        <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center"
            >
                <h2 className="text-3xl font-bold font-serif mb-6 text-tmm-black">Activación de Cuenta</h2>

                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tmm-black mb-4"></div>
                        <p className="text-gray-600">Verificando tu cuenta...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-green-600">
                        <div className="text-5xl mb-4">🎉</div>
                        <p className="text-lg font-medium">{message}</p>
                        <p className="text-sm text-gray-500 mt-4">Redirigiendo al login...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-red-600">
                        <div className="text-5xl mb-4">⚠️</div>
                        <p className="text-lg font-medium">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-6 px-6 py-2 bg-tmm-black text-white rounded-full hover:bg-gray-800 transition-colors"
                        >
                            Ir al Login
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ActivateAccount;
