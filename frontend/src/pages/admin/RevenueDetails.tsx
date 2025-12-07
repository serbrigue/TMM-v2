import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Download, Mail, CheckSquare, Square, X } from 'lucide-react';
import { API_URL } from '../../config/api';

const RevenueDetails = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const type = searchParams.get('type') || 'services';
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [category, setCategory] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Selection & Email
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);

    const getTitle = () => {
        switch (type) {
            case 'services': return 'Ingresos por Servicios';
            case 'pending': return 'Pagos Pendientes';
            case 'products': return 'Ingresos por Productos';
            default: return 'Detalle de Transacciones';
        }
    };

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('access_token');
                let query = `?type=${type}`;
                if (startDate) query += `&start_date=${startDate}`;
                if (endDate) query += `&end_date=${endDate}`;
                if (category) query += `&category=${category}`;
                if (statusFilter) query += `&status=${statusFilter}`;

                const response = await axios.get(`${API_URL}/admin/transactions/${query}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTransactions(response.data);
                setSelectedIds([]); // Reset selection on filter change
            } catch (error) {
                console.error("Error fetching transactions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [type, startDate, endDate, category, statusFilter]);

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('access_token');
            let query = `?type=${type}&export=true`;
            if (startDate) query += `&start_date=${startDate}`;
            if (endDate) query += `&end_date=${endDate}`;
            if (category) query += `&category=${category}`;
            if (statusFilter) query += `&status=${statusFilter}`;

            const response = await axios.get(`${API_URL}/admin/transactions/${query}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_${type}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error exporting", error);
            alert("Error al exportar reporte");
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === transactions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(transactions.map(t => t.client_id).filter(id => id)); // Select client IDs
        }
    };

    const toggleSelect = (clientId: number) => {
        if (selectedIds.includes(clientId)) {
            setSelectedIds(selectedIds.filter(id => id !== clientId));
        } else {
            setSelectedIds([...selectedIds, clientId]);
        }
    };

    // Templates
    const TEMPLATES = {
        payment_reminder: {
            label: "Recordatorio de Pago",
            subject: "Recordatorio de Pago Pendiente: {taller_curso}",
            message: "Hola {nombre},\n\nTe escribimos para recordarte que tienes un pago pendiente para \"{taller_curso}\".\n\nPor favor, regulariza tu situación lo antes posible para asegurar tu cupo.\n\nSi ya realizaste el pago, por favor omite este mensaje o envíanos el comprobante.\n\nSaludos,\nEquipo TMM"
        },
        event_reminder: {
            label: "Recordatorio de Evento",
            subject: "Recordatorio: {taller_curso} se acerca",
            message: "Hola {nombre},\n\n¡Te esperamos pronto para \"{taller_curso}\"!\n\nRecuerda que nos vemos el [FECHA] a las [HORA].\n\nTe recomendamos llegar unos minutos antes.\n\n¡Nos vemos!\nEquipo TMM"
        },
        cancellation: {
            label: "Cancelación de Taller",
            subject: "Importante: Cancelación de {taller_curso}",
            message: "Hola {nombre},\n\nLamentamos informarte que el taller \"{taller_curso}\" ha sido cancelado por motivos de fuerza mayor.\n\nNos pondremos en contacto contigo a la brevedad para gestionar la devolución de tu dinero o la reprogramación.\n\nSentimos los inconvenientes.\n\nSaludos,\nEquipo TMM"
        }
    };

    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [itemName, setItemName] = useState('');

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const key = e.target.value;
        setSelectedTemplate(key);
        if (key && TEMPLATES[key as keyof typeof TEMPLATES]) {
            const t = TEMPLATES[key as keyof typeof TEMPLATES];
            setEmailSubject(t.subject);
            setEmailMessage(t.message);
        } else {
            setEmailSubject('');
            setEmailMessage('');
        }
    };

    const handleSendEmail = async () => {
        if (!emailSubject || !emailMessage) {
            alert("Por favor ingrese asunto y mensaje");
            return;
        }
        setSendingEmail(true);
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(`${API_URL}/admin/send-bulk-email/`, {
                client_ids: selectedIds,
                subject: emailSubject,
                message: emailMessage,
                item_name: itemName || "Comunicado Administrativo"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Correos enviados exitosamente");
            setShowEmailModal(false);
            setEmailSubject('');
            setEmailMessage('');
            setSelectedIds([]);
            setSelectedTemplate('');
            setItemName('');
        } catch (error) {
            console.error("Error sending emails", error);
            alert("Error al enviar correos");
        } finally {
            setSendingEmail(false);
        }
    };

    return (
        <div className="p-6 relative">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/revenue')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{getTitle()}</h1>
                        <p className="text-gray-500 text-sm">
                            {transactions.length} registros encontrados
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowEmailModal(true)}
                        disabled={selectedIds.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-tmm-pink text-tmm-black rounded-lg hover:bg-tmm-pink/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Mail className="w-4 h-4" />
                        Enviar Correo {selectedIds.length > 0 && `(${selectedIds.length})`}
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Inicio</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tmm-pink focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Fin</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tmm-pink focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tmm-pink focus:border-transparent outline-none min-w-[150px]"
                    >
                        <option value="">Todos</option>
                        <option value="PAGADO">Pagado</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="ANULADO">Anulado</option>
                        <option value="RECHAZADO">Rechazado</option>
                    </select>
                </div>
                {type === 'services' && (
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tmm-pink focus:border-transparent outline-none min-w-[150px]"
                        >
                            <option value="">Todas</option>
                            <option value="1">Bienestar</option>
                            <option value="2">Yoga</option>
                            {/* Add more categories dynamically if needed */}
                        </select>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 w-10">
                                <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                                    {selectedIds.length === transactions.length && transactions.length > 0 ? (
                                        <CheckSquare className="w-5 h-5" />
                                    ) : (
                                        <Square className="w-5 h-5" />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item / Concepto</th>
                            {type === 'services' && <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>}
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">Cargando...</td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No se encontraron registros.</td>
                            </tr>
                        ) : (
                            transactions.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => toggleSelect(t.client_id)}
                                            className={`${selectedIds.includes(t.client_id) ? 'text-tmm-pink' : 'text-gray-300 hover:text-gray-400'}`}
                                        >
                                            {selectedIds.includes(t.client_id) ? (
                                                <CheckSquare className="w-5 h-5" />
                                            ) : (
                                                <Square className="w-5 h-5" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">#{t.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(t.date).toLocaleDateString('es-CL')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{t.client}</div>
                                        <div className="text-xs text-gray-500">{t.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={t.item}>
                                        {t.item}
                                    </td>
                                    {type === 'services' && (
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                                {t.category}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        ${parseInt(t.amount).toLocaleString('es-CL')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${t.status === 'PAGADO' ? 'bg-green-100 text-green-700' :
                                            t.status === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
                                                t.status === 'ANULADO' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Enviar Correo a {selectedIds.length} Clientes</h3>
                            <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Plantilla</label>
                                <select
                                    value={selectedTemplate}
                                    onChange={handleTemplateChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tmm-pink focus:border-transparent outline-none"
                                >
                                    <option value="">Seleccionar Plantilla...</option>
                                    {Object.entries(TEMPLATES).map(([key, t]) => (
                                        <option key={key} value={key}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Evento/Producto (para {"{taller_curso}"})</label>
                                <input
                                    type="text"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tmm-pink focus:border-transparent outline-none"
                                    placeholder="Ej: Taller de Yoga"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tmm-pink focus:border-transparent outline-none"
                                    placeholder="Asunto del correo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                                <textarea
                                    value={emailMessage}
                                    onChange={(e) => setEmailMessage(e.target.value)}
                                    rows={5}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tmm-pink focus:border-transparent outline-none resize-none"
                                    placeholder="Escriba su mensaje aquí..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Variables disponibles: {"{nombre}"}, {"{taller_curso}"}
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSendEmail}
                                disabled={sendingEmail}
                                className="px-4 py-2 bg-tmm-pink text-tmm-black rounded-lg hover:bg-tmm-pink/90 transition-colors disabled:opacity-50"
                            >
                                {sendingEmail ? 'Enviando...' : 'Enviar Correo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevenueDetails;
