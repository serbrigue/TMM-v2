import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

const NewsletterModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Check if already subscribed or closed recently
        const hasSeenModal = localStorage.getItem('newsletter_modal_seen');
        if (!hasSeenModal) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 5000); // Show after 5 seconds
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('newsletter_modal_seen', 'true');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await axios.post(`${API_URL}/newsletter/subscribe/`, { email });
            setStatus('success');
            localStorage.setItem('newsletter_modal_seen', 'true');
            setTimeout(() => {
                setIsOpen(false);
            }, 3000);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Error al suscribirse. Inténtalo de nuevo.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row relative animate-fade-in-up">

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Image Side */}
                <div className="md:w-1/2 bg-tmm-pink relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-tmm-pink/80 to-tmm-white/80 mix-blend-multiply" />
                    <img
                        src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                        alt="Ebook Cover"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-3 w-fit">
                            GRATIS POR TIEMPO LIMITADO
                        </span>
                        <h3 className="text-3xl font-serif font-bold mb-2">Guía de Manualidades 2025</h3>
                        <p className="text-white/90 text-sm">Descubre las tendencias que marcarán el año y aprende a monetizar tu arte.</p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    {status === 'success' ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-tmm-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-tmm-green" />
                            </div>
                            <h3 className="text-2xl font-bold text-tmm-black mb-2">¡Gracias por suscribirte!</h3>
                            <p className="text-tmm-black/60">Revisa tu correo, te hemos enviado el enlace de descarga.</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl md:text-3xl font-bold text-tmm-black mb-4">
                                ¿Quieres llevar tu arte al siguiente nivel?
                            </h2>
                            <p className="text-tmm-black/60 mb-8">
                                Únete a nuestra comunidad de +5000 creativas y recibe gratis nuestra guía exclusiva con tips de venta y creatividad.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-tmm-black/80 mb-1 ml-1">Tu mejor correo</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="hola@ejemplo.com"
                                            className="w-full pl-12 pr-4 py-3 border border-tmm-pink/20 rounded-xl focus:ring-2 focus:ring-tmm-pink focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                {status === 'error' && (
                                    <p className="text-red-500 text-sm">{message}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-tmm-yellow text-tmm-black font-bold py-4 rounded-xl hover:bg-opacity-90 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-tmm-yellow/30 flex items-center justify-center gap-2"
                                >
                                    {status === 'loading' ? 'Enviando...' : (
                                        <>
                                            QUIERO MI GUÍA GRATIS
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-center text-gray-400 mt-4">
                                    Respetamos tu privacidad. Sin spam, prometido.
                                </p>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsletterModal;
