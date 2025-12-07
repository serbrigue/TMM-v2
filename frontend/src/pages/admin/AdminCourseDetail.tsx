import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../api/client';
import { ArrowLeft, PlayCircle, Clock, DollarSign, Users, CheckCircle, Mail, Download, X, Send } from 'lucide-react';

const AdminCourseDetail = () => {
    const { id } = useParams();
    const [course, setCourse] = useState<any>(null);
    const [stats, setStats] = useState({
        total_revenue: 0,
        inscritos_count: 0,
        inscritos: []
    });
    const [loading, setLoading] = useState(true);
    const [filterPayment, setFilterPayment] = useState('TODOS');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailTemplate, setEmailTemplate] = useState('RECORDATORIO');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const response = await client.get(`/admin/cursos/${id}/`);
                setCourse(response.data);
                if (response.data.stats) {
                    setStats(response.data.stats);
                }
            } catch (error) {
                console.error("Error fetching course details", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCourseDetails();
        }
    }, [id]);

    useEffect(() => {
        if (emailTemplate === 'RECORDATORIO') {
            setEmailSubject('Recordatorio de Pago Pendiente - {taller_curso}');
            setEmailMessage(`Hola {nombre},

Te recordamos que tienes un pago pendiente para el curso "{taller_curso}".

Para realizar tu pago y regularizar tu inscripción, por favor ingresa a tu perfil en el siguiente enlace:
http://localhost:5173/profile?tab=payments

Si ya realizaste el pago, por favor sube el comprobante en el mismo enlace.

¡Gracias!
Equipo TMM Bienestar`);
        } else if (emailTemplate === 'INFO') {
            setEmailSubject('Información Importante sobre {taller_curso}');
            setEmailMessage(`Hola {nombre},

Queremos compartir contigo información importante sobre el curso "{taller_curso}".

[Escribe aquí la información relevante...]

Saludos,
Equipo TMM Bienestar`);
        } else if (emailTemplate === 'PERSONALIZADO') {
            setEmailSubject('');
            setEmailMessage('');
        }
    }, [emailTemplate]);

    const handleSendEmail = async () => {
        setSending(true);
        try {
            const clientIds = filteredInscritos.map((i: any) => i.id);

            if (clientIds.length === 0) {
                alert("No hay destinatarios seleccionados");
                setSending(false);
                return;
            }

            await client.post('/admin/send-bulk-email/', {
                client_ids: clientIds,
                template_type: emailTemplate,
                subject: emailSubject,
                message: emailMessage,
                item_name: course?.titulo || 'Curso'
            });

            alert("Emails enviados correctamente");
            setShowEmailModal(false);
            setEmailSubject('');
            setEmailMessage('');
        } catch (error) {
            console.error("Error sending email", error);
            alert("Error al enviar el email");
        } finally {
            setSending(false);
        }
    };

    const handleStatusChange = async (enrollmentId: number, newStatus: string) => {
        if (!window.confirm(`¿Estás seguro de cambiar el estado a ${newStatus}?`)) return;

        try {
            await client.patch(`/admin/enrollments/${enrollmentId}/`, {
                estado_pago: newStatus
            });

            // Refresh data
            const response = await client.get(`/admin/cursos/${id}/`);
            setCourse(response.data);
            if (response.data.stats) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error("Error updating status", error);
            alert("Error al actualizar el estado");
        }
    };

    if (loading) return <div className="p-6">Cargando...</div>;
    if (!course) return <div className="p-6">Curso no encontrado</div>;

    const filteredInscritos = stats.inscritos.filter((inscrito: any) => {
        if (filterPayment === 'PENDIENTE') {
            return inscrito.estado_pago === 'PENDIENTE' || inscrito.estado_pago === 'ABONADO';
        }
        return true;
    });

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link to="/admin/courses" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold font-heading text-gray-800">{course.titulo}</h1>
                    <div className="flex items-center gap-4 text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                            <PlayCircle className="w-4 h-4" />
                            Curso Grabado
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {course.duracion}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${course.esta_activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {course.esta_activo ? 'Activo' : 'Inactivo'}
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
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Estudiantes Inscritos</h3>
                    <p className="text-3xl font-bold text-gray-800">
                        {stats.inscritos_count}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Precio Curso</h3>
                    <p className="text-3xl font-bold text-gray-800">${parseInt(course.precio).toLocaleString('es-CL')}</p>
                </div>
            </div>

            {/* Enrolled List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h3 className="font-bold text-gray-800">Listado de Estudiantes</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterPayment('TODOS')}
                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterPayment === 'TODOS' ? 'bg-gray-100 border-gray-300 font-medium' : 'border-transparent hover:bg-gray-50'}`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFilterPayment('PENDIENTE')}
                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterPayment === 'PENDIENTE' ? 'bg-red-50 border-red-200 text-red-700 font-medium' : 'border-transparent hover:bg-gray-50 text-gray-600'}`}
                            >
                                Pendientes
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowEmailModal(true)}
                            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50"
                        >
                            <Mail className="w-4 h-4" />
                            Email a {filterPayment === 'PENDIENTE' ? 'Pendientes' : 'Todos'} ({filteredInscritos.length})
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
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estudiante</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Contacto</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha Inscripción</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado Pago</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Monto Pagado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInscritos.length > 0 ? (
                                filteredInscritos.map((inscrito: any) => (
                                    <tr key={inscrito.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <Link to={`/admin/clients/${inscrito.id}`} className="font-medium text-tmm-black hover:underline">
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
                                            <select
                                                value={inscrito.estado_pago}
                                                onChange={(e) => handleStatusChange(inscrito.enrollment_id, e.target.value)}
                                                className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 ${inscrito.estado_pago === 'PAGADO' ? 'bg-green-100 text-green-700 focus:ring-green-500' :
                                                    inscrito.estado_pago === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700 focus:ring-yellow-500' :
                                                        inscrito.estado_pago === 'ANULADO' ? 'bg-red-100 text-red-700 focus:ring-red-500' :
                                                            'bg-blue-100 text-blue-700 focus:ring-blue-500'
                                                    }`}
                                            >
                                                <option value="PENDIENTE">PENDIENTE</option>
                                                <option value="PAGADO">PAGADO</option>
                                                <option value="ABONADO">ABONADO</option>
                                                <option value="ANULADO">ANULADO</option>
                                                <option value="RECHAZADO">RECHAZADO</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            ${inscrito.monto_pagado.toLocaleString('es-CL')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No hay estudiantes inscritos en este curso.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">
                                Enviar Email a {filteredInscritos.length} inscritos {filterPayment === 'PENDIENTE' ? '(Pendientes)' : ''}
                            </h3>
                            <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Template Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Email</label>
                                <select
                                    value={emailTemplate}
                                    onChange={(e) => setEmailTemplate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tmm-black/20 focus:border-tmm-black"
                                >
                                    <option value="RECORDATORIO">Recordatorio de Pago</option>
                                    <option value="INFO">Información del Curso</option>
                                    <option value="PERSONALIZADO">Personalizado</option>
                                </select>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Asunto</label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tmm-black/20 focus:border-tmm-black"
                                    placeholder="Asunto del email"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                                <textarea
                                    value={emailMessage}
                                    onChange={(e) => setEmailMessage(e.target.value)}
                                    rows={8}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tmm-black/20 focus:border-tmm-black"
                                    placeholder="Escribe tu mensaje aquí..."
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSendEmail}
                                disabled={sending}
                                className="px-4 py-2 bg-tmm-black text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {sending ? 'Enviando...' : 'Enviar Emails'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCourseDetail;
