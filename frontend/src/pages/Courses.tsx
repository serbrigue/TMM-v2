import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlayCircle, Clock, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import ItemCard from '../components/ItemCard';

const Courses = () => {
    const { isEnrolledInCourse } = useAuth();
    const navigate = useNavigate();
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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando cursos...</div>;

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Cursos Grabados"
                    description="Aprende desde la comodidad de tu casa, a tu propio ritmo y con acceso de por vida."
                />

                {/* Course Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => {
                        const enrolled = isEnrolledInCourse(course.id);
                        return (
                            <ItemCard
                                key={course.id}
                                title={course.titulo}
                                description={course.descripcion}
                                image={course.imagen}
                                category={course.categoria_nombre}
                                isEnrolled={enrolled}
                                price={parseInt(course.precio)}
                                onClick={() => navigate(enrolled ? `/courses/${course.id}/view` : `/courses/${course.id}`)}
                                buttonText={enrolled ? "Ver Curso" : "Ver Detalles"}
                                metadata={
                                    <div className="flex items-center gap-6 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {course.duracion}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-brand-pink fill-current" />
                                            {course.rating}
                                        </div>
                                    </div>
                                }
                                imageOverlay={
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <PlayCircle className="w-16 h-16 text-white" />
                                    </div>
                                }
                            />
                        );
                    })}
                </div>

                {courses.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No hay cursos disponibles por el momento.</p>
                    </div>
                )}
            </div>
        </div >
    );
};

export default Courses;
