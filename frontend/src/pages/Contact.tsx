import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        asunto: 'Consulta General',
        mensaje: ''
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await axios.post('http://localhost:8000/api/contact/', formData);
            setStatus('success');
            setFormData({
                nombre: '',
                apellido: '',
                email: '',
                asunto: 'Consulta General',
                mensaje: ''
            });
        } catch (error) {
            console.error("Error sending message", error);
            setStatus('error');
        }
    };

    return (
        <div className="bg-brand-pink/10 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">Hablemos</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        ¿Tienes dudas sobre un taller? ¿Quieres colaborar? Estoy aquí para escucharte.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Contact Info */}
                    <div className="bg-brand-calypso p-12 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>

                        <div>
                            <h2 className="text-3xl font-heading font-bold mb-6">Información de Contacto</h2>
                            <p className="text-white/90 mb-12 text-lg">
                                Puedes escribirme directamente o llenar el formulario. Respondo todos los mensajes con mucho cariño.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-80">Email</p>
                                        <p className="font-medium">contacto@tmmbienestar.cl</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-80">WhatsApp</p>
                                        <p className="font-medium">+56 9 1234 5678</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-80">Ubicación</p>
                                        <p className="font-medium">Providencia, Santiago, Chile</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <p className="italic opacity-80">
                                “Recuerden, más que una página, estamos construyendo un espacio de bienestar y conexión 🌿”
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-12">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {status === 'success' && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                                    ¡Mensaje enviado con éxito! Te responderé pronto.
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                    Hubo un error al enviar el mensaje. Por favor intenta nuevamente.
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-calypso focus:border-transparent outline-none transition-all"
                                        placeholder="Tu nombre"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                                    <input
                                        type="text"
                                        id="apellido"
                                        value={formData.apellido}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-calypso focus:border-transparent outline-none transition-all"
                                        placeholder="Tu apellido"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-calypso focus:border-transparent outline-none transition-all"
                                    placeholder="tucorreo@ejemplo.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-2">Asunto</label>
                                <select
                                    id="asunto"
                                    value={formData.asunto}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-calypso focus:border-transparent outline-none transition-all"
                                >
                                    <option>Consulta General</option>
                                    <option>Inscripción a Taller</option>
                                    <option>Colaboraciones</option>
                                    <option>Otro</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                                <textarea
                                    id="mensaje"
                                    rows={4}
                                    value={formData.mensaje}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-calypso focus:border-transparent outline-none transition-all"
                                    placeholder="¿En qué puedo ayudarte?"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className={`w-full bg-brand-pink text-gray-900 font-bold py-4 rounded-lg hover:bg-brand-pink/80 transition-all flex items-center justify-center gap-2 ${status === 'sending' ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {status === 'sending' ? 'Enviando...' : 'Enviar Mensaje'}
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
