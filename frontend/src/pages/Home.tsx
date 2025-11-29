import { motion } from 'framer-motion';
import { PaintBrush, FlowerLotus, Sparkle, ArrowRight, Quotes } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import NewsletterModal from '../components/NewsletterModal';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const Home = () => {
    return (
        <div className="flex flex-col bg-cloud-pink min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                        {/* Text Content */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="text-center lg:text-left"
                        >
                            <motion.h1
                                variants={fadeInUp}
                                className="mb-6 font-serif text-5xl font-bold leading-tight text-sage-gray md:text-6xl lg:text-7xl"
                            >
                                Bienestar que se <br />
                                <span className="italic text-charcoal-gray">crea con las manos.</span>
                            </motion.h1>
                            <motion.p
                                variants={fadeInUp}
                                className="mb-8 text-xl text-charcoal-gray/80 lg:max-w-lg"
                            >
                                Transformamos equipos a través de la creatividad, la conexión y el cuidado personal.
                            </motion.p>
                            <motion.div variants={fadeInUp} className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                                <Link to="/contact">
                                    <Button variant="primary" size="lg" className="w-full sm:w-auto text-charcoal-gray shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                                        Cotizar Experiencia
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>

                        {/* Visual (Video Blob) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative mx-auto w-full max-w-lg lg:max-w-none"
                        >
                            <div className="relative aspect-square w-full overflow-hidden rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] shadow-2xl ring-1 ring-silver-gray/50 md:aspect-[4/3]">
                                {/* Placeholder for Video - Using a gradient for now */}
                                <div className="absolute inset-0 bg-gradient-to-br from-sage-gray/20 to-cloud-pink/50 animate-blob bg-[length:200%_200%]"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="font-serif text-lg italic text-sage-gray/50">[Video Loop: Manos trabajando]</span>
                                </div>
                                {/* Overlay texture or effect */}
                                <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay"></div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -bottom-10 -left-10 -z-10 h-64 w-64 rounded-full bg-butter-yellow/30 blur-3xl filter"></div>
                            <div className="absolute -right-10 -top-10 -z-10 h-64 w-64 rounded-full bg-white/40 blur-3xl filter"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Nuestra Esencia (Storytelling) */}
            <section className="py-24 bg-white/50 relative overflow-hidden">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
                    <Quotes weight="fill" className="absolute -top-8 left-1/2 h-24 w-24 -translate-x-1/2 text-butter-yellow/40 md:-top-12 md:h-32 md:w-32" />
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="mb-8 font-serif text-3xl font-bold text-sage-gray md:text-4xl">
                            Nuestra Esencia
                        </h2>
                        <p className="text-xl leading-relaxed text-charcoal-gray md:text-2xl font-light">
                            "Nacimos como un espacio de talleres... Hoy, llevamos esa experiencia transformadora al mundo laboral, convencidos de que el bienestar no es un lujo, sino una necesidad creativa."
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Servicios (Preview) */}
            <section className="py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="font-serif text-3xl font-bold text-sage-gray md:text-4xl">Nuestras Experiencias</h2>
                        <p className="mt-4 text-charcoal-gray/80">Descubre cómo podemos potenciar a tu equipo</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                title: "Talleres Creativos",
                                icon: PaintBrush,
                                description: "Cerámica, resina, pintura y más. Conecta con el hacer manual.",
                                link: "/workshops"
                            },
                            {
                                title: "Spa Corporativo",
                                icon: FlowerLotus,
                                description: "Momentos de relajación y autocuidado en la oficina.",
                                link: "/services"
                            },
                            {
                                title: "Automaquillaje",
                                icon: Sparkle,
                                description: "Herramientas para potenciar la imagen y la confianza.",
                                link: "/workshops"
                            }
                        ].map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                            >
                                <Link to={service.link}>
                                    <Card className="h-full flex flex-col items-center text-center group cursor-pointer bg-white/30 backdrop-blur-sm">
                                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cloud-pink border border-silver-gray group-hover:border-sage-gray transition-colors shadow-sm">
                                            <service.icon weight="light" className="h-8 w-8 text-sage-gray group-hover:text-charcoal-gray transition-colors" />
                                        </div>
                                        <h3 className="mb-3 font-serif text-xl font-bold text-sage-gray group-hover:text-charcoal-gray transition-colors">
                                            {service.title}
                                        </h3>
                                        <p className="mb-6 text-sm text-charcoal-gray/80">
                                            {service.description}
                                        </p>
                                        <div className="mt-auto opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                            <span className="text-sm font-medium text-sage-gray flex items-center gap-2">
                                                Ver más <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <NewsletterModal />
        </div>
    );
};

export default Home;
