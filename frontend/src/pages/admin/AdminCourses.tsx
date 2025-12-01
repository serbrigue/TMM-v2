import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { Plus, Edit, Trash2, Search, PlayCircle } from 'lucide-react';

const AdminCourses = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCourses = async () => {
        try {
            const response = await client.get('/admin/cursos/');
            setCourses(response.data);
        } catch (error) {
            console.error("Error fetching courses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este curso?')) {
            try {
                await client.delete(`/admin/cursos/${id}/`);
                fetchCourses();
            } catch (error) {
                console.error("Error deleting course", error);
            }
        }
    };

    const filteredCourses = courses.filter(course =>
        course.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-6">Cargando...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Cursos Grabados</h1>
                <Link
                    to="/admin/courses/create"
                    className="bg-sage-gray text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90"
                >
                    <Plus size={20} /> Nuevo Curso
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar cursos..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-calypso/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                            <tr>
                                <th className="p-4">Curso</th>
                                <th className="p-4">Categoría</th>
                                <th className="p-4">Precio</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCourses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {course.imagen ? (
                                                    <img src={course.imagen} alt={course.titulo} className="w-full h-full object-cover" />
                                                ) : (
                                                    <PlayCircle size={20} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <Link to={`/admin/courses/${course.id}`} className="font-medium text-gray-900 hover:text-brand-calypso hover:underline">
                                                    {course.titulo}
                                                </Link>
                                                <p className="text-xs text-gray-500 truncate max-w-xs">{course.descripcion}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {course.categoria_nombre || <span className="text-gray-400 italic">Sin categoría</span>}
                                    </td>
                                    <td className="p-4">${parseInt(course.precio).toLocaleString('es-CL')}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.esta_activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {course.esta_activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* TODO: Add Edit Page Link */}
                                            <Link
                                                to={`/admin/courses/edit/${course.id}`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCourses;
