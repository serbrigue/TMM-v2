import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, MapPin, CheckCircle, Users, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import ReviewSection from '../components/ReviewSection';

const WorkshopDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [workshop, setWorkshop] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    const [enrollmentId, setEnrollmentId] = useState<number | null>(null);

    const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorkshop = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/public/talleres/${id}/`);
                setWorkshop(response.data);
            } catch (error) {
                console.error("Error fetching workshop", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkshop();
    }, [id]);

    useEffect(() => {
        if (isAuthenticated && id) {
            checkEnrollment();
        }
    }, [isAuthenticated, id]);

    const checkEnrollment = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('http://localhost:8000/api/my-enrollments/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const enrolledWorkshop = response.data.talleres.find((t: any) => t.taller.id === parseInt(id!));
            if (enrolledWorkshop) {
                setIsEnrolled(true);
                setEnrollmentId(enrolledWorkshop.id);
                setEnrollmentStatus(enrolledWorkshop.estado_pago);
            }
        } catch (error) {
            console.error("Error checking enrollment", error);
        }
    };

    const handleEnroll = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post('http://localhost:8000/api/enroll/', {
                tipo: 'taller',
                id: workshop.id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.id) {
                setEnrollmentId(response.data.id);
                return response.data.id;
            }
        } catch (error) {
            console.error("Error creating enrollment", error);
            alert("Hubo un error al crear la inscripción. Por favor intenta nuevamente.");
            throw error;
        }
    };

    // ... (rest of the file)



    const onEnrollClick = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/workshops/${id}` } });
            return;
        }
        if (isEnrolled) {
            if (enrollmentStatus === 'PENDIENTE') {
                alert("Tu inscripción está pendiente de verificación de pago. Te notificaremos cuando sea aprobada.");
                return;
            }
            // Navigate to workshop view if applicable, or just show enrolled status
        } else {
            setIsPaymentOpen(true);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    if (!workshop) return <div className="min-h-screen flex items-center justify-center">Taller no encontrado</div>;

    return (
        <div className="min-h-screen bg-primary pb-20">
            {/* Hero Section */}
            <div className="bg-contrast text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-4">
                                {workshop.categoria_nombre || 'Taller Presencial'}
                            </span>
                            {isEnrolled && (
                                <div className="inline-block ml-2 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold">
                                    <CheckCircle className="w-4 h-4 inline mr-1" />
                                    Ya estás inscrito
                                </div>
                            )}
                            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 leading-tight">
                                {workshop.nombre}
                            </h1>
                            <p className="text-xl text-white/90 mb-8 leading-relaxed">
                                {workshop.descripcion}
                            </p>
                            <div className="flex flex-wrap gap-6 text-sm text-white/90 mb-8">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    {workshop.fecha_taller}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    {workshop.hora_taller}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    {workshop.modalidad}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    {workshop.cupos_disponibles} cupos disponibles
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={onEnrollClick}
                                    disabled={isEnrolled}
                                    className={`px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${isEnrolled
                                        ? 'bg-gray-400 cursor-not-allowed text-white'
                                        : 'bg-accent text-gray-900 hover:bg-accent/90 shadow-accent/30'
                                        }`}
                                >
                                    {isEnrolled
                                        ? (enrollmentStatus === 'PENDIENTE' ? 'Verificación Pendiente' : '✓ Inscrito')
                                        : `Reservar mi cupo - $${parseInt(workshop.precio).toLocaleString('es-CL')}`
                                    }
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                                {workshop.imagen ? (
                                    <img src={workshop.imagen} alt={workshop.nombre} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                        <Calendar className="w-20 h-20 text-white/50" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-primary/10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sobre este taller</h2>
                            <div className="prose max-w-none">
                                <p className="text-gray-600 leading-relaxed">
                                    {workshop.descripcion}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-primary/10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Lo que aprenderás</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                        <p className="text-gray-600">Técnicas especializadas y herramientas profesionales.</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <ReviewSection workshopId={parseInt(id!)} categoryId={workshop.categoria} />
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Detalles del taller</h3>
                            <ul className="space-y-4 text-gray-600">
                                <li className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <span>{workshop.fecha_taller}</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    <span>{workshop.hora_taller}</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <span>{workshop.modalidad}</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-gray-400" />
                                    <span>{workshop.cupos_disponibles} cupos disponibles</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Star className="w-5 h-5 text-accent fill-current" />
                                    <span className="font-bold">{workshop.rating}</span>
                                    <span className="text-xs text-gray-500">(Categoría)</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                onConfirm={handleEnroll}
                amount={parseInt(workshop.precio)}
                itemName={workshop.nombre}
                enrollmentId={enrollmentId}
                itemType="taller"
            />
        </div >
    );
};

export default WorkshopDetail;
