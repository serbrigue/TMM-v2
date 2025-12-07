import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, ShoppingBag, Calendar, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/Button';
import client from '../api/client';

interface OrderDetail {
    id: number;
    fecha: string;
    estado_pago: string;
    monto_total: number;
    detalles: Array<{
        id: number;
        producto_nombre: string;
        cantidad: number;
        precio_unitario: number;
    }>;
    transacciones?: Array<{
        id: number;
        monto: number;
        fecha: string;
        estado: string;
        comprobante: string;
        observacion?: string;
    }>;
}

const OrderDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await client.get(`/my-orders/${id}/`);
                setOrder(response.data);
            } catch (err) {
                console.error('Error fetching order:', err);
                setError('No se pudo cargar la información del pedido.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tmm-pink"></div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex flex-col">
                <div className="flex-1 container mx-auto px-4 py-8">
                    <Button variant="ghost" onClick={() => navigate('/profile?tab=orders')} className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Mis Pedidos
                    </Button>
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                        {error || 'Pedido no encontrado'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1 container mx-auto px-4 py-8">
                <Button variant="ghost" onClick={() => navigate('/profile?tab=orders')} className="mb-6 hover:bg-white/50">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Mis Pedidos
                </Button>

                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold font-serif text-gray-900 flex items-center gap-3">
                                    <Package className="w-8 h-8 text-tmm-pink" />
                                    Orden #{order.id}
                                </h1>
                                <p className="text-gray-500 mt-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(order.fecha).toLocaleDateString('es-CL', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2
                                ${order.estado_pago === 'APROBADO' ? 'bg-green-100 text-green-700' :
                                    order.estado_pago === 'RECHAZADO' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'}`}>
                                {order.estado_pago === 'APROBADO' ? <CheckCircle className="w-5 h-5" /> :
                                    order.estado_pago === 'RECHAZADO' ? <XCircle className="w-5 h-5" /> :
                                        <Clock className="w-5 h-5" />}
                                <span className="uppercase tracking-wide">{order.estado_pago}</span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total del Pedido</p>
                                <p className="text-2xl font-bold text-gray-900">${order.monto_total.toLocaleString('es-CL')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Método de Pago</p>
                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                    Transferencia Bancaria
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Estado del Envío</p>
                                <p className="font-medium text-gray-900">Pendiente</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50">
                            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-tmm-pink" />
                                Productos
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {order.detalles.map((item) => (
                                <div key={item.id} className="p-6 flex justify-between items-center hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-medium text-gray-600">
                                            {item.cantidad}x
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.producto_nombre}</p>
                                            <p className="text-sm text-gray-500">Código: {item.id}</p>
                                        </div>
                                    </div>
                                    <p className="font-medium text-gray-900">
                                        ${(item.precio_unitario * item.cantidad).toLocaleString('es-CL')}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total a Pagar</p>
                                <p className="text-xl font-bold text-tmm-pink">${order.monto_total.toLocaleString('es-CL')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Transactions History */}
                    {order.transacciones && order.transacciones.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-50">
                                <h2 className="font-bold text-lg text-gray-900">Historial de Pagos</h2>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {order.transacciones.map((transaccion) => (
                                    <div key={transaccion.id} className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    Transferencia por ${transaccion.monto.toLocaleString('es-CL')}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(transaccion.fecha).toLocaleDateString('es-CL', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${transaccion.estado === 'APROBADO' ? 'bg-green-100 text-green-700' :
                                                    transaccion.estado === 'RECHAZADO' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                {transaccion.estado}
                                            </span>
                                        </div>
                                        {transaccion.comprobante && (
                                            <a
                                                href={transaccion.comprobante.startsWith('http') ? transaccion.comprobante : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${transaccion.comprobante}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-tmm-pink hover:underline inline-flex items-center gap-1"
                                            >
                                                Ver Comprobante
                                            </a>
                                        )}
                                        {transaccion.observacion && (
                                            <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                                Nota: {transaccion.observacion}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default OrderDetail;
