import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaintBrush, FlowerLotus, Sparkle, ArrowRight, Quotes, Users, HandHeart } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import NewsletterModal from '../components/NewsletterModal';

const images = [
    '/manos_1.jpg',
    '/manos_2.jpg',
    '/manos_3.jpg'
];

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
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="flex flex-col bg-tmm-white min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32 bg-tmm-pink/20">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-tmm-yellow/30 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-tmm-green/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                        {/* Text Content */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="text-center lg:text-left"
                        >
                            <motion.span variants={fadeInUp} className="inline-block px-4 py-1 mb-4 text-sm font-bold tracking-wider uppercase bg-white/50 rounded-full text-tmm-black/70">
                                Bienestar • Conexión • Creatividad
                            </motion.span>
                            <motion.h1
                                variants={fadeInUp}
                                className="mb-6 font-serif text-5xl font-bold leading-tight text-tmm-black md:text-6xl lg:text-7xl"
                            >
                                Más que una página, <br />
                                <span className="italic text-tmm-black/80">un espacio de bienestar.</span>
                            </motion.h1>
                            <motion.p
                                variants={fadeInUp}
                                className="mb-8 text-xl text-tmm-black/70 lg:max-w-lg"
                            >
                                Diseñamos experiencias de creatividad y conexión para empresas y mujeres que buscan un refugio para crear y compartir.
                            </motion.p>
                            <motion.div variants={fadeInUp} className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                                <Link to="/workshops">
                                    <Button variant="primary" size="lg" className="w-full sm:w-auto bg-tmm-pink text-tmm-black hover:bg-tmm-pink/80 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-none">
                                        Ver Talleres
                                    </Button>
                                </Link>
                                <Link to="/contacto">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-tmm-black/20 text-tmm-black hover:bg-white/50">
                                        Para Empresas
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>

                        {/* Visual (Images) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative mx-auto w-full max-w-lg lg:max-w-none"
                        >
                            <div className="relative aspect-square w-full overflow-hidden rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] shadow-2xl ring-1 ring-tmm-pink/50 md:aspect-[4/3] bg-white">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={currentImage}
                                        src={images[currentImage]}
                                        alt="Taller de manualidades"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 1 }}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </AnimatePresence>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -bottom-10 -left-10 -z-10 h-64 w-64 rounded-full bg-tmm-yellow/40 blur-3xl filter"></div>
                            <div className="absolute -right-10 -top-10 -z-10 h-64 w-64 rounded-full bg-tmm-green/40 blur-3xl filter"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Nuestra Esencia (Storytelling) */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
                    <Quotes weight="fill" className="absolute -top-8 left-1/2 h-24 w-24 -translate-x-1/2 text-tmm-pink/30 md:-top-12 md:h-32 md:w-32" />
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="mb-8 font-serif text-3xl font-bold text-tmm-black md:text-4xl">
                            Nuestra Esencia
                        </h2>
                        <p className="text-xl leading-relaxed text-tmm-black/80 md:text-2xl font-light">
                            "En TMM creemos que el bienestar se construye desde la creatividad, la conexión y el cuidado personal. Nacimos como un refugio para aprender y crear, y hoy llevamos esa experiencia transformadora al mundo laboral."
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Servicios (B2B & B2C) */}
            <section className="py-24 bg-tmm-green/10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="font-serif text-3xl font-bold text-tmm-black md:text-4xl">Líneas de Trabajo</h2>
                        <p className="mt-4 text-tmm-black/70">Experiencias pensadas para cada necesidad</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* B2C */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <Card className="h-full bg-white border-tmm-pink/20" hoverEffect={true}>
                                <div className="w-12 h-12 bg-tmm-pink/30 rounded-full flex items-center justify-center mb-6 text-tmm-black">
                                    <HandHeart size={32} />
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-tmm-black mb-4">Para Personas (B2C)</h3>
                                <p className="text-tmm-black/70 mb-6">
                                    Talleres de manualidades presenciales en Valparaíso y alrededores. Grupos reducidos en un ambiente cercano, cálido y seguro.
                                </p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-2 text-sm text-tmm-black/80">
                                        <Sparkle className="text-tmm-black" /> Resina, encuadernación, timbres
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-tmm-black/80">
                                        <Sparkle className="text-tmm-black" /> Comunidad activa y asesoría post curso
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-tmm-black/80">
                                        <Sparkle className="text-tmm-black" /> Venta de kits e insumos
                                    </li>
                                </ul>
                                <Link to="/workshops">
                                    <Button className="w-full bg-tmm-pink text-tmm-black hover:bg-tmm-pink/80 border-none">Ver Talleres</Button>
                                </Link>
                            </Card>
                        </motion.div>

                        {/* B2B */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <Card className="h-full bg-white border-tmm-green/20" hoverEffect={true}>
                                <div className="w-12 h-12 bg-tmm-green/30 rounded-full flex items-center justify-center mb-6 text-tmm-black">
                                    <Users size={32} />
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-tmm-black mb-4">Para Empresas (B2B)</h3>
                                <p className="text-tmm-black/70 mb-6">
                                    Talleres de bienestar y autocuidado para equipos. Fortalecemos el compañerismo y mejoramos el clima laboral.
                                </p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-2 text-sm text-tmm-black/80">
                                        <Sparkle className="text-tmm-black" /> Manualidades y aromaterapia
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-tmm-black/80">
                                        <Sparkle className="text-tmm-black" /> Automaquillaje y masajes express
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-tmm-black/80">
                                        <Sparkle className="text-tmm-black" /> Propuestas personalizadas
                                    </li>
                                </ul>
                                <Link to="/contacto">
                                    <Button className="w-full bg-tmm-green text-tmm-black hover:bg-tmm-green/80 border-none">Cotizar para Empresa</Button>
                                </Link>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Talleres Preview */}
            <section className="py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="font-serif text-3xl font-bold text-tmm-black md:text-4xl">Descubre TMM</h2>
                        <p className="mt-4 text-tmm-black/70">Actividades pensadas para ti</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                title: "Resina y Creatividad",
                                icon: PaintBrush,
                                description: "Aprende a crear piezas únicas con resina epóxica.",
                                link: "/workshops"
                            },
                            {
                                title: "Velas y Aromas",
                                icon: FlowerLotus,
                                description: "El arte de crear ambientes a través de los aromas.",
                                link: "/workshops"
                            },
                            {
                                title: "Automaquillaje",
                                icon: Sparkle,
                                description: "Descubre tu belleza natural y potencia tu confianza.",
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
                                    <Card className="h-full flex flex-col items-center text-center group cursor-pointer bg-white border border-tmm-pink/10 hover:border-tmm-pink/50 transition-colors" hoverEffect={true}>
                                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-tmm-white group-hover:bg-tmm-pink/20 transition-colors shadow-sm text-tmm-black">
                                            <service.icon weight="light" className="h-8 w-8" />
                                        </div>
                                        <h3 className="mb-3 font-serif text-xl font-bold text-tmm-black group-hover:text-tmm-black/70 transition-colors">
                                            {service.title}
                                        </h3>
                                        <p className="mb-6 text-sm text-tmm-black/70">
                                            {service.description}
                                        </p>
                                        <div className="mt-auto opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                            <span className="text-sm font-medium text-tmm-black flex items-center gap-2">
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
