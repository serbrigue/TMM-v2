import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Clock, Users, PlayCircle, CheckCircle, Star, CaretDown, LockKey } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import ReviewSection from '../components/ReviewSection';
import { Button } from '../components/ui/Button';
import * as Accordion from '@radix-ui/react-accordion';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    const [enrollmentId, setEnrollmentId] = useState<number | null>(null);

    const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);

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
            const enrolledCourse = response.data.cursos.find((c: any) => c.curso.id === parseInt(id!));
            if (enrolledCourse) {
                setIsEnrolled(true);
                setEnrollmentId(enrolledCourse.id);
                setEnrollmentStatus(enrolledCourse.estado_pago);
            }
        } catch (error) {
            console.error("Error checking enrollment", error);
        }
    };

    const handleEnroll = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post('http://localhost:8000/api/enroll/', {
                tipo: 'curso',
                id: course.id
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
            navigate('/login', { state: { from: `/courses/${id}` } });
            return;
        }

        if (isEnrolled) {
            if (enrollmentStatus === 'PENDIENTE') {
                alert("Tu inscripción está pendiente de verificación de pago. Te notificaremos cuando sea aprobada.");
                return;
            }
            navigate(`/courses/${id}/view`);
        } else {
            setIsPaymentOpen(true);
        }
    };


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-cloud-pink">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-gray"></div>
        </div>
    );

    if (!course) return <div className="min-h-screen flex items-center justify-center">Curso no encontrado</div>;

    return (
        <div className="min-h-screen bg-cloud-pink pb-20">
            {/* Hero Section */}
            <div className="relative bg-sage-gray text-white py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-sage-gray/90 to-sage-gray"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <span className="inline-block px-4 py-1.5 bg-butter-yellow/20 text-butter-yellow rounded-full text-sm font-bold mb-6 border border-butter-yellow/30">
                                {course.categoria_nombre || 'Curso Online'}
                            </span>

                            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                                {course.titulo}
                            </h1>
                            <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-xl">
                                {course.descripcion}
                            </p>

                            <div className="flex flex-wrap gap-6 text-sm text-white/70 mb-8">
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                                    <Clock className="w-5 h-5 text-butter-yellow" />
                                    {course.duracion}
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                                    <Users className="w-5 h-5 text-butter-yellow" />
                                    {course.estudiantes} estudiantes
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                                    <Star className="w-5 h-5 text-butter-yellow weight-fill" />
                                    {course.rating} Valoración
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={onEnrollClick}
                                    size="lg"
                                    className={`text-lg px-8 py-6 shadow-xl shadow-butter-yellow/10 ${isEnrolled ? 'bg-green-500 hover:bg-green-600 text-white border-transparent' : 'bg-butter-yellow text-sage-gray hover:bg-white border-transparent'}`}
                                >
                                    {isEnrolled ? (
                                        enrollmentStatus === 'PENDIENTE' ? (
                                            <>
                                                <Clock className="w-6 h-6 mr-2" />
                                                Verificación Pendiente
                                            </>
                                        ) : (
                                            <>
                                                <PlayCircle className="w-6 h-6 mr-2" />
                                                Continuar Aprendiendo
                                            </>
                                        )
                                    ) : (
                                        `Inscribirme por $${parseInt(course.precio).toLocaleString('es-CL')}`
                                    )}
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/20 relative group cursor-pointer transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                {course.imagen ? (
                                    <img src={course.imagen} alt={course.titulo} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-sage-gray/50 flex items-center justify-center">
                                        <PlayCircle className="w-20 h-20 text-white/50" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                                        <PlayCircle className="w-10 h-10 text-white weight-fill" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* What you'll learn */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-silver-gray">
                            <h2 className="text-2xl font-serif font-bold text-sage-gray mb-6">Lo que aprenderás</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    "Estrategias probadas para escalar tu negocio",
                                    "Herramientas prácticas de gestión del tiempo",
                                    "Mentalidad de crecimiento y liderazgo",
                                    "Marketing digital enfocado en conversión"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle className="w-6 h-6 text-butter-yellow weight-fill mt-0.5 flex-shrink-0" />
                                        <p className="text-charcoal-gray">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Syllabus */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-silver-gray">
                            <h2 className="text-2xl font-serif font-bold text-sage-gray mb-6">Contenido del Curso</h2>
                            <Accordion.Root type="single" collapsible className="space-y-4">
                                {[1, 2, 3, 4].map((module) => (
                                    <Accordion.Item key={module} value={`item-${module}`} className="border border-silver-gray rounded-xl overflow-hidden">
                                        <Accordion.Header>
                                            <Accordion.Trigger className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left group">
                                                <span className="font-bold text-sage-gray">Módulo {module}: Fundamentos Esenciales</span>
                                                <CaretDown className="w-5 h-5 text-gray-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                            </Accordion.Trigger>
                                        </Accordion.Header>
                                        <Accordion.Content className="p-4 bg-white text-charcoal-gray/80 text-sm space-y-2">
                                            <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                                                <PlayCircle className="w-4 h-4 text-sage-gray" />
                                                <span>Introducción al módulo</span>
                                                <span className="ml-auto text-xs text-gray-400">10:00</span>
                                            </div>
                                            <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                                                <LockKey className="w-4 h-4 text-gray-300" />
                                                <span>Lección práctica 1</span>
                                                <span className="ml-auto text-xs text-gray-400">15:00</span>
                                            </div>
                                        </Accordion.Content>
                                    </Accordion.Item>
                                ))}
                            </Accordion.Root>
                        </div>

                        <ReviewSection courseId={parseInt(id!)} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-lg border border-silver-gray sticky top-24">
                            <h3 className="text-xl font-serif font-bold text-sage-gray mb-6">Este curso incluye:</h3>
                            <ul className="space-y-4 text-charcoal-gray mb-8">
                                <li className="flex items-center gap-3">
                                    <PlayCircle className="w-5 h-5 text-butter-yellow weight-fill" />
                                    <span>{course.duracion} de video bajo demanda</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-butter-yellow weight-fill" />
                                    <span>Acceso de por vida</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-butter-yellow weight-fill" />
                                    <span>Certificado de finalización</span>
                                </li>
                            </ul>

                            <Button
                                onClick={onEnrollClick}
                                className="w-full py-4 text-lg font-bold shadow-lg shadow-butter-yellow/20"
                                variant={isEnrolled ? "ghost" : "primary"}
                            >
                                {isEnrolled ? "Ir al Curso" : "Inscribirme Ahora"}
                            </Button>

                            {!isEnrolled && (
                                <p className="text-center text-xs text-gray-400 mt-4">
                                    Garantía de satisfacción de 7 días
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {course && (
                <PaymentModal
                    isOpen={isPaymentOpen}
                    onClose={() => setIsPaymentOpen(false)}
                    onConfirm={handleEnroll}
                    amount={parseInt(course.precio)}
                    itemName={course.titulo}
                    enrollmentId={enrollmentId}
                    itemType="curso"
                />
            )}
        </div>
    );
};

export default CourseDetail;
