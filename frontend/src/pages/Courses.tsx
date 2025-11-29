import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { PlayCircle, Clock, Star, ArrowRight } from '@phosphor-icons/react';
import { Button } from '../components/ui/Button';

const Courses = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/public/cursos/');
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
        <div className="min-h-screen flex items-center justify-center bg-cloud-pink">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-gray"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-cloud-pink">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-sage-gray/5 pattern-grid-lg opacity-50"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-white/50 border border-silver-gray text-sage-gray text-sm font-medium mb-6 backdrop-blur-sm"
                        >
                            Formación Online
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-serif font-bold text-sage-gray mb-6 leading-tight"
                        >
                            Transforma tu Negocio a tu Ritmo
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-charcoal-gray/80 mb-8 leading-relaxed"
                        >
                            Cursos grabados diseñados para emprendedoras que buscan resultados reales.
                            Aprende estrategias de marketing, ventas y mentalidad desde donde estés.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-white rounded-3xl overflow-hidden border border-silver-gray hover:shadow-xl transition-all duration-300 flex flex-col"
                            >
                                {/* Image Container */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                    {course.imagen ? (
                                        <img
                                            src={course.imagen}
                                            alt={course.titulo}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-sage-gray/10">
                                            <PlayCircle className="w-16 h-16 text-sage-gray/30" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-sage-gray uppercase tracking-wider shadow-sm">
                                            {course.categoria_nombre || 'Curso'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="mb-4 flex items-center gap-4 text-sm text-charcoal-gray/60">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {course.duracion}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-4 h-4 text-butter-yellow weight-fill" />
                                            {course.rating}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-serif font-bold text-sage-gray mb-3 group-hover:text-charcoal-gray transition-colors">
                                        {course.titulo}
                                    </h3>

                                    <p className="text-charcoal-gray/70 mb-6 line-clamp-2 flex-1">
                                        {course.descripcion}
                                    </p>

                                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-charcoal-gray/50 uppercase font-bold tracking-wider">Inversión</span>
                                            <span className="text-xl font-bold text-sage-gray">
                                                ${parseInt(course.precio).toLocaleString('es-CL')}
                                            </span>
                                        </div>
                                        <Link to={`/courses/${course.id}`}>
                                            <Button variant="outline" className="group-hover:bg-sage-gray group-hover:text-white group-hover:border-sage-gray">
                                                Ver Detalles
                                                <ArrowRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {courses.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-xl text-sage-gray">Próximamente nuevos cursos disponibles.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Courses;
