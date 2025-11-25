import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, DollarSign, BookOpen, Award, MessageSquare, Building, Globe, Plus, X } from 'lucide-react';

const ClientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);

    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newInteraction, setNewInteraction] = useState({
        tipo: 'LLAMADA',
        resumen: '',
        detalle: ''
    });

    const fetchClientDetail = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`http://localhost:8000/api/admin/clientes/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (error) {
            console.error("Error fetching client detail", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientDetail();
    }, [id]);

    const handleAddInteraction = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            await axios.post('http://localhost:8000/api/admin/interacciones/', {
                ...newInteraction,
                cliente: id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            setNewInteraction({ tipo: 'LLAMADA', resumen: '', detalle: '' });
            fetchClientDetail(); // Refresh data
        } catch (error) {
            console.error("Error creating interaction", error);
            alert("Error al crear interacción");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando detalles del cliente...</div>;
    if (!data) return <div className="p-8 text-center text-gray-500">Cliente no encontrado</div>;

    const { cliente, talleres, cursos, intereses, interacciones } = data;

    const totalSpent = (talleres?.reduce((acc: number, t: any) => acc + Number(t.monto_pagado), 0) || 0) +
        (cursos?.reduce((acc: number, c: any) => acc + Number(c.monto_pagado), 0) || 0);

    return (
        <div>
            <button
                onClick={() => navigate('/admin/clients')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-5 h-5" />
                Volver a Clientes
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Client Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-20 h-20 bg-brand-pink/20 rounded-full flex items-center justify-center text-brand-pink text-3xl font-bold">
                                {cliente.nombre_completo.charAt(0)}
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">{cliente.nombre_completo}</h2>
                        <div className="flex justify-center mb-6">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${cliente.estado_ciclo === 'CLIENTE' ? 'bg-green-100 text-green-700' :
                                cliente.estado_ciclo === 'PROSPECTO' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                {cliente.estado_ciclo}
                            </span>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400" />
                                {cliente.email}
                            </div>
                            {cliente.telefono && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    {cliente.telefono}
                                </div>
                            )}
                            {cliente.comuna_vive && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    {cliente.comuna_vive}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                Registrado: {new Date(cliente.fecha_registro).toLocaleDateString()}
                            </div>

                            {/* New Fields */}
                            {cliente.origen && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Globe className="w-4 h-4 text-gray-400" />
                                    Origen: {cliente.origen}
                                </div>
                            )}
                            {cliente.empresa && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Building className="w-4 h-4 text-gray-400" />
                                    Empresa: {cliente.empresa}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium">Total Invertido</span>
                                <span className="text-xl font-bold text-gray-900">${totalSpent.toLocaleString('es-CL')}</span>
                            </div>
                        </div>

                        {intereses && intereses.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Award className="w-4 h-4" />
                                    Intereses
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {intereses.map((interes: string, index: number) => (
                                        <span key={index} className="bg-brand-calypso/10 text-brand-calypso px-2 py-1 rounded text-xs font-medium">
                                            {interes}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Interactions History */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-brand-pink" />
                                Historial de Interacciones
                            </h3>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-1 text-sm bg-brand-pink text-white px-3 py-1.5 rounded-lg hover:bg-brand-pink/90 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Nueva
                            </button>
                        </div>
                        {interacciones && interacciones.length > 0 ? (
                            <div className="space-y-4">
                                {interacciones.map((interaccion: any) => (
                                    <div key={interaccion.id} className="flex gap-4 p-3 rounded-lg bg-gray-50">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${interaccion.tipo === 'LLAMADA' ? 'bg-blue-100 text-blue-600' :
                                            interaccion.tipo === 'WHATSAPP' ? 'bg-green-100 text-green-600' :
                                                interaccion.tipo === 'EMAIL' ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-purple-100 text-purple-600'
                                            }`}>
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900">{interaccion.tipo}</span>
                                                <span className="text-xs text-gray-500">{new Date(interaccion.fecha).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-800 font-medium">{interaccion.resumen}</p>
                                            {interaccion.detalle && <p className="text-sm text-gray-600 mt-1">{interaccion.detalle}</p>}
                                            {interaccion.usuario_nombre && (
                                                <p className="text-xs text-gray-400 mt-2">Por: {interaccion.usuario_nombre}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No hay interacciones registradas</p>
                        )}
                    </div>

                    {/* Enrollments */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-brand-calypso" />
                            Talleres Inscritos ({talleres?.length || 0})
                        </h3>
                        {talleres && talleres.length > 0 ? (
                            <div className="space-y-3">
                                {talleres.map((taller: any) => (
                                    <div key={taller.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900">{taller.taller_nombre}</h4>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${taller.estado_pago === 'PAGADO' ? 'bg-green-100 text-green-700' :
                                                'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {taller.estado_pago}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Taller: {new Date(taller.fecha_taller).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                ${taller.monto_pagado.toLocaleString('es-CL')}
                                            </div>
                                            <div className="col-span-2 text-xs text-gray-400">
                                                Inscrito: {new Date(taller.fecha_inscripcion).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No hay talleres inscritos</p>
                        )}
                    </div>

                    {/* Courses */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-brand-pink" />
                            Cursos Inscritos ({cursos?.length || 0})
                        </h3>
                        {cursos && cursos.length > 0 ? (
                            <div className="space-y-3">
                                {cursos.map((curso: any) => (
                                    <div key={curso.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900">{curso.curso_titulo}</h4>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${curso.estado_pago === 'PAGADO' ? 'bg-green-100 text-green-700' :
                                                'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {curso.estado_pago}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                ${curso.monto_pagado.toLocaleString('es-CL')}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Inscrito: {new Date(curso.fecha_inscripcion).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-brand-calypso h-2 rounded-full transition-all"
                                                style={{ width: `${curso.progreso}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Progreso: {curso.progreso}%</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No hay cursos inscritos</p>
                        )}
                    </div>
                </div>
            </div>


            {/* Modal Nueva Interacción */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-xl font-bold text-gray-900 mb-4">Registrar Interacción</h3>

                            <form onSubmit={handleAddInteraction} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink/50"
                                        value={newInteraction.tipo}
                                        onChange={(e) => setNewInteraction({ ...newInteraction, tipo: e.target.value })}
                                    >
                                        <option value="LLAMADA">Llamada Telefónica</option>
                                        <option value="WHATSAPP">WhatsApp</option>
                                        <option value="EMAIL">Correo Electrónico</option>
                                        <option value="REUNION">Reunión Presencial/Zoom</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resumen</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink/50"
                                        placeholder="Ej: Consulta por precios"
                                        value={newInteraction.resumen}
                                        onChange={(e) => setNewInteraction({ ...newInteraction, resumen: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Detalle</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink/50"
                                        placeholder="Detalles de la conversación..."
                                        value={newInteraction.detalle}
                                        onChange={(e) => setNewInteraction({ ...newInteraction, detalle: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-brand-pink text-white rounded-lg hover:bg-brand-pink/90 transition-colors"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ClientDetail;
