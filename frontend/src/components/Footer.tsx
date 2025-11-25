
import React, { useState } from 'react';
import { Instagram, Mail, MapPin, Phone, Send } from 'lucide-react';
import axios from 'axios';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/newsletter/', { email });
            setStatus('success');
            setMessage('¡Gracias por suscribirte!');
            setEmail('');
        } catch (error) {
            setStatus('error');
            setMessage('Error al suscribirse. Intenta nuevamente.');
        }
    };

    return (
        <footer className="bg-brand-pink/20 pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="text-center md:text-left">
                        <h3 className="font-heading font-bold text-2xl text-gray-800 mb-4">TMM Bienestar</h3>
                        <p className="text-gray-600 mb-4">
                            Crea, sana y conecta desde tus manos. Un espacio pensado para tu bienestar y creatividad.
                        </p>
                        <div className="flex justify-center md:justify-start space-x-4">
                            <a href="#" className="text-brand-calypso hover:text-brand-fuchsia transition-colors">
                                <Instagram className="w-6 h-6" />
                            </a>
                            <a href="#" className="text-brand-calypso hover:text-brand-fuchsia transition-colors">
                                <Mail className="w-6 h-6" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center md:text-left">
                        <h4 className="font-heading font-bold text-lg text-gray-800 mb-4">Enlaces Rápidos</h4>
                        <ul className="space-y-2">
                            <li><a href="/workshops" className="text-gray-600 hover:text-brand-calypso">Talleres Presenciales</a></li>
                            <li><a href="/courses" className="text-gray-600 hover:text-brand-calypso">Cursos Grabados</a></li>
                            <li><a href="/blog" className="text-gray-600 hover:text-brand-calypso">Blog de Bienestar</a></li>
                            <li><a href="/about" className="text-gray-600 hover:text-brand-calypso">Sobre Mí</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="text-center md:text-left">
                        <h4 className="font-heading font-bold text-lg text-gray-800 mb-4">Contacto</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                                <MapPin className="w-5 h-5 text-brand-calypso" />
                                <span>Santiago, Chile</span>
                            </li>
                            <li className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                                <Mail className="w-5 h-5 text-brand-calypso" />
                                <span>contacto@tmmbienestar.cl</span>
                            </li>
                            <li className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                                <Phone className="w-5 h-5 text-brand-calypso" />
                                <span>+56 9 1234 5678</span>
                            </li>
                        </ul>

                    </div>

                    {/* Newsletter */}
                    <div className="text-center md:text-left">
                        <h4 className="font-heading font-bold text-lg text-gray-800 mb-4">Newsletter</h4>
                        <p className="text-gray-600 mb-4 text-sm">
                            Recibe consejos de bienestar y novedades de nuestros talleres.
                        </p>
                        <form onSubmit={handleSubscribe} className="space-y-2">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Tu correo electrónico"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/50 text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1 top-1 p-1 bg-brand-pink text-white rounded-md hover:bg-brand-pink/90 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            {status === 'success' && <p className="text-green-600 text-xs">{message}</p>}
                            {status === 'error' && <p className="text-red-500 text-xs">{message}</p>}
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} TMM Bienestar y Conexión. Todos los derechos reservados.
                    </p>
                    <p className="text-brand-calypso font-medium mt-2 text-sm">
                        “Recuerden, más que una página, estamos construyendo un espacio de bienestar y conexión 🌿”
                    </p>
                </div>
            </div>
        </footer >
    );
};

export default Footer;
