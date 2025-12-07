import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarBlank, Clock, MapPin, CheckCircle, Users, Star, User, ListBullets, Target, ShieldCheck, Calendar } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import ReviewSection from '../components/ReviewSection';
import { API_URL } from '../config/api';

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
                const response = await axios.get(`${API_URL}/public/talleres/${id}/`);
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
            const response = await axios.get(`${API_URL}/my-enrollments/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Fix: Check if t.taller exists before accessing id
            const enrolledWorkshop = response.data.talleres.find((t: any) => t.taller && t.taller.id === parseInt(id!));
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
            const response = await axios.post(`${API_URL}/enroll/`, {
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
        <div className="min-h-screen bg-tmm-white pb-20">
            {/* Hero Section */}
            <div className="bg-tmm-pink/10 text-tmm-black py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-block px-3 py-1 bg-tmm-white/50 text-tmm-black rounded-full text-sm font-medium mb-4">
                                {workshop.categoria_nombre || 'Taller Presencial'}
                            </span>
                            {isEnrolled && (
                                <div className="inline-block ml-2 px-3 py-1 bg-tmm-green text-tmm-black rounded-full text-sm font-bold">
                                    <CheckCircle className="w-4 h-4 inline mr-1" />
                                    Ya estás inscrito
                                </div>
                            )}
                            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6 leading-tight">
                                {workshop.nombre}
                            </h1>
                            <p className="text-xl text-tmm-black/80 mb-8 leading-relaxed">
                                {workshop.descripcion}
                            </p>
                            <div className="flex flex-wrap gap-6 text-sm text-tmm-black/80 mb-8">
                                <div className="flex items-center gap-2">
                                    <CalendarBlank className="w-5 h-5 text-tmm-pink" />
                                    {workshop.fecha_taller}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-tmm-pink" />
                                    {workshop.hora_taller}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-tmm-pink" />
                                    {workshop.modalidad}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-tmm-pink" />
                                    {workshop.cupos_disponibles} cupos disponibles
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-8 p-4 bg-tmm-white/40 rounded-xl border border-tmm-white/50 backdrop-blur-sm">
                                <div className="p-2 bg-tmm-green rounded-lg text-tmm-black">
                                    <Users className="w-6 h-6 weight-fill" />
                                </div>
                                <div>
                                    <p className="font-bold text-tmm-black text-sm">¡Cupos Limitados!</p>
                                    <p className="text-xs text-tmm-black/80">Solo quedan {workshop.cupos_disponibles} lugares disponibles</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={onEnrollClick}
                                    disabled={isEnrolled}
                                    className={`px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${isEnrolled
                                        ? 'bg-gray-400 cursor-not-allowed text-white'
                                        : 'bg-tmm-pink text-tmm-black hover:bg-tmm-pink/80 shadow-tmm-pink/30'
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
                            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-tmm-white/50">
                                {workshop.imagen ? (
                                    <img src={workshop.imagen} alt={workshop.nombre} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-tmm-white/50 flex items-center justify-center">
                                        <Calendar className="w-20 h-20 text-tmm-black/20" />
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
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-tmm-pink/20">
                            <h2 className="text-2xl font-bold text-tmm-black mb-6">Sobre este taller</h2>
                            <div className="prose max-w-none">
                                <p className="text-tmm-black/80 leading-relaxed">
                                    {workshop.descripcion}
                                </p>
                            </div>
                        </div>

                        {/* Facilitator Section */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-tmm-pink/20">
                            <h2 className="text-2xl font-bold text-tmm-black mb-6">Tu Facilitadora</h2>
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-tmm-pink/20">
                                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop" alt="Facilitadora" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-tmm-black">María González</h3>
                                    <p className="text-tmm-pink text-sm font-medium">Instructora Senior de Mindfulness</p>
                                    <p className="text-tmm-black/70 text-sm mt-2">Guía certificada con pasión por crear espacios seguros de transformación.</p>
                                </div>
                            </div>
                        </div>

                        {/* Agenda / What to expect */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-tmm-pink/20">
                            <h2 className="text-2xl font-bold text-tmm-black mb-6 flex items-center gap-2">
                                <ListBullets className="w-6 h-6 text-tmm-pink" />
                                Agenda del Taller
                            </h2>
                            <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-tmm-pink/20">
                                {[
                                    { time: "10:00 AM", title: "Bienvenida y Círculo de Apertura", desc: "Conexión inicial y establecimiento de intenciones." },
                                    { time: "11:30 AM", title: "Práctica Profunda", desc: "Inmersión en las técnicas principales del taller." },
                                    { time: "01:00 PM", title: "Break y Networking", desc: "Espacio para compartir y descansar." },
                                    { time: "02:00 PM", title: "Integración y Cierre", desc: "Consolidación de aprendizajes y despedida." }
                                ].map((item, i) => (
                                    <div key={i} className="relative pl-10">
                                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-tmm-white border-2 border-tmm-pink flex items-center justify-center z-10">
                                            <div className="w-2 h-2 rounded-full bg-tmm-pink"></div>
                                        </div>
                                        <span className="text-xs font-bold text-tmm-pink uppercase tracking-wider">{item.time}</span>
                                        <h3 className="font-bold text-tmm-black text-lg">{item.title}</h3>
                                        <p className="text-tmm-black/70 text-sm">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Target Audience */}
                        <div className="bg-tmm-green/10 rounded-2xl p-8 border border-tmm-green/20">
                            <h2 className="text-2xl font-bold text-tmm-black mb-6 flex items-center gap-2">
                                <Target className="w-6 h-6 text-tmm-black" />
                                ¿Para quién es este taller?
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    "Personas buscando reducir el estrés",
                                    "Principiantes en mindfulness",
                                    "Quienes buscan comunidad",
                                    "Profesionales del bienestar"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/50 p-3 rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-tmm-green weight-fill" />
                                        <span className="text-tmm-black font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-tmm-pink/20">
                            <h2 className="text-2xl font-bold text-tmm-black mb-6">Lo que aprenderás</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-tmm-green mt-1 flex-shrink-0" />
                                        <p className="text-tmm-black/80">Técnicas especializadas y herramientas profesionales.</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <ReviewSection workshopId={parseInt(id!)} categoryId={workshop.categoria} />
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-tmm-pink/20 sticky top-24">
                            <h3 className="text-lg font-bold text-tmm-black mb-4">Detalles del taller</h3>
                            <ul className="space-y-4 text-tmm-black/80">
                                <li className="flex items-center gap-3">
                                    <CalendarBlank className="w-5 h-5 text-tmm-pink" />
                                    <span>{workshop.fecha_taller}</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-tmm-pink" />
                                    <span>{workshop.hora_taller}</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-tmm-pink" />
                                    <span>{workshop.modalidad}</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-tmm-pink" />
                                    <span>{workshop.cupos_disponibles} cupos disponibles</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Star className="w-5 h-5 text-tmm-yellow fill-current" />
                                    <span className="font-bold">{workshop.rating}</span>
                                    <span className="text-xs text-gray-500">(Categoría)</span>
                                </li>
                            </ul>


                            <div className="mt-6 pt-6 border-t border-tmm-pink/10">
                                <div className="flex items-center gap-2 text-sm text-tmm-black/60 mb-2">
                                    <ShieldCheck className="w-4 h-4 text-tmm-green" />
                                    <span>Compra 100% Segura</span>
                                </div>
                                <p className="text-xs text-tmm-black/40">
                                    Tus datos están protegidos. Recibirás confirmación inmediata.
                                </p>
                            </div>
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
