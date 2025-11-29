import { motion } from 'framer-motion';
import { Heart, Sparkle, Users } from '@phosphor-icons/react';

const About = () => {
    const timelineEvents = [
        {
            year: "2018",
            title: "Inicio de los talleres",
            description: "Comencé impartiendo clases de resina en el living de mi casa, con la convicción de que crear con las manos sana el alma."
        },
        {
            year: "2020",
            title: "Crecimiento de la comunidad",
            description: "En medio de la incertidumbre, nuestra comunidad online creció exponencialmente, convirtiéndose en un refugio para muchas mujeres."
        },
        {
            year: "2023",
            title: "Salto al mundo corporativo",
            description: "Llevamos la experiencia TMM a empresas, demostrando que el bienestar creativo es fundamental para equipos saludables."
        }
    ];

    return (
        <div className="min-h-screen bg-cloud-pink">
            {/* Split Hero Section */}
            <section className="relative flex flex-col md:flex-row min-h-[90vh]">
                {/* Left: Image */}
                <div className="w-full md:w-1/2 relative h-[50vh] md:h-auto overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                        alt="Fundadora TMM"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-sage-gray/10 mix-blend-multiply"></div>
                </div>

                {/* Right: Content */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-cloud-pink">
                    <div className="max-w-lg">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-sage-gray mb-8">
                                Hola, soy <span className="italic text-charcoal-gray">Tu Nombre</span>
                            </h1>

                            <div className="prose prose-lg text-charcoal-gray/80">
                                <p className="leading-relaxed">
                                    <span className="float-left mr-3 mt-[-6px] text-6xl font-serif font-bold text-sage-gray leading-none">B</span>
                                    ienvenida a este espacio. Soy la fundadora de TMM Bienestar y Conexión. Mi misión es acompañarte a descubrir el poder sanador de tus propias manos.
                                </p>
                                <p className="leading-relaxed mt-6">
                                    Creo firmemente que la creatividad no es un don reservado para unos pocos, sino una herramienta de bienestar disponible para todos. Aquí no buscamos la perfección, buscamos la conexión.
                                </p>
                            </div>

                            <div className="mt-12 flex gap-8">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-white/50 rounded-full text-sage-gray">
                                        <Heart size={24} weight="light" />
                                    </div>
                                    <span className="text-sm font-medium text-charcoal-gray">Pasión</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-white/50 rounded-full text-sage-gray">
                                        <Sparkle size={24} weight="light" />
                                    </div>
                                    <span className="text-sm font-medium text-charcoal-gray">Creatividad</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-white/50 rounded-full text-sage-gray">
                                        <Users size={24} weight="light" />
                                    </div>
                                    <span className="text-sm font-medium text-charcoal-gray">Comunidad</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-24 bg-white/40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-sage-gray mb-4">Mi Historia</h2>
                        <p className="text-charcoal-gray/70">El camino que nos trajo hasta aquí</p>
                    </div>

                    <div className="relative">
                        {/* Vertical Line */}
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-sage-gray/30 transform md:-translate-x-1/2"></div>

                        <div className="space-y-12">
                            {timelineEvents.map((event, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    className={`relative flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''
                                        }`}
                                >
                                    {/* Content */}
                                    <div className="md:w-1/2 pl-12 md:pl-0">
                                        <div className={`bg-white p-6 rounded-xl shadow-sm border border-silver-gray ${index % 2 === 0 ? 'md:mr-12' : 'md:ml-12'
                                            }`}>
                                            <span className="inline-block px-3 py-1 bg-butter-yellow/30 text-charcoal-gray rounded-full text-sm font-bold mb-3">
                                                {event.year}
                                            </span>
                                            <h3 className="font-serif text-xl font-bold text-sage-gray mb-2">{event.title}</h3>
                                            <p className="text-charcoal-gray/80 text-sm leading-relaxed">
                                                {event.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dot */}
                                    <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-butter-yellow rounded-full border-2 border-white shadow-sm transform -translate-x-1/2 mt-6 z-10"></div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Studio Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-sage-gray mb-12">Nuestro Espacio</h2>
                    <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-video md:aspect-[21/9]">
                        <img
                            src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                            alt="TMM Studio"
                            className="w-full h-full object-cover sepia-[.10]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-gray/80 via-transparent to-transparent flex items-end justify-start p-8 md:p-12">
                            <p className="text-white text-xl md:text-2xl font-serif italic">"Un lugar luminoso y acogedor diseñado para inspirarte."</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
