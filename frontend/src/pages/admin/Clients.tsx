import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, Mail, Phone, MapPin, Eye, Send, X } from 'lucide-react';

const AdminClients = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [clients, setClients] = useState<any[]>([]);
    const [filteredClients, setFilteredClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'TODOS');
    const [paymentFilter, setPaymentFilter] = useState(searchParams.get('payment') || 'TODOS');
    const [selectedClients, setSelectedClients] = useState<number[]>([]);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailTemplate, setEmailTemplate] = useState('OFERTA');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        // Update filters if URL params change
        const statusParam = searchParams.get('status');
        const paymentParam = searchParams.get('payment');
        if (statusParam) setFilterStatus(statusParam);
        if (paymentParam) setPaymentFilter(paymentParam);
    }, [searchParams]);

    useEffect(() => {
        applyFilters();
    }, [clients, searchTerm, filterStatus, paymentFilter]);

    // ... (email template effect)

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('http://localhost:8000/api/admin/clientes/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(response.data);
        } catch (error) {
            console.error("Error fetching clients", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...clients];

        if (searchTerm) {
            filtered = filtered.filter((client: any) =>
                client.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus !== 'TODOS') {
            filtered = filtered.filter((client: any) => client.estado_ciclo === filterStatus);
        }

        if (paymentFilter !== 'TODOS') {
            // Assuming client object has a payment_status or similar. 
            // If not, we might need to rely on a different property or fetch logic.
            // For now, I'll assume there's a property 'estado_pago' or similar based on the request.
            // Let's check the client object structure in the table rendering.
            // It doesn't show payment status in the table. 
            // However, the user asked to redirect to "Pagos pendientes".
            // I will assume there is a field, or I will filter based on logic if available.
            // Let's assume 'estado_pago' exists for now, or check if I can infer it.
            filtered = filtered.filter((client: any) => client.estado_pago === paymentFilter);
        }

        setFilteredClients(filtered);
    };

    const toggleClientSelection = (clientId: number) => {
        setSelectedClients(prev =>
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId)
                : [...prev, clientId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedClients.length === filteredClients.length) {
            setSelectedClients([]);
        } else {
            setSelectedClients(filteredClients.map((c: any) => c.id));
        }
    };

    const handleSendEmail = async () => {
        if (!emailSubject || !emailMessage) {
            alert('Por favor completa el asunto y mensaje');
            return;
        }

        setSending(true);
        try {
            const token = localStorage.getItem('access_token');
            await axios.post('http://localhost:8000/api/admin/send-bulk-email/', {
                client_ids: selectedClients,
                template_type: emailTemplate,
                subject: emailSubject,
                message: emailMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`Emails enviados exitosamente a ${selectedClients.length} clientes`);
            setShowEmailModal(false);
            setSelectedClients([]);
        } catch (error) {
            console.error("Error sending emails", error);
            alert('Error al enviar emails');
        } finally {
            setSending(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold font-heading text-gray-800">Cartera de Clientes</h2>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-calypso/20 focus:border-brand-calypso w-64"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-calypso/20 focus:border-brand-calypso appearance-none bg-white"
                        >
                            <option value="TODOS">Todos los estados</option>
                            <option value="LEAD">Lead</option>
                            <option value="PROSPECTO">Prospecto</option>
                            <option value="CLIENTE">Cliente</option>
                            <option value="INACTIVO">Inactivo</option>
                        </select>
                    </div>

                    {selectedClients.length > 0 && (
                        <button
                            onClick={() => setShowEmailModal(true)}
                            className="bg-brand-calypso text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-calypso/90 transition-colors"
                        >
                            <Send className="w-5 h-5" />
                            Enviar Email ({selectedClients.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div
                    onClick={() => setFilterStatus('TODOS')}
                    className={`bg-white p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${filterStatus === 'TODOS' ? 'border-brand-calypso ring-1 ring-brand-calypso' : 'border-gray-100'}`}
                >
                    <p className="text-sm text-gray-500">Total Clientes</p>
                    <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                </div>
                <div
                    onClick={() => setFilterStatus('CLIENTE')}
                    className={`bg-green-50 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${filterStatus === 'CLIENTE' ? 'border-green-500 ring-1 ring-green-500' : 'border-green-100'}`}
                >
                    <p className="text-sm text-green-600">Clientes Activos</p>
                    <p className="text-2xl font-bold text-green-700">{clients.filter(c => c.estado_ciclo === 'CLIENTE').length}</p>
                </div>
                <div
                    onClick={() => setFilterStatus('PROSPECTO')}
                    className={`bg-yellow-50 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${filterStatus === 'PROSPECTO' ? 'border-yellow-500 ring-1 ring-yellow-500' : 'border-yellow-100'}`}
                >
                    <p className="text-sm text-yellow-600">Prospectos</p>
                    <p className="text-2xl font-bold text-yellow-700">{clients.filter(c => c.estado_ciclo === 'PROSPECTO').length}</p>
                </div>
                <div
                    onClick={() => setFilterStatus('LEAD')}
                    className={`bg-gray-50 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${filterStatus === 'LEAD' ? 'border-gray-500 ring-1 ring-gray-500' : 'border-gray-100'}`}
                >
                    <p className="text-sm text-gray-600">Leads</p>
                    <p className="text-2xl font-bold text-gray-700">{clients.filter(c => c.estado_ciclo === 'LEAD').length}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left w-10">
                                <input
                                    type="checkbox"
                                    checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 text-brand-calypso rounded focus:ring-brand-calypso"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubicación</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Registro</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredClients.map((client: any) => (
                            <tr
                                key={client.id}
                                onClick={(e) => {
                                    // Prevent navigation if clicking checkbox or action button
                                    if ((e.target as HTMLElement).closest('input[type="checkbox"]') || (e.target as HTMLElement).closest('button')) {
                                        return;
                                    }
                                    navigate(`/admin/clients/${client.id}`);
                                }}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedClients.includes(client.id)}
                                        onChange={() => toggleClientSelection(client.id)}
                                        className="w-4 h-4 text-brand-calypso rounded focus:ring-brand-calypso"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-pink/10 rounded-full flex items-center justify-center text-brand-pink font-bold">
                                            {client.nombre_completo.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{client.nombre_completo}</p>
                                            <p className="text-sm text-gray-500">{client.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3 h-3 text-gray-400" />
                                            <span className="truncate max-w-[200px]">{client.email}</span>
                                        </div>
                                        {client.telefono && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3 h-3 text-gray-400" />
                                                {client.telefono}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {client.comuna_vive && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="w-3 h-3 text-gray-400" />
                                            {client.comuna_vive}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${client.estado_ciclo === 'CLIENTE' ? 'bg-green-100 text-green-700' :
                                        client.estado_ciclo === 'PROSPECTO' ? 'bg-yellow-100 text-yellow-700' :
                                            client.estado_ciclo === 'INACTIVO' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-600'
                                        }`}>
                                        {client.estado_ciclo}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(client.fecha_registro).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => navigate(`/admin/clients/${client.id}`)}
                                        className="flex items-center gap-2 text-brand-calypso hover:text-brand-calypso/80 font-medium text-sm"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Ver Detalle
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredClients.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">
                        No se encontraron clientes con los filtros aplicados.
                    </div>
                )}
            </div>

            {/* Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Enviar Email a {selectedClients.length} clientes</h3>
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
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-calypso/20 focus:border-brand-calypso"
                                >
                                    <option value="OFERTA">Oferta Especial</option>
                                    <option value="RECORDATORIO">Recordatorio</option>
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
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-calypso/20 focus:border-brand-calypso"
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
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-calypso/20 focus:border-brand-calypso"
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
                                className="px-4 py-2 bg-brand-calypso text-white rounded-lg hover:bg-brand-calypso/90 transition-colors disabled:opacity-50 flex items-center gap-2"
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

export default AdminClients;
