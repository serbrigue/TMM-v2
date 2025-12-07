import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CalendarBlank, Clock, MapPin, Sparkle, Smiley, HandsClapping } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { API_URL } from '../config/api';

const CATEGORIES = ["Todas", "Resina", "Encuadernación", "Bienestar", "Decoración"];

const Workshops = () => {
    const { isEnrolledInWorkshop } = useAuth();
    const navigate = useNavigate();
    const [workshops, setWorkshops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("Todas");

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {

                const response = await axios.get(`${API_URL}/public/talleres/`);
                setWorkshops(response.data);
            } catch (error) {
                console.error("Error fetching workshops", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkshops();
    }, []);

    const filteredWorkshops = selectedCategory === "Todas"
        ? workshops
        : workshops.filter(w => w.categoria_nombre === selectedCategory);

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-tmm-white">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-tmm-pink border-t-transparent"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-tmm-white py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h1 className="mb-4 font-serif text-4xl font-bold text-tmm-black md:text-5xl">Talleres Presenciales</h1>
                    <p className="mx-auto max-w-2xl text-lg text-tmm-black/80">
                        Espacios de aprendizaje y conexión. Ven a crear con tus manos y compartir con otras mujeres.
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-12 flex flex-wrap justify-center gap-3">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`rounded-full border px-6 py-2 text-sm font-medium transition-all duration-300 ${selectedCategory === category
                                ? 'border-tmm-pink bg-tmm-pink text-tmm-black shadow-sm'
                                : 'border-tmm-black/20 bg-transparent text-tmm-black hover:border-tmm-pink hover:bg-tmm-pink/10'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Workshop Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {filteredWorkshops.map((workshop) => {
                        const enrolled = isEnrolledInWorkshop(workshop.id);
                        return (
                            <motion.div
                                key={workshop.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="group h-full overflow-hidden bg-white p-0 border border-tmm-pink/20 hover:border-tmm-pink/50 transition-colors">
                                    {/* Image */}
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={workshop.imagen}
                                            alt={workshop.nombre}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-tmm-black backdrop-blur-sm">
                                            {workshop.categoria_nombre}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3 className="mb-2 font-serif text-xl font-bold text-tmm-black group-hover:text-tmm-pink transition-colors">
                                            {workshop.nombre}
                                        </h3>
                                        <p className="mb-4 line-clamp-2 text-sm text-tmm-black/70">
                                            {workshop.descripcion}
                                        </p>

                                        <div className="mb-6 space-y-2">
                                            <div className="flex items-center text-sm text-tmm-black/60">
                                                <CalendarBlank className="mr-2 h-4 w-4 text-tmm-black" />
                                                {workshop.fecha_taller}
                                            </div>
                                            <div className="flex items-center text-sm text-tmm-black/60">
                                                <Clock className="mr-2 h-4 w-4 text-tmm-black" />
                                                {workshop.hora_taller}
                                            </div>
                                            <div className="flex items-center text-sm text-tmm-black/60">
                                                <MapPin className="mr-2 h-4 w-4 text-tmm-black" />
                                                {workshop.modalidad}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="font-serif text-lg font-bold text-tmm-black">
                                                ${parseInt(workshop.precio).toLocaleString('es-CL')}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/talleres/${workshop.id}`)}
                                                className="text-tmm-black hover:bg-tmm-pink/20 hover:text-tmm-black"
                                            >
                                                {enrolled ? "Ver Detalles" : "Ver detalles"}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {filteredWorkshops.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-lg text-tmm-black/60">No hay talleres disponibles en esta categoría por el momento.</p>
                    </div>
                )}

                {/* Impact Section */}
                <div className="mt-24 border-t border-tmm-pink/20 pt-16">
                    <div className="grid gap-12 md:grid-cols-3 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-tmm-yellow/20 text-tmm-black">
                                <Sparkle weight="light" className="h-8 w-8" />
                            </div>
                            <h3 className="mb-2 font-serif text-lg font-bold text-tmm-black">Fomenta la creatividad</h3>
                            <p className="text-sm text-tmm-black/80">Despierta tu lado artístico y explora nuevas formas de expresión.</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-tmm-green/20 text-tmm-black">
                                <Smiley weight="light" className="h-8 w-8" />
                            </div>
                            <h3 className="mb-2 font-serif text-lg font-bold text-tmm-black">Relajación y Desconexión</h3>
                            <p className="text-sm text-tmm-black/80">Un espacio seguro para pausar, respirar y conectar contigo misma.</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-tmm-pink/20 text-tmm-black">
                                <HandsClapping weight="light" className="h-8 w-8" />
                            </div>
                            <h3 className="mb-2 font-serif text-lg font-bold text-tmm-black">Fortalece el equipo</h3>
                            <p className="text-sm text-tmm-black/80">Comparte experiencias significativas y crea lazos duraderos.</p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Workshops;
