import React, { useState } from 'react';
import { InstagramLogo, Envelope, MapPin, Phone, PaperPlaneRight } from '@phosphor-icons/react';
import axios from 'axios';
import { Button } from './ui/Button';
import { API_URL } from '../config/api';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/newsletter/`, { email });
            setStatus('success');
            setMessage('¡Gracias por suscribirte!');
            setEmail('');
        } catch (error) {
            setStatus('error');
            setMessage('Error al suscribirse. Intenta nuevamente.');
        }
    };

    return (
        <footer className="border-t border-tmm-pink/20 bg-tmm-pink/10 pt-16 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
                    {/* Brand Section */}
                    <div className="text-center md:text-left">
                        <h3 className="mb-4 font-serif text-2xl font-bold text-tmm-black">TMM Bienestar</h3>
                        <p className="mb-6 text-tmm-black/80 leading-relaxed">
                            Crea, sana y conecta desde tus manos. Un espacio pensado para tu bienestar y creatividad.
                        </p>
                        <div className="flex justify-center space-x-4 md:justify-start">
                            <a href="#" className="text-tmm-black/70 transition-colors hover:text-tmm-black">
                                <InstagramLogo weight="light" className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-tmm-black/70 transition-colors hover:text-tmm-black">
                                <Envelope weight="light" className="h-6 w-6" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center md:text-left">
                        <h4 className="mb-4 font-serif text-lg font-bold text-tmm-black">Enlaces Rápidos</h4>
                        <ul className="space-y-3">
                            <li><a href="/talleres" className="text-tmm-black/70 hover:text-tmm-black transition-colors">Talleres Presenciales</a></li>
                            <li><a href="/cursos" className="text-tmm-black/70 hover:text-tmm-black transition-colors">Cursos Grabados</a></li>
                            <li><a href="/blog" className="text-tmm-black/70 hover:text-tmm-black transition-colors">Blog de Bienestar</a></li>
                            <li><a href="/nosotros" className="text-tmm-black/70 hover:text-tmm-black transition-colors">Fundadora</a></li>
                            <li><a href="/tienda" className="text-tmm-black/70 hover:text-tmm-black transition-colors">Productos</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="text-center md:text-left">
                        <h4 className="mb-4 font-serif text-lg font-bold text-tmm-black">Contacto</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center justify-center gap-3 text-tmm-black/70 md:justify-start">
                                <MapPin weight="light" className="h-5 w-5 text-tmm-black" />
                                <span>Santiago, Chile</span>
                            </li>
                            <li className="flex items-center justify-center gap-3 text-tmm-black/70 md:justify-start">
                                <Envelope weight="light" className="h-5 w-5 text-tmm-black" />
                                <span>contacto@tmmbienestar.cl</span>
                            </li>
                            <li className="flex items-center justify-center gap-3 text-tmm-black/70 md:justify-start">
                                <Phone weight="light" className="h-5 w-5 text-tmm-black" />
                                <span>+56 9 1234 5678</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="text-center md:text-left">
                        <h4 className="mb-4 font-serif text-lg font-bold text-tmm-black">Newsletter</h4>
                        <p className="mb-4 text-sm text-tmm-black/70">
                            Recibe consejos de bienestar y novedades de nuestros talleres.
                        </p>
                        <form onSubmit={handleSubscribe} className="space-y-2">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Tu correo electrónico"
                                    className="w-full rounded-lg border border-tmm-pink/30 bg-white/50 px-4 py-2 text-sm text-tmm-black placeholder-tmm-black/40 focus:border-tmm-pink focus:outline-none focus:ring-1 focus:ring-tmm-pink"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1 rounded-md p-1 text-tmm-black hover:bg-tmm-yellow/50 hover:text-tmm-black transition-colors h-auto w-auto"
                                >
                                    <PaperPlaneRight weight="light" className="h-4 w-4" />
                                </Button>
                            </div>
                            {status === 'success' && <p className="text-xs text-green-600">{message}</p>}
                            {status === 'error' && <p className="text-xs text-red-500">{message}</p>}
                        </form>
                    </div>
                </div>

                <div className="border-t border-tmm-pink/20 pt-8 text-center">
                    <p className="text-sm text-tmm-black/60">
                        © {new Date().getFullYear()} TMM Bienestar y Conexión. Todos los derechos reservados.
                    </p>
                    <p className="mt-2 text-sm font-medium text-tmm-black/80">
                        “Recuerden, más que una página, estamos construyendo un espacio de bienestar y conexión 🌿”
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
