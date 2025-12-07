import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { PlayCircle, Clock, Star, ArrowRight } from '@phosphor-icons/react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { API_URL } from '../config/api';

const Courses = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {

                const response = await axios.get(`${API_URL}/public/cursos/`);
                setCourses(response.data);
            } catch (error) {
                console.error("Error fetching courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-tmm-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tmm-pink"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-tmm-white">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden bg-tmm-pink/10">
                <div className="absolute inset-0 bg-tmm-pink/5 pattern-grid-lg opacity-50"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-white/50 border border-tmm-pink/20 text-tmm-black text-sm font-medium mb-6 backdrop-blur-sm"
                        >
                            Formación Online
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-serif font-bold text-tmm-black mb-6 leading-tight"
                        >
                            Transforma tu Negocio a tu Ritmo
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-tmm-black/80 mb-8 leading-relaxed"
                        >
                            Cursos grabados diseñados para emprendedoras que buscan resultados reales.
                            Aprende estrategias de marketing, ventas y mentalidad desde donde estés.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="pb-24 px-4 sm:px-6 lg:px-8 pt-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="h-full flex flex-col overflow-hidden p-0 border-tmm-pink/20 bg-white" hoverEffect={true}>
                                    {/* Image Container */}
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                        {course.imagen ? (
                                            <img
                                                src={course.imagen}
                                                alt={course.titulo}
                                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-tmm-pink/10">
                                                <PlayCircle className="w-16 h-16 text-tmm-pink/50" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-tmm-black uppercase tracking-wider shadow-sm">
                                                {course.categoria_nombre || 'Curso'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="mb-4 flex items-center gap-4 text-sm text-tmm-black/60">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                {course.duracion}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Star className="w-4 h-4 text-tmm-yellow weight-fill" />
                                                {course.rating}
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-serif font-bold text-tmm-black mb-3 hover:text-tmm-pink transition-colors">
                                            {course.titulo}
                                        </h3>

                                        <p className="text-tmm-black/70 mb-6 line-clamp-2 flex-1">
                                            {course.descripcion}
                                        </p>

                                        <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-tmm-black/50 uppercase font-bold tracking-wider">Inversión</span>
                                                <span className="text-xl font-bold text-tmm-black">
                                                    ${parseInt(course.precio).toLocaleString('es-CL')}
                                                </span>
                                            </div>
                                            <Link to={`/cursos/${course.id}`}>
                                                <Button variant="outline" className="hover:bg-tmm-pink hover:text-tmm-black hover:border-tmm-pink">
                                                    Ver Detalles
                                                    <ArrowRight className="ml-2 w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {courses.length === 0 && (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-tmm-pink/20 mb-6">
                                <PlayCircle className="w-8 h-8 text-tmm-pink" weight="fill" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-tmm-black mb-2">Próximamente</h3>
                            <p className="text-xl text-tmm-black/60 max-w-md mx-auto">
                                Estamos preparando nuevos cursos para ti. ¡Vuelve pronto para descubrir más contenido!
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Courses;
