import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Calendar, Users, DollarSign, Clock, CheckCircle,
    ArrowLeft, Download, Mail
} from 'lucide-react';

const AdminWorkshopDetail = () => {
    const { id } = useParams();
    const [workshop, setWorkshop] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkshop = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await axios.get(`http://localhost:8000/api/admin/talleres/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWorkshop(response.data);
            } catch (error) {
                console.error("Error fetching workshop details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkshop();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando detalles del taller...</div>;
    if (!workshop) return <div className="p-8 text-center text-red-500">Taller no encontrado</div>;

    const stats = workshop.stats;
    const occupancy = Math.round((stats.inscritos_count / stats.cupos_totales) * 100);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link to="/admin/workshops" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold font-heading text-gray-800">{workshop.nombre}</h1>
                    <div className="flex items-center gap-4 text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(workshop.fecha_taller).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {workshop.hora_taller}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${workshop.esta_activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {workshop.esta_activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            Total Recaudado
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Ingresos Totales</h3>
                    <p className="text-3xl font-bold text-gray-800">${stats.total_revenue.toLocaleString('es-CL')}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${occupancy >= 80 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                            {occupancy}% Ocupación
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Inscritos</h3>
                    <p className="text-3xl font-bold text-gray-800">
                        {stats.inscritos_count} <span className="text-lg text-gray-400 font-normal">/ {stats.cupos_totales}</span>
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Precio Ticket</h3>
                    <p className="text-3xl font-bold text-gray-800">${parseInt(workshop.precio).toLocaleString('es-CL')}</p>
                </div>
            </div>

            {/* Enrolled List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Listado de Inscritos</h3>
                    <div className="flex gap-2">
                        <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50">
                            <Mail className="w-4 h-4" />
                            Email a Todos
                        </button>
                        <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50">
                            <Download className="w-4 h-4" />
                            Exportar CSV
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Contacto</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha Inscripción</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado Pago</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Saldo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.inscritos.length > 0 ? (
                                stats.inscritos.map((inscrito: any) => (
                                    <tr key={inscrito.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <Link to={`/admin/clients/${inscrito.id}`} className="font-medium text-brand-calypso hover:underline">
                                                {inscrito.nombre}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>{inscrito.email}</div>
                                            <div className="text-xs text-gray-400">{inscrito.telefono}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(inscrito.fecha_inscripcion).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${inscrito.estado_pago === 'PAGADO' ? 'bg-green-100 text-green-700' :
                                                    inscrito.estado_pago === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {inscrito.estado_pago}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            ${inscrito.saldo_pendiente.toLocaleString('es-CL')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No hay inscritos en este taller.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminWorkshopDetail;
