import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, Users, PlayCircle, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import ReviewSection from '../components/ReviewSection';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/public/cursos/${id}/`);
                setCourse(response.data);
            } catch (error) {
                console.error("Error fetching course", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
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
            const enrolled = response.data.cursos.some((c: any) => c.curso.id === parseInt(id!));
            setIsEnrolled(enrolled);
        } catch (error) {
            console.error("Error checking enrollment", error);
        }
    };

    const handleEnroll = async () => {
        const token = localStorage.getItem('access_token');
        await axios.post('http://localhost:8000/api/enroll/', {
            tipo: 'curso',
            id: course.id
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    };

    const onEnrollClick = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/courses/${id}` } });
            return;
        }
        if (isEnrolled) {
            navigate(`/courses/${id}/view`);
        } else {
            setIsPaymentOpen(true);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    if (!course) return <div className="min-h-screen flex items-center justify-center">Curso no encontrado</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <div className="bg-gray-900 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-block px-3 py-1 bg-brand-calypso/20 text-brand-calypso rounded-full text-sm font-medium mb-4">
                                {course.categoria_nombre || 'Curso Online'}
                            </span>
                            {isEnrolled && (
                                <div className="inline-block ml-2 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold">
                                    <CheckCircle className="w-4 h-4 inline mr-1" />
                                    Ya estás inscrito
                                </div>
                            )}
                            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 leading-tight">
                                {course.titulo}
                            </h1>
                            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                {course.descripcion}
                            </p>
                            <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-8">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-brand-pink" />
                                    {course.duracion}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-brand-pink" />
                                    {course.estudiantes} estudiantes
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-brand-pink fill-current" />
                                    {course.rating} Valoración
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={onEnrollClick}
                                    className={`px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 ${isEnrolled
                                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30'
                                        : 'bg-brand-calypso hover:bg-opacity-90 text-white shadow-brand-calypso/30'
                                        }`}
                                >
                                    {isEnrolled ? (
                                        <>
                                            <PlayCircle className="w-6 h-6" />
                                            Ver Curso
                                        </>
                                    ) : (
                                        `Inscribirme por $${parseInt(course.precio).toLocaleString('es-CL')}`
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-800 relative group cursor-pointer">
                                {course.imagen ? (
                                    <img src={course.imagen} alt={course.titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                        <PlayCircle className="w-20 h-20 text-gray-600" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-all">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                        <PlayCircle className="w-10 h-10 text-white fill-current" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Lo que aprenderás</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                        <p className="text-gray-600">Dominarás las técnicas avanzadas de marketing digital para tu negocio.</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <ReviewSection courseId={parseInt(id!)} />
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Este curso incluye:</h3>
                            <ul className="space-y-4 text-gray-600">
                                <li className="flex items-center gap-3">
                                    <PlayCircle className="w-5 h-5 text-gray-400" />
                                    <span>{course.duracion} de video bajo demanda</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-gray-400" />
                                    <span>Acceso de por vida</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-gray-400" />
                                    <span>Certificado de finalización</span>
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
                amount={parseInt(course.precio)}
                itemName={course.titulo}
            />
        </div>
    );
};

export default CourseDetail;
