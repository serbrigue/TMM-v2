import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Check, X, Eye, AlertCircle, DollarSign, Calendar } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const PaymentVerifier = () => {
    const { clientType } = useAdmin();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        fetchTransactions();
    }, [clientType]);

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`http://localhost:8000/api/admin/transacciones/?estado=PENDIENTE&type=${clientType}`, {
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
        if (!window.confirm("¿Estás seguro de aprobar este pago?")) return;

        try {
            setProcessingId(id);
            const token = localStorage.getItem('access_token');
            await axios.post(`http://localhost:8000/api/admin/transacciones/${id}/aprobar/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove from list
            setTransactions(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error("Error approving transaction", error);
            alert("Error al aprobar la transacción");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: number) => {
        const reason = window.prompt("Motivo del rechazo (opcional):");
        if (reason === null) return; // Cancelled

        try {
            setProcessingId(id);
            const token = localStorage.getItem('access_token');
            await axios.post(`http://localhost:8000/api/admin/transacciones/${id}/rechazar/`, { observacion: reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove from list
            setTransactions(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error("Error rejecting transaction", error);
            alert("Error al rechazar la transacción");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando transacciones...</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold font-heading text-gray-800 mb-8">Verificador de Pagos</h2>

            {transactions.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className="bg-green-100 p-4 rounded-full inline-flex mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">¡Todo al día!</h3>
                    <p className="text-gray-500">No hay pagos pendientes de revisión.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">ID</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Fecha</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Cliente</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Item</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Monto</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Comprobante</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-sm text-gray-500">#{t.id}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(t.fecha).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-gray-900">
                                            <Link to={`/admin/clients/${t.cliente_id}`} className="text-brand-calypso hover:underline">
                                                {t.cliente_nombre}
                                            </Link>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {t.taller_id ? (
                                                <Link to={`/admin/workshops/${t.taller_id}`} className="text-brand-calypso hover:underline">
                                                    {t.item_nombre}
                                                </Link>
                                            ) : (
                                                t.item_nombre
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 font-bold text-gray-800">
                                                <DollarSign className="w-4 h-4 text-gray-400" />
                                                {parseInt(t.monto).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {t.comprobante ? (
                                                <button
                                                    onClick={() => setSelectedImage(t.comprobante)}
                                                    className="flex items-center gap-2 text-brand-calypso hover:text-brand-pink transition-colors text-sm font-medium"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Ver Comprobante
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-sm flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    Sin imagen
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApprove(t.id)}
                                                    disabled={processingId === t.id}
                                                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                                    title="Aprobar"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(t.id)}
                                                    disabled={processingId === t.id}
                                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                                    title="Rechazar"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img src={selectedImage} alt="Comprobante" className="max-w-full max-h-[85vh] object-contain" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentVerifier;
