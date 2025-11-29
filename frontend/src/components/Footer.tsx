import React, { useState } from 'react';
import { InstagramLogo, Envelope, MapPin, Phone, PaperPlaneRight } from '@phosphor-icons/react';
import axios from 'axios';
import { Button } from './ui/Button';

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
        <footer className="border-t border-silver-gray bg-cloud-pink pt-16 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
                    {/* Brand Section */}
                    <div className="text-center md:text-left">
                        <h3 className="mb-4 font-serif text-2xl font-bold text-sage-gray">TMM Bienestar</h3>
                        <p className="mb-6 text-charcoal-gray/80 leading-relaxed">
                            Crea, sana y conecta desde tus manos. Un espacio pensado para tu bienestar y creatividad.
                        </p>
                        <div className="flex justify-center space-x-4 md:justify-start">
                            <a href="#" className="text-sage-gray transition-colors hover:text-charcoal-gray">
                                <InstagramLogo weight="light" className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-sage-gray transition-colors hover:text-charcoal-gray">
                                <Envelope weight="light" className="h-6 w-6" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center md:text-left">
                        <h4 className="mb-4 font-serif text-lg font-bold text-sage-gray">Enlaces Rápidos</h4>
                        <ul className="space-y-3">
                            <li><a href="/workshops" className="text-charcoal-gray/80 hover:text-sage-gray transition-colors">Talleres Presenciales</a></li>
                            <li><a href="/courses" className="text-charcoal-gray/80 hover:text-sage-gray transition-colors">Cursos Grabados</a></li>
                            <li><a href="/blog" className="text-charcoal-gray/80 hover:text-sage-gray transition-colors">Blog de Bienestar</a></li>
                            <li><a href="/about" className="text-charcoal-gray/80 hover:text-sage-gray transition-colors">Sobre Mí</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="text-center md:text-left">
                        <h4 className="mb-4 font-serif text-lg font-bold text-sage-gray">Contacto</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center justify-center gap-3 text-charcoal-gray/80 md:justify-start">
                                <MapPin weight="light" className="h-5 w-5 text-sage-gray" />
                                <span>Santiago, Chile</span>
                            </li>
                            <li className="flex items-center justify-center gap-3 text-charcoal-gray/80 md:justify-start">
                                <Envelope weight="light" className="h-5 w-5 text-sage-gray" />
                                <span>contacto@tmmbienestar.cl</span>
                            </li>
                            <li className="flex items-center justify-center gap-3 text-charcoal-gray/80 md:justify-start">
                                <Phone weight="light" className="h-5 w-5 text-sage-gray" />
                                <span>+56 9 1234 5678</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="text-center md:text-left">
                        <h4 className="mb-4 font-serif text-lg font-bold text-sage-gray">Newsletter</h4>
                        <p className="mb-4 text-sm text-charcoal-gray/80">
                            Recibe consejos de bienestar y novedades de nuestros talleres.
                        </p>
                        <form onSubmit={handleSubscribe} className="space-y-2">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Tu correo electrónico"
                                    className="w-full rounded-lg border border-silver-gray bg-white/50 px-4 py-2 text-sm text-charcoal-gray placeholder-support-medium focus:border-sage-gray focus:outline-none focus:ring-1 focus:ring-sage-gray"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1 rounded-md p-1 text-sage-gray hover:bg-butter-yellow/50 hover:text-charcoal-gray transition-colors h-auto w-auto"
                                >
                                    <PaperPlaneRight weight="light" className="h-4 w-4" />
                                </Button>
                            </div>
                            {status === 'success' && <p className="text-xs text-green-600">{message}</p>}
                            {status === 'error' && <p className="text-xs text-red-500">{message}</p>}
                        </form>
                    </div>
                </div>

                <div className="border-t border-silver-gray pt-8 text-center">
                    <p className="text-sm text-support-medium">
                        © {new Date().getFullYear()} TMM Bienestar y Conexión. Todos los derechos reservados.
                    </p>
                    <p className="mt-2 text-sm font-medium text-sage-gray">
                        “Recuerden, más que una página, estamos construyendo un espacio de bienestar y conexión 🌿”
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
