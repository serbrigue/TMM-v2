import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Eye, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import { useAdmin } from '../../context/AdminContext';
import { API_URL } from '../../config/api';

const PaymentVerifier = () => {
    const { clientType } = useAdmin();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [filter, setFilter] = useState('PENDIENTE'); // PENDIENTE, APROBADO, RECHAZADO
    const [searchTerm, setSearchTerm] = useState('');

    const [editedAmount, setEditedAmount] = useState('');

    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        if (selectedTransaction) {
            setEditedAmount(selectedTransaction.monto);
        }
    }, [selectedTransaction]);

    useEffect(() => {
        fetchTransactions();
    }, [filter, clientType]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`${API_URL}/admin/transacciones/?estado=${filter}&type=${clientType}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(response.data);
        } catch (error) {
            console.error("Error fetching transactions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        console.log("handleApprove called for id:", id);
        // if (!window.confirm('¿Estás seguro de aprobar esta transacción?')) return;

        setProcessingId(id);
        try {
            console.log("Sending request to approve...");
            const token = localStorage.getItem('access_token');
            // If approving from table (selectedTransaction is null), don't send editedAmount (it's empty)
            // If approving from modal, send editedAmount
            const data = selectedTransaction && selectedTransaction.id === id
                ? { monto: editedAmount }
                : {};

            await axios.post(`${API_URL}/admin/transacciones/${id}/aprobar/`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Request successful");

            // Show success feedback
            alert("Transacción aprobada exitosamente");

            await fetchTransactions();
            setSelectedTransaction(null);
        } catch (error) {
            console.error("Error approving transaction", error);
            alert("Error al aprobar la transacción");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: number) => {
        const reason = window.prompt('Motivo del rechazo:');
        if (reason === null) return; // Cancelled

        setProcessingId(id);
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(`${API_URL}/admin/transacciones/${id}/rechazar/`, { observacion: reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchTransactions();
            setSelectedTransaction(null);
        } catch (error) {
            console.error("Error rejecting transaction", error);
            alert("Error al rechazar la transacción");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredTransactions = transactions.filter(t =>
        t.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toString().includes(searchTerm)
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Verificación de Pagos</h1>
                    <p className="text-gray-500">Gestiona los comprobantes de pago subidos por los clientes.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar cliente o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tmm-black focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                {['PENDIENTE', 'APROBADO', 'RECHAZADO'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${filter === status
                            ? 'border-tmm-black text-tmm-black'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {status === 'PENDIENTE' ? 'Pendientes' : status === 'APROBADO' ? 'Aprobados' : 'Rechazados'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">ID</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Cliente</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Item</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Monto</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Fecha</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Comprobante</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Cargando...</td>
                            </tr>
                        ) : filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No hay transacciones encontradas.</td>
                            </tr>
                        ) : (
                            filteredTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-900 font-medium">#{t.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{t.cliente_nombre}</div>
                                        <div className="text-xs text-gray-500">ID: {t.cliente_id}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{t.item_nombre}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">${parseInt(t.monto).toLocaleString('es-CL')}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(t.fecha).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedTransaction(t)}
                                            className="flex items-center gap-1 text-tmm-black hover:underline text-sm font-medium"
                                        >
                                            <Eye className="w-4 h-4" /> Ver
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        {t.estado === 'PENDIENTE' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedTransaction(t)}
                                                    className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                                    title="Revisar"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(t.id)}
                                                    disabled={processingId === t.id}
                                                    className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                                    title="Aprobar"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(t.id)}
                                                    disabled={processingId === t.id}
                                                    className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                                    title="Rechazar"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                        {t.estado === 'APROBADO' && <span className="text-green-600 text-sm font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Aprobado</span>}
                                        {t.estado === 'RECHAZADO' && <span className="text-red-600 text-sm font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> Rechazado</span>}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table >
            </div >

            {/* Receipt Modal */}
            < Dialog.Root open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto z-[60] focus:outline-none">
                        <div className="flex justify-between items-center mb-4">
                            <Dialog.Title className="text-xl font-bold text-gray-900">Comprobante de Pago</Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </Dialog.Close>
                        </div>

                        {selectedTransaction && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column: Receipt Image */}
                                <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center h-[600px]">
                                    {selectedTransaction.comprobante ? (
                                        selectedTransaction.comprobante.endsWith('.pdf') ? (
                                            <iframe src={selectedTransaction.comprobante} className="w-full h-full" title="Comprobante PDF"></iframe>
                                        ) : (
                                            <img src={selectedTransaction.comprobante} alt="Comprobante" className="max-w-full max-h-full object-contain" />
                                        )
                                    ) : (
                                        <p className="text-gray-500">No hay imagen disponible</p>
                                    )}
                                </div>

                                {/* Right Column: Details and Actions */}
                                <div className="space-y-6 flex flex-col h-full">
                                    <div className="bg-gray-50 p-4 rounded-xl grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 block">Cliente</span>
                                            <span className="font-medium text-gray-900">{selectedTransaction.cliente_nombre}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Monto Original</span>
                                            <span className="font-medium text-gray-900">${parseInt(selectedTransaction.monto).toLocaleString('es-CL')}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Item</span>
                                            <span className="font-medium text-gray-900">{selectedTransaction.item_nombre}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Fecha</span>
                                            <span className="font-medium text-gray-900">{new Date(selectedTransaction.fecha).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {selectedTransaction.estado === 'PENDIENTE' && (
                                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex-1 flex flex-col justify-center">
                                            <label className="block text-lg font-medium text-blue-900 mb-2">
                                                Monto Real a Aprobar
                                            </label>
                                            <div className="relative mb-2">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    value={editedAmount}
                                                    onChange={(e) => setEditedAmount(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 text-lg border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <p className="text-sm text-blue-600">
                                                Verifica el monto en el comprobante (izquierda) e ingrésalo aquí si es diferente.
                                            </p>
                                        </div>
                                    )}

                                    {selectedTransaction.estado === 'PENDIENTE' && (
                                        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-auto">
                                            <Button
                                                onClick={() => handleApprove(selectedTransaction.id)}
                                                isLoading={processingId === selectedTransaction.id}
                                                disabled={processingId === selectedTransaction.id}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                                            >
                                                <CheckCircle className="w-5 h-5 mr-2" /> Aprobar Pago
                                            </Button>
                                            <Button
                                                onClick={() => handleReject(selectedTransaction.id)}
                                                isLoading={processingId === selectedTransaction.id}
                                                disabled={processingId === selectedTransaction.id}
                                                variant="outline"
                                                className="flex-1 border-red-200 text-red-700 hover:bg-red-50 py-3 text-lg"
                                            >
                                                <XCircle className="w-5 h-5 mr-2" /> Rechazar
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root >
        </div >
    );
};

export default PaymentVerifier;
