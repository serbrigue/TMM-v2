import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAdmin } from '../../context/AdminContext';
import { Plus, Edit, Trash2, Search, PlayCircle, Download, Upload } from 'lucide-react';

const AdminCourses = () => {
    const { clientType } = useAdmin();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCourses = async () => {
        try {
            const response = await client.get(`/admin/cursos/?type=${clientType}`);
            setCourses(response.data);
        } catch (error) {
            console.error("Error fetching courses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [clientType]);

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
                <div className="flex gap-2">
                    <label className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span className="hidden md:inline">Importar</span>
                        <input type="file" accept=".csv,.xlsx" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('file', file);
                            try {
                                setLoading(true);
                                const response = await client.post('/admin/import/?model=cursos', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                alert(`Importación completada: ${response.data.created} creados, ${response.data.updated} actualizados.`);
                                fetchCourses();
                            } catch (error) {
                                console.error("Error importing courses", error);
                                alert("Error al importar cursos.");
                            } finally {
                                setLoading(false);
                                e.target.value = '';
                            }
                        }} />
                    </label>
                    <button
                        onClick={async () => {
                            try {
                                const response = await client.get(`/admin/export/?model=cursos&type=${clientType || ''}`, {
                                    responseType: 'blob',
                                });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `cursos_${clientType || 'todos'}.csv`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                            } catch (error) {
                                console.error("Error exporting courses", error);
                                alert("Error al exportar cursos");
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        title="Exportar Cursos"
                    >
                        <Download className="w-5 h-5" />
                        <span className="hidden md:inline">Exportar</span>
                    </button>
                    <Link
                        to="/admin/courses/create"
                        className="bg-tmm-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90"
                    >
                        <Plus size={20} /> Nuevo Curso
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar cursos..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tmm-black/20"
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
                                                <Link to={`/admin/courses/${course.id}`} className="font-medium text-gray-900 hover:text-tmm-black hover:underline">
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
