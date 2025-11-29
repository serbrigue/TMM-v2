import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Menu, X, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import clsx from 'clsx';

const CourseViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState<any>(null);
    const [currentLesson, setCurrentLesson] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);

    // Mock data for lessons structure (since backend might not have full module structure yet)
    const [modules] = useState<any[]>([
        {
            id: 1,
            title: "Módulo 1: Fundamentos",
            lessons: [
                { id: 101, title: "Bienvenida al curso", duration: "5:00", completed: true, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
                { id: 102, title: "Mentalidad de Crecimiento", duration: "12:00", completed: false, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
                { id: 103, title: "Definiendo tus objetivos", duration: "15:00", completed: false, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
            ]
        },
        {
            id: 2,
            title: "Módulo 2: Estrategia",
            lessons: [
                { id: 201, title: "Análisis de Mercado", duration: "20:00", completed: false, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
                { id: 202, title: "Tu Cliente Ideal", duration: "18:00", completed: false, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
            ]
        }
    ]);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await axios.get(`http://localhost:8000/api/public/cursos/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourse(response.data);
                // Set initial lesson
                setCurrentLesson(modules[0].lessons[0]);
            } catch (error) {
                console.error("Error fetching course", error);
                navigate('/courses');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    const handleLessonSelect = (lesson: any) => {
        setCurrentLesson(lesson);
        // On mobile, close sidebar after selection
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-calypso"></div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            {/* Sidebar */}
            <div
                className={clsx(
                    "fixed inset-y-0 left-0 z-30 w-80 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h2 className="font-bold text-lg truncate pr-4">{course?.titulo}</h2>
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {modules.map((module) => (
                        <div key={module.id}>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                                {module.title}
                            </h3>
                            <div className="space-y-1">
                                {module.lessons.map((lesson: any) => (
                                    <button
                                        key={lesson.id}
                                        onClick={() => handleLessonSelect(lesson)}
                                        className={clsx(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                                            currentLesson?.id === lesson.id
                                                ? "bg-brand-calypso text-white"
                                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                        )}
                                    >
                                        {lesson.completed ? (
                                            <CheckCircle className={clsx("w-5 h-5 flex-shrink-0", currentLesson?.id === lesson.id ? "text-white" : "text-green-500")} />
                                        ) : (
                                            <Lock className="w-5 h-5 flex-shrink-0 opacity-70" />
                                        )}
                                        <span className="truncate">{lesson.title}</span>
                                        <span className="ml-auto text-xs opacity-60">{lesson.duration}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                        <span className="text-xs text-gray-400">20%</span>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full mt-4 text-gray-400 hover:text-white justify-start"
                        onClick={() => navigate('/profile')}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Volver al Perfil
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-black relative">
                {/* Mobile Header */}
                <div className="lg:hidden p-4 bg-gray-800 flex items-center gap-4">
                    <button onClick={toggleSidebar} className="text-white">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold truncate">{course?.titulo}</span>
                </div>

                {/* Video Player Area */}
                <div className="flex-1 flex items-center justify-center p-4 lg:p-10">
                    <div className="w-full max-w-5xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl relative border border-gray-800">
                        {currentLesson ? (
                            <iframe
                                src={currentLesson.videoUrl}
                                title={currentLesson.title}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Selecciona una lección para comenzar
                            </div>
                        )}
                    </div>
                </div>

                {/* Lesson Info & Navigation */}
                <div className="bg-gray-900 border-t border-gray-800 p-6 lg:px-10">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">{currentLesson?.title}</h2>
                            <p className="text-gray-400 text-sm">Módulo: {modules.find(m => m.lessons.some((l: any) => l.id === currentLesson?.id))?.title}</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800">
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Anterior
                            </Button>
                            <Button className="bg-brand-calypso hover:bg-brand-calypso/90 text-white">
                                Siguiente Lección
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseViewer;
