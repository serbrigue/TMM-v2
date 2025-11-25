import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, MapPin, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import ItemCard from '../components/ItemCard';

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
                const response = await axios.get('http://localhost:8000/api/public/talleres/');
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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando talleres...</div>;

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Talleres Presenciales"
                    description="Espacios de aprendizaje y conexión. Ven a crear con tus manos y compartir con otras mujeres."
                />

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${selectedCategory === category
                                ? 'bg-brand-calypso text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-brand-pink/30'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Workshop Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredWorkshops.map((workshop) => {
                        const enrolled = isEnrolledInWorkshop(workshop.id);
                        return (
                            <ItemCard
                                key={workshop.id}
                                title={workshop.nombre}
                                description={workshop.descripcion}
                                image={workshop.imagen}
                                category={workshop.categoria_nombre}
                                isEnrolled={enrolled}
                                price={parseInt(workshop.precio)}
                                onClick={() => navigate(`/workshops/${workshop.id}`)}
                                buttonText={enrolled ? "Ver Detalles" : "Inscribirme"}
                                showPriceIcon={true}
                                metadata={
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="w-4 h-4 mr-2 text-brand-pink" />
                                            {workshop.fecha_taller}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Clock className="w-4 h-4 mr-2 text-brand-pink" />
                                            {workshop.hora_taller}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <MapPin className="w-4 h-4 mr-2 text-brand-pink" />
                                            {workshop.modalidad}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Star className="w-4 h-4 mr-2 text-brand-yellow fill-current" />
                                            {workshop.rating}
                                        </div>
                                    </div>
                                }
                            />
                        );
                    })}
                </div>

                {filteredWorkshops.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No hay talleres disponibles en esta categoría por el momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Workshops;
