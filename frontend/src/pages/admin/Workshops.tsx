import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAdmin } from '../../context/AdminContext';
import { Plus, Edit, Trash2, Search, Calendar, Users, MapPin, Download, Upload } from 'lucide-react';

const Workshops = () => {
    const { clientType } = useAdmin();
    const [workshops, setWorkshops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchWorkshops = async () => {
        try {
            const response = await client.get(`/admin/talleres/?type=${clientType}`);
            setWorkshops(response.data);
        } catch (error) {
            console.error("Error fetching workshops", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkshops();
    }, [clientType]);

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este taller?')) {
            try {
                await client.delete(`/admin/talleres/${id}/`);
                fetchWorkshops();
            } catch (error) {
                console.error("Error deleting workshop", error);
                alert("Error al eliminar el taller.");
            }
        }
    };

    const filteredWorkshops = workshops.filter(workshop =>
        workshop.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-6">Cargando...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Talleres</h1>
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
                                const response = await client.post('/admin/import/?model=talleres', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                alert(`Importación completada: ${response.data.created} creados, ${response.data.updated} actualizados.`);
                                fetchWorkshops();
                            } catch (error) {
                                console.error("Error importing workshops", error);
                                alert("Error al importar talleres.");
                            } finally {
                                setLoading(false);
                                e.target.value = '';
                            }
                        }} />
                    </label>
                    <button
                        onClick={async () => {
                            try {
                                const response = await client.get(`/admin/export/?model=talleres&type=${clientType || ''}`, {
                                    responseType: 'blob',
                                });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `talleres_${clientType || 'todos'}.csv`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                            } catch (error) {
                                console.error("Error exporting workshops", error);
                                alert("Error al exportar talleres");
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        title="Exportar Talleres"
                    >
                        <Download className="w-5 h-5" />
                        <span className="hidden md:inline">Exportar</span>
                    </button>
                    <Link
                        to="/admin/workshops/create"
                        className="bg-tmm-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90"
                    >
                        <Plus size={20} /> Nuevo Taller
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar talleres..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tmm-black focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Taller</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Modalidad</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cupos</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredWorkshops.map((workshop) => (
                                <tr key={workshop.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {workshop.imagen && (
                                                <img
                                                    src={workshop.imagen}
                                                    alt={workshop.nombre}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <Link to={`/admin/workshops/${workshop.id}`} className="font-medium text-gray-900 hover:text-tmm-black hover:underline">
                                                    {workshop.nombre}
                                                </Link>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">{workshop.descripcion}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex flex-col">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {workshop.fecha_taller}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-5">
                                                {workshop.hora_taller}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={14} />
                                            {workshop.modalidad}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Users size={14} />
                                            {workshop.cupos_disponibles} / {workshop.cupos_totales}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        ${workshop.precio}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${workshop.esta_activo
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {workshop.esta_activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                to={`/admin/workshops/edit/${workshop.id}`}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(workshop.id)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                title="Eliminar"
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

export default Workshops;
