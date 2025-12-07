import { motion } from 'framer-motion';
import { Sparkle, Users, GraduationCap } from '@phosphor-icons/react';

const About = () => {
    const timelineEvents = [
        {
            year: "2018",
            title: "El Inicio",
            description: "Comencé impartiendo clases de resina en el living de mi casa, con la convicción de que crear con las manos sana el alma."
        },
        {
            year: "2020",
            title: "Comunidad Online",
            description: "En medio de la incertidumbre, nuestra comunidad creció exponencialmente, convirtiéndose en un refugio para muchas mujeres."
        },
        {
            year: "2023",
            title: "Expansión Corporativa",
            description: "Llevamos la experiencia TMM a empresas como UTFSM y PUCV, impactando a más de 230 personas."
        }
    ];

    return (
        <div className="min-h-screen bg-tmm-white">
            {/* Split Hero Section */}
            <section className="relative flex flex-col md:flex-row min-h-[90vh]">
                {/* Left: Image */}
                <div className="w-full md:w-1/2 relative h-[50vh] md:h-auto overflow-hidden">
                    <img
                        src="/dueña.png"
                        alt="Carolina López - Fundadora TMM"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-tmm-pink/10 mix-blend-multiply"></div>
                </div>

                {/* Right: Content */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-tmm-white">
                    <div className="max-w-lg">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-tmm-black mb-8">
                                Hola, soy <span className="italic text-tmm-pink">Carolina López</span>
                            </h1>

                            <div className="prose prose-lg text-tmm-black/80">
                                <p className="leading-relaxed">
                                    <span className="float-left mr-3 mt-[-6px] text-6xl font-serif font-bold text-tmm-pink leading-none">P</span>
                                    rofesora de matemáticas con más de 16 años de experiencia y fundadora de TMM Bienestar y Conexión.
                                </p>
                                <p className="leading-relaxed mt-6">
                                    Mi sello es la cercanía, la empatía y la conexión auténtica. He diseñado experiencias creativas que permiten a los equipos reconectarse y relajarse desde un enfoque humano y emocional.
                                </p>
                            </div>

                            <div className="mt-12 flex gap-8">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-tmm-pink/30 rounded-full text-tmm-black">
                                        <GraduationCap size={24} weight="light" />
                                    </div>
                                    <span className="text-sm font-medium text-tmm-black">Docencia</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-tmm-green/30 rounded-full text-tmm-black">
                                        <Sparkle size={24} weight="light" />
                                    </div>
                                    <span className="text-sm font-medium text-tmm-black">Creatividad</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-tmm-yellow/30 rounded-full text-tmm-black">
                                        <Users size={24} weight="light" />
                                    </div>
                                    <span className="text-sm font-medium text-tmm-black">Comunidad</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-24 bg-tmm-pink/10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-tmm-black mb-4">Mi Historia</h2>
                        <p className="text-tmm-black/70">El camino que nos trajo hasta aquí</p>
                    </div>

                    <div className="relative">
                        {/* Vertical Line */}
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-tmm-black/10 transform md:-translate-x-1/2"></div>

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
                                        <div className={`bg-white p-6 rounded-xl shadow-sm border border-tmm-pink/20 ${index % 2 === 0 ? 'md:mr-12' : 'md:ml-12'
                                            }`}>
                                            <span className="inline-block px-3 py-1 bg-tmm-yellow/30 text-tmm-black rounded-full text-sm font-bold mb-3">
                                                {event.year}
                                            </span>
                                            <h3 className="font-serif text-xl font-bold text-tmm-black mb-2">{event.title}</h3>
                                            <p className="text-tmm-black/80 text-sm leading-relaxed">
                                                {event.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dot */}
                                    <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-tmm-pink rounded-full border-2 border-white shadow-sm transform -translate-x-1/2 mt-6 z-10"></div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
