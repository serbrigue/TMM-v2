import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play, FileText, CheckCircle, Circle, Clock, Award, BookOpen } from 'lucide-react';

const CourseViewer = () => {
    const { id } = useParams();
    const [selectedLesson, setSelectedLesson] = useState(1);
    const [completedLessons, setCompletedLessons] = useState<number[]>([1]);

    // Template de contenido por defecto
    const courseTemplate = {
        titulo: "Curso de Bienestar y Desarrollo Personal",
        descripcion: "Aprende técnicas efectivas para mejorar tu bienestar",
        duracion: "8 horas",
        estudiantes: 150,
        sections: [
            {
                id: 1,
                titulo: "Introducción al Bienestar",
                lessons: [
                    { id: 1, titulo: "Bienvenida al curso", tipo: "VIDEO", duracion: "5 min" },
                    { id: 2, titulo: "Materiales necesarios", tipo: "LECTURA", duracion: "Lectura" },
                    { id: 3, titulo: "Objetivos del curso", tipo: "LECTURA", duracion: "Lectura" }
                ]
            },
            {
                id: 2,
                titulo: "Fundamentos del Bienestar",
                lessons: [
                    { id: 4, titulo: "Conceptos básicos", tipo: "VIDEO", duracion: "15 min" },
                    { id: 5, titulo: "Ejercicio práctico 1", tipo: "ACTIVIDAD", duracion: "Actividad" },
                    { id: 6, titulo: "Técnicas de relajación", tipo: "VIDEO", duracion: "20 min" }
                ]
            },
            {
                id: 3,
                titulo: "Práctica y Aplicación",
                lessons: [
                    { id: 7, titulo: "Rutina diaria de bienestar", tipo: "VIDEO", duracion: "12 min" },
                    { id: 8, titulo: "Ejercicio final", tipo: "ACTIVIDAD", duracion: "Actividad" },
                    { id: 9, titulo: "Evaluación del curso", tipo: "ACTIVIDAD", duracion: "Quiz" }
                ]
            }
        ]
    };

    const lessonContent = {
        1: {
            titulo: "Bienvenida al Curso",
            contenido: `
                <h2>¡Bienvenida a este curso de Bienestar!</h2>
                <p>En este curso aprenderás técnicas efectivas para mejorar tu bienestar físico, mental y emocional.</p>
                
                <h3>Lo que aprenderás:</h3>
                <ul>
                    <li>Fundamentos del bienestar integral</li>
                    <li>Técnicas de relajación y mindfulness</li>
                    <li>Creación de rutinas saludables</li>
                    <li>Herramientas para el desarrollo personal</li>
                </ul>
                
                <div class="tip">
                    <h4>💡 Tip</h4>
                    <p>Toma notas mientras avanzas en el curso. Esto te ayudará a retener mejor la información y aplicarla en tu vida diaria.</p>
                </div>
            `
        },
        2: {
            titulo: "Materiales Necesarios",
            contenido: `
                <h2>Materiales para el Curso</h2>
                <p>Para aprovechar al máximo este curso, te recomendamos tener a mano:</p>
                
                <ul>
                    <li>Cuaderno o diario personal</li>
                    <li>Espacio tranquilo para practicar</li>
                    <li>Ropa cómoda</li>
                    <li>Mente abierta y disposición para aprender</li>
                </ul>
                
                <h3>Recursos Descargables</h3>
                <p>Encontrarás materiales adicionales en la sección de recursos al final de cada lección.</p>
            `
        },
        4: {
            titulo: "Conceptos Básicos del Bienestar",
            contenido: `
                <h2>Fundamentos del Bienestar Integral</h2>
                <p>El bienestar es un estado de equilibrio entre diferentes aspectos de nuestra vida:</p>
                
                <h3>Dimensiones del Bienestar</h3>
                <ul>
                    <li><strong>Físico:</strong> Salud corporal y energía</li>
                    <li><strong>Mental:</strong> Claridad y enfoque</li>
                    <li><strong>Emocional:</strong> Gestión de emociones</li>
                    <li><strong>Social:</strong> Relaciones saludables</li>
                    <li><strong>Espiritual:</strong> Propósito y significado</li>
                </ul>
                
                <div class="tip">
                    <h4>⚡ Importante</h4>
                    <p>El bienestar no es un destino, sino un viaje continuo de crecimiento y desarrollo personal.</p>
                </div>
            `
        }
    };

    const getLessonIcon = (tipo: string) => {
        switch (tipo) {
            case 'VIDEO':
                return <Play className="w-5 h-5 text-brand-calypso" />;
            case 'LECTURA':
                return <FileText className="w-5 h-5 text-brand-pink" />;
            case 'ACTIVIDAD':
                return <Award className="w-5 h-5 text-purple-500" />;
            default:
                return <Circle className="w-5 h-5 text-gray-400" />;
        }
    };

    const isCompleted = (lessonId: number) => completedLessons.includes(lessonId);

    const markAsCompleted = (lessonId: number) => {
        if (!isCompleted(lessonId)) {
            setCompletedLessons([...completedLessons, lessonId]);
        }
    };

    const currentContent = lessonContent[selectedLesson as keyof typeof lessonContent] || lessonContent[1];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-calypso to-brand-pink text-white p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">{courseTemplate.titulo}</h1>
                    <p className="text-white/90">{courseTemplate.descripcion}</p>
                    <div className="flex gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {courseTemplate.duracion}
                        </div>
                        <div className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            {courseTemplate.estudiantes} estudiantes
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            {completedLessons.length} de 9 lecciones completadas
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar - Course Content */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Contenido del Curso</h2>

                            <div className="space-y-4">
                                {courseTemplate.sections.map((section) => (
                                    <div key={section.id} className="border-b border-gray-100 pb-4 last:border-0">
                                        <h3 className="font-bold text-gray-900 mb-3">{section.titulo}</h3>
                                        <div className="space-y-2">
                                            {section.lessons.map((lesson) => (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => setSelectedLesson(lesson.id)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${selectedLesson === lesson.id
                                                            ? 'bg-brand-calypso/10 border-2 border-brand-calypso'
                                                            : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {getLessonIcon(lesson.tipo)}
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{lesson.titulo}</p>
                                                        <p className="text-xs text-gray-500">{lesson.duracion}</p>
                                                    </div>
                                                    {isCompleted(lesson.id) ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-gray-300" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Video Player Placeholder */}
                            <div className="aspect-video bg-gray-900 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">Video: {currentContent.titulo}</p>
                                    <p className="text-sm text-gray-400 mt-2">Modo demostración - Video simulado</p>
                                </div>
                            </div>

                            {/* Lesson Content */}
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentContent.titulo}</h2>

                                <div
                                    className="prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: currentContent.contenido }}
                                    style={{
                                        fontSize: '16px',
                                        lineHeight: '1.6'
                                    }}
                                />

                                {/* Mark as Complete Button */}
                                {!isCompleted(selectedLesson) && (
                                    <button
                                        onClick={() => markAsCompleted(selectedLesson)}
                                        className="mt-6 px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Marcar como Completada
                                    </button>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                                    <button
                                        onClick={() => selectedLesson > 1 && setSelectedLesson(selectedLesson - 1)}
                                        disabled={selectedLesson === 1}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ← Lección Anterior
                                    </button>
                                    <button
                                        onClick={() => selectedLesson < 9 && setSelectedLesson(selectedLesson + 1)}
                                        disabled={selectedLesson === 9}
                                        className="px-6 py-3 bg-brand-calypso text-white rounded-lg hover:bg-brand-calypso/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        Siguiente Lección →
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Additional Resources */}
                        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Recursos Adicionales</h3>
                            <div className="space-y-3">
                                <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <FileText className="w-5 h-5 text-brand-pink" />
                                    <div>
                                        <p className="font-medium text-gray-900">Guía de ejercicios.pdf</p>
                                        <p className="text-sm text-gray-500">250 KB</p>
                                    </div>
                                </a>
                                <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <FileText className="w-5 h-5 text-brand-pink" />
                                    <div>
                                        <p className="font-medium text-gray-900">Plantilla de seguimiento.docx</p>
                                        <p className="text-sm text-gray-500">120 KB</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .prose h2 {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                    color: #1f2937;
                }
                .prose h3 {
                    font-size: 1.25rem;
                    font-weight: bold;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    color: #374151;
                }
                .prose h4 {
                    font-size: 1.1rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }
                .prose p {
                    margin-bottom: 1rem;
                    color: #4b5563;
                }
                .prose ul {
                    list-style: disc;
                    margin-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .prose li {
                    margin-bottom: 0.5rem;
                    color: #4b5563;
                }
                .prose .tip {
                    background: #ecfdf5;
                    border-left: 4px solid #10b981;
                    padding: 1rem;
                    margin: 1.5rem 0;
                    border-radius: 0.5rem;
                }
                .prose .tip h4 {
                    color: #059669;
                    margin-top: 0;
                }
                .prose .tip p {
                    color: #065f46;
                    margin-bottom: 0;
                }
            `}</style>
        </div>
    );
};

export default CourseViewer;
