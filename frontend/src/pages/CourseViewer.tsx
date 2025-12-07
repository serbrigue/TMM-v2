import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Menu, X, ChevronLeft, ChevronRight, PlayCircle, FileText, MessageCircle, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import clsx from 'clsx';
import { API_URL } from '../config/api';

const CourseViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState<any>(null);
    const [currentLesson, setCurrentLesson] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'content' | 'resources' | 'community'>('content');

    // Mock data for lessons structure
    const [modules] = useState<any[]>([
        {
            id: 1,
            title: "Módulo 1: Fundamentos del Bienestar",
            duration: "45 min",
            lessons: [
                { id: 101, title: "Bienvenida al curso", duration: "5:00", completed: true, type: 'video', videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
                { id: 102, title: "Mentalidad de Crecimiento", duration: "12:00", completed: false, type: 'video', videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
                { id: 103, title: "Definiendo tus objetivos", duration: "15:00", completed: false, type: 'video', videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
                { id: 104, title: "Lectura: Los 5 pilares", duration: "10:00", completed: false, type: 'text' },
            ]
        },
        {
            id: 2,
            title: "Módulo 2: Estrategia Personal",
            duration: "1h 20min",
            lessons: [
                { id: 201, title: "Análisis de Rutina", duration: "20:00", completed: false, type: 'video', videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
                { id: 202, title: "Diseño de Hábitos", duration: "18:00", completed: false, type: 'video', videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
                { id: 203, title: "Workbook: Plan de Acción", duration: "N/A", completed: false, type: 'resource' },
            ]
        },
        {
            id: 3,
            title: "Módulo 3: Implementación",
            duration: "55 min",
            lessons: [
                { id: 301, title: "Primeros Pasos", duration: "15:00", completed: false, type: 'video', videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
                { id: 302, title: "Superando Obstáculos", duration: "25:00", completed: false, type: 'video', videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
            ]
        }
    ]);

    const [enrollment, setEnrollment] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');

                // Fetch Course Details
                const courseRes = await axios.get(`${API_URL}/public/cursos/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourse(courseRes.data);

                // Fetch Enrollment Details to get progress and ID
                const enrollmentsRes = await axios.get(`${API_URL}/my-enrollments/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Find the enrollment for this course
                const myEnrollment = enrollmentsRes.data.cursos.find((e: any) => e.curso.id === parseInt(id || '0'));

                if (myEnrollment) {
                    setEnrollment(myEnrollment);
                    // If we have real progress, use it. Otherwise default to 0
                    // Note: Backend might not be calculating progress yet, so we might need to rely on 'completado'
                }

                setCurrentLesson(modules[0].lessons[0]);
            } catch (error) {
                console.error("Error fetching data", error);
                setCourse({ titulo: "Curso de Bienestar Integral" });
                setCurrentLesson(modules[0].lessons[0]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDownloadCertificate = async () => {
        if (!enrollment) return;
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(`${API_URL}/certificates/generate/`,
                { enrollment_id: enrollment.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            window.open(`${API_URL}/certificates/${response.data.uuid}/`, '_blank');
        } catch (error) {
            console.error("Error generating certificate", error);
            alert("No se pudo generar el certificado. Verifica que hayas completado todas las lecciones.");
        }
    };

    const handleLessonSelect = (lesson: any) => {
        setCurrentLesson(lesson);
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-tmm-pink">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tmm-black"></div>
        </div>
    );

    return (
        <div className="flex h-screen bg-tmm-pink text-tmm-black overflow-hidden font-sans">
            {/* Sidebar */}
            <div
                className={clsx(
                    "fixed inset-y-0 left-0 z-30 w-96 bg-white border-r border-gray-200 lg:relative lg:translate-x-0 flex flex-col shadow-xl",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <Button
                            variant="ghost"
                            className="text-tmm-black hover:text-tmm-black p-0 h-auto font-medium text-sm flex items-center gap-2 hover:bg-transparent"
                            onClick={() => navigate('/profile')}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Volver al Dashboard
                        </Button>
                        <button onClick={toggleSidebar} className="lg:hidden text-tmm-black hover:text-tmm-black">
                            <X size={24} />
                        </button>
                    </div>
                    <h2 className="font-serif font-bold text-2xl leading-tight text-tmm-black mb-2">{course?.titulo}</h2>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="bg-tmm-black h-full rounded-full" style={{ width: `${enrollment?.progreso || 0}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-tmm-black">{enrollment?.progreso || 0}% Completado</span>
                    </div>

                    {(enrollment?.progreso === 100 || enrollment?.completado) && (
                        <Button
                            onClick={handleDownloadCertificate}
                            className="w-full mt-4 bg-tmm-yellow text-tmm-black hover:bg-tmm-yellow/80 flex items-center justify-center gap-2 text-sm font-bold shadow-sm"
                        >
                            <Download size={16} />
                            Descargar Certificado
                        </Button>
                    )}
                </div>

                {/* Modules List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                    <div className="p-4 space-y-6">
                        {modules.map((module, index) => (
                            <div key={module.id} className="relative">
                                <div className="flex items-center justify-between mb-3 px-2">
                                    <h3 className="text-sm font-bold text-tmm-black uppercase tracking-wider font-serif">
                                        {module.title}
                                    </h3>
                                    <span className="text-xs text-gray-400">{module.duration}</span>
                                </div>
                                <div className="space-y-1">
                                    {module.lessons.map((lesson: any) => (
                                        <button
                                            key={lesson.id}
                                            onClick={() => handleLessonSelect(lesson)}
                                            className={clsx(
                                                "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-all duration-200 text-left group border border-transparent",
                                                currentLesson?.id === lesson.id
                                                    ? "bg-tmm-pink border-tmm-black/20 text-tmm-black shadow-sm"
                                                    : "text-gray-500 hover:bg-gray-50 hover:text-tmm-black"
                                            )}
                                        >
                                            <div className={clsx(
                                                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-colors",
                                                lesson.completed
                                                    ? "bg-tmm-black/10 border-tmm-black text-tmm-black"
                                                    : currentLesson?.id === lesson.id
                                                        ? "border-tmm-black text-tmm-black"
                                                        : "border-gray-300 text-gray-400 group-hover:border-gray-400"
                                            )}>
                                                {lesson.completed ? <CheckCircle size={14} /> :
                                                    lesson.type === 'video' ? <PlayCircle size={14} /> :
                                                        <FileText size={14} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate font-medium">{lesson.title}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{lesson.duration}</p>
                                            </div>
                                            {currentLesson?.id === lesson.id && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-tmm-black"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {index !== modules.length - 1 && (
                                    <div className="absolute left-5 bottom-0 top-10 w-px bg-gray-100 -z-10 hidden"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-tmm-pink relative">
                {/* Mobile Header */}
                <div className="lg:hidden p-4 bg-white border-b border-gray-200 flex items-center gap-4">
                    <button onClick={toggleSidebar} className="text-tmm-black p-2 hover:bg-gray-50 rounded-lg">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold truncate text-sm text-tmm-black font-serif">{course?.titulo}</span>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto w-full">
                        {/* Video Player Container */}
                        <div className="aspect-video w-full bg-black relative shadow-lg group">
                            {currentLesson?.videoUrl ? (
                                <iframe
                                    src={currentLesson.videoUrl}
                                    title={currentLesson.title}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-100">
                                    <FileText size={48} className="mb-4 opacity-50 text-tmm-black" />
                                    <p className="text-lg text-tmm-black">Esta lección es de lectura o recurso descargable.</p>
                                </div>
                            )}
                        </div>

                        {/* Lesson Content & Tabs */}
                        <div className="px-6 lg:px-12 py-8">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 border-b border-gray-200 pb-8">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-tmm-black mb-2 font-serif">{currentLesson?.title}</h1>
                                    <p className="text-gray-500">
                                        Módulo: {modules.find(m => m.lessons.some((l: any) => l.id === currentLesson?.id))?.title}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="border-tmm-black text-tmm-black hover:bg-tmm-black hover:text-white gap-2">
                                        <ChevronLeft size={16} />
                                        Anterior
                                    </Button>
                                    <Button className="bg-tmm-black text-white hover:bg-gray-800 gap-2 font-bold px-6 shadow-md hover:shadow-lg transition-all">
                                        Siguiente Lección
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="flex gap-8 border-b border-gray-200 mb-8">
                                <button
                                    onClick={() => setActiveTab('content')}
                                    className={clsx(
                                        "pb-4 text-sm font-medium transition-colors relative font-serif tracking-wide",
                                        activeTab === 'content' ? "text-tmm-black" : "text-gray-400 hover:text-tmm-black"
                                    )}
                                >
                                    Descripción
                                    {activeTab === 'content' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tmm-black"></div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('resources')}
                                    className={clsx(
                                        "pb-4 text-sm font-medium transition-colors relative font-serif tracking-wide",
                                        activeTab === 'resources' ? "text-tmm-black" : "text-gray-400 hover:text-tmm-black"
                                    )}
                                >
                                    Recursos
                                    {activeTab === 'resources' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tmm-black"></div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('community')}
                                    className={clsx(
                                        "pb-4 text-sm font-medium transition-colors relative font-serif tracking-wide",
                                        activeTab === 'community' ? "text-tmm-black" : "text-gray-400 hover:text-tmm-black"
                                    )}
                                >
                                    Comunidad
                                    {activeTab === 'community' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tmm-black"></div>
                                    )}
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="min-h-[300px]">
                                {activeTab === 'content' && (
                                    <div className="prose prose-lg max-w-none text-tmm-black">
                                        <p className="leading-relaxed">
                                            En esta lección exploraremos los conceptos fundamentales para entender cómo aplicar estas técnicas en tu día a día.
                                            Aprenderás a identificar los bloqueos mentales más comunes y cómo superarlos con estrategias prácticas.
                                        </p>
                                        <h3 className="text-tmm-black mt-8 mb-4 text-2xl font-bold font-serif">Puntos Clave:</h3>
                                        <ul className="space-y-2 text-tmm-black list-none pl-0">
                                            <li className="flex items-start gap-3">
                                                <span className="w-2 h-2 rounded-full bg-tmm-yellow mt-2.5 flex-shrink-0"></span>
                                                Identificación de patrones limitantes.
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="w-2 h-2 rounded-full bg-tmm-yellow mt-2.5 flex-shrink-0"></span>
                                                Herramientas de reestructuración cognitiva.
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="w-2 h-2 rounded-full bg-tmm-yellow mt-2.5 flex-shrink-0"></span>
                                                Ejercicios prácticos de aplicación inmediata.
                                            </li>
                                        </ul>
                                    </div>
                                )}

                                {activeTab === 'resources' && (
                                    <div className="grid gap-4">
                                        <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:border-tmm-black/30 transition-colors group shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-tmm-pink flex items-center justify-center text-tmm-black">
                                                    <FileText size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-tmm-black group-hover:text-tmm-black transition-colors font-serif text-lg">Guía de Ejercicios PDF</h4>
                                                    <p className="text-sm text-gray-400">2.4 MB • PDF</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" className="text-tmm-black hover:bg-tmm-pink">
                                                <Download size={20} />
                                            </Button>
                                        </div>
                                        <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:border-tmm-black/30 transition-colors group shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-tmm-yellow/20 flex items-center justify-center text-tmm-black">
                                                    <FileText size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-tmm-black group-hover:text-tmm-black transition-colors font-serif text-lg">Plantilla de Trabajo</h4>
                                                    <p className="text-sm text-gray-400">1.1 MB • Excel</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" className="text-tmm-black hover:bg-tmm-pink">
                                                <Download size={20} />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'community' && (
                                    <div className="space-y-6">
                                        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center shadow-sm">
                                            <MessageCircle size={48} className="mx-auto text-tmm-black/50 mb-4" />
                                            <h3 className="text-xl font-bold text-tmm-black mb-2 font-serif">Comentarios de la Clase</h3>
                                            <p className="text-gray-500 mb-6 max-w-md mx-auto">Únete a la conversación y comparte tus dudas con otros estudiantes.</p>
                                            <Button className="bg-tmm-black hover:bg-gray-800 text-white px-8">
                                                Ver 24 comentarios
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseViewer;
