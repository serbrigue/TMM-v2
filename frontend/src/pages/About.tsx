import React from 'react';
import { Heart, Sparkles, Users } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 bg-brand-pink/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2">
                        <div className="relative">
                            <div className="absolute -top-4 -left-4 w-full h-full border-2 border-brand-calypso rounded-3xl transform -rotate-2"></div>
                            <img
                                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Fundadora TMM"
                                className="relative rounded-3xl shadow-lg w-full object-cover aspect-[4/5]"
                            />
                        </div>
                    </div>
                    <div className="md:w-1/2">
                        <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6">
                            Hola, soy <span className="text-brand-calypso">Tu Nombre</span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            Bienvenida a este espacio. Soy la fundadora de TMM Bienestar y Conexión. Mi misión es acompañarte a descubrir el poder sanador de tus propias manos.
                        </p>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Creo firmemente que la creatividad no es un don reservado para unos pocos, sino una herramienta de bienestar disponible para todos. Aquí no buscamos la perfección, buscamos la conexión.
                        </p>
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm">
                                <Heart className="w-8 h-8 text-brand-pink mb-2" />
                                <span className="font-bold text-gray-800">Pasión</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm">
                                <Sparkles className="w-8 h-8 text-brand-yellow mb-2" />
                                <span className="font-bold text-gray-800">Creatividad</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm">
                                <Users className="w-8 h-8 text-brand-mint mb-2" />
                                <span className="font-bold text-gray-800">Comunidad</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-brand-mint/10 p-10 rounded-3xl">
                            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">Mi Misión</h3>
                            <p className="text-gray-700">
                                Facilitar espacios seguros y amorosos donde las mujeres puedan reconectar con su poder creativo, reducir el estrés y encontrar calma a través de las artes manuales.
                            </p>
                        </div>
                        <div className="bg-brand-pink/20 p-10 rounded-3xl">
                            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">Mi Visión</h3>
                            <p className="text-gray-700">
                                Ser un referente en el bienestar creativo, construyendo una comunidad global de mujeres que se apoyan y crecen juntas a través del arte y la autoexpresión.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Studio Photo */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-heading font-bold text-gray-900 mb-12">Nuestro Espacio</h2>
                    <div className="relative rounded-3xl overflow-hidden shadow-xl">
                        <img
                            src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                            alt="TMM Studio"
                            className="w-full h-[500px] object-cover"
                        />
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-8 text-left">
                            <p className="text-white text-xl font-medium">Un lugar luminoso y acogedor diseñado para inspirarte.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
