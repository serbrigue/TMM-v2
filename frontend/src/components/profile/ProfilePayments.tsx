import React from 'react';
import { CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { Button } from '../ui/Button';

interface PaymentItem {
    id: number;
    curso_titulo?: string;
    taller_nombre?: string;
    orden_id?: number;
    monto_total?: number;
    estado_pago: string;
    transacciones?: any[];
    detalles?: Array<{
        id: number;
        producto_nombre: string;
        cantidad: number;
        precio_unitario: number;
    }>;
}

interface ProfilePaymentsProps {
    items: PaymentItem[];
    onUploadReceipt: (item: PaymentItem) => void;
}

const ProfilePayments: React.FC<ProfilePaymentsProps> = ({ items, onUploadReceipt }) => {
    const pendingItems = items.filter(item => item.estado_pago === 'PENDIENTE');

    const hasPendingReceipt = (item: PaymentItem) => {
        return item.transacciones?.some(t => t.comprobante && t.estado === 'PENDIENTE');
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold mb-4 font-serif text-tmm-black">Pagos Pendientes de Verificación</h3>
            {pendingItems.length === 0 ? (
                <div className="text-center py-16 bg-tmm-white rounded-2xl border border-dashed border-tmm-pink/20">
                    <CheckCircle className="w-12 h-12 text-tmm-green mx-auto mb-4" />
                    <p className="text-tmm-black/60">¡Estás al día! No tienes pagos pendientes.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingItems.map((item, idx) => {
                        const isReviewing = hasPendingReceipt(item);

                        let title = item.curso_titulo || item.taller_nombre || (item.orden_id ? `Orden #${item.orden_id}` : 'Item Desconocido');
                        let subtitle = isReviewing
                            ? 'Comprobante subido. Esperando verificación del administrador.'
                            : 'Esperando comprobante de pago';

                        // If it's an order with details, show products
                        if (item.orden_id && item.detalles && item.detalles.length > 0) {
                            const productNames = item.detalles.map(d => `${d.cantidad}x ${d.producto_nombre}`).join(', ');
                            title = `Orden #${item.orden_id} - ${productNames}`;
                        }

                        return (
                            <div key={idx} className="bg-tmm-white p-6 rounded-2xl shadow-sm border border-tmm-yellow flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isReviewing ? 'bg-tmm-green/20 text-tmm-black' : 'bg-tmm-yellow/20 text-tmm-black'}`}>
                                        {isReviewing ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-tmm-black">{title}</h4>
                                        <p className="text-sm text-tmm-black/60">
                                            {subtitle}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => onUploadReceipt(item)}
                                    disabled={isReviewing}
                                    variant={isReviewing ? 'outline' : 'primary'}
                                    className={isReviewing ? 'opacity-70 cursor-not-allowed' : ''}
                                >
                                    {isReviewing ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            En Revisión
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Subir Comprobante
                                        </>
                                    )}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProfilePayments;
