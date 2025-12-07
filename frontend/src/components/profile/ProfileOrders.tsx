import { Package, Clock, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/Button';

interface Order {
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
}

interface ProfileOrdersProps {
    orders: Order[];
    onPayOrder: (order: Order) => void;
}

const ProfileOrders = ({ orders, onPayOrder }: ProfileOrdersProps) => {
    if (orders.length === 0) {
        return (
            <div className="text-center py-12 bg-tmm-white rounded-2xl border border-tmm-pink/20 shadow-sm">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-tmm-pink/10">
                    <Package className="w-8 h-8 text-tmm-black/40" />
                </div>
                <h3 className="text-lg font-medium text-tmm-black mb-2">No tienes pedidos</h3>
                <p className="text-tmm-black/60 max-w-sm mx-auto">
                    Tus compras de productos aparecerán aquí.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map((order) => {
                // Check if there is a pending transaction
                const hasPendingReceipt = (order as any).transacciones?.some((t: any) => t.estado === 'PENDIENTE');

                return (
                    <div
                        key={order.id}
                        className="bg-tmm-white rounded-2xl shadow-sm border border-tmm-pink/20 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => window.location.href = `/orders/${order.id}`}
                    >
                        <div className="p-6 border-b border-tmm-pink/10 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-tmm-pink/10 rounded-xl flex items-center justify-center text-tmm-pink">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-tmm-black">Orden #{order.id}</h3>
                                    <p className="text-sm text-tmm-black/60">
                                        {new Date(order.fecha).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {order.estado_pago === 'APROBADO' ? (
                                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Pagado
                                    </div>
                                ) : (
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2
                                        ${order.estado_pago === 'RECHAZADO' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'}`}>
                                        {order.estado_pago === 'RECHAZADO' ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                        {order.estado_pago}
                                    </div>
                                )}
                                <div className="text-right">
                                    <p className="text-sm text-tmm-black/60">Total</p>
                                    <p className="font-bold text-lg text-tmm-black">${order.monto_total.toLocaleString('es-CL')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-tmm-pink/5">
                            <h4 className="text-sm font-medium text-tmm-black/50 mb-4 uppercase tracking-wider">Productos</h4>
                            <div className="space-y-3">
                                {order.detalles.map((detalle) => (
                                    <div key={detalle.id} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-medium border border-tmm-pink/20 text-tmm-black/60">
                                                {detalle.cantidad}x
                                            </span>
                                            <span className="text-tmm-black font-medium">{detalle.producto_nombre}</span>
                                        </div>
                                        <span className="text-tmm-black/70">${detalle.precio_unitario.toLocaleString('es-CL')}</span>
                                    </div>
                                ))}
                            </div>

                            {order.estado_pago === 'PENDIENTE' && (
                                <div className="mt-6 pt-6 border-t border-tmm-pink/10 flex justify-end">
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent card click
                                            !hasPendingReceipt && onPayOrder(order);
                                        }}
                                        disabled={hasPendingReceipt}
                                        variant={hasPendingReceipt ? 'ghost' : 'primary'}
                                        className={hasPendingReceipt ? 'opacity-70 cursor-not-allowed' : ''}
                                    >
                                        {hasPendingReceipt ? (
                                            <>
                                                <Clock className="w-4 h-4 mr-2" />
                                                Comprobante Enviado
                                            </>
                                        ) : (
                                            "Subir Comprobante de Pago"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ProfileOrders;
