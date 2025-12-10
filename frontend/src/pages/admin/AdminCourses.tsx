import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import { useAdmin } from '../../context/AdminContext';
import { Plus, Edit, Trash2, Search, PlayCircle, Download, Upload } from 'lucide-react';

const AdminCourses = () => {
    const { clientType } = useAdmin();
    const [searchParams] = useSearchParams();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [activeFilter, setActiveFilter] = useState<boolean>(true);
    const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await client.get('/admin/cursos/categories/');
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories", error);
            }
        };
        fetchCategories();
    }, []);

    const fetchCourses = async () => {
        try {
            let url = `/admin/cursos/?type=${clientType}`;
            // Active Toggle Logic
            url += `&activo=${activeFilter}`;

            if (categoryFilter) {
                url += `&category=${encodeURIComponent(categoryFilter)}`;
            }

            const response = await client.get(url);
            setCourses(response.data);
        } catch (error) {
            console.error("Error fetching courses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [clientType, activeFilter, categoryFilter]);

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
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar cursos..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tmm-black focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Category Filter */}
                    <div className="relative">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-tmm-black focus:border-transparent bg-white text-gray-600 appearance-none min-w-[150px]"
                        >
                            <option value="">Todas las Categorías</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>

                    {/* Active Toggle Button */}
                    <button
                        onClick={() => setActiveFilter(!activeFilter)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeFilter
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        title={activeFilter ? 'Ocultar Inactivos' : 'Mostrar Activos'}
                    >
                        <div className={`w-3 h-3 rounded-full ${activeFilter ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        {activeFilter ? 'Activos' : 'Inactivos'}
                    </button>
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
