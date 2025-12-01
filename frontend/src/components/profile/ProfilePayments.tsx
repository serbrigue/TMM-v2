import React from 'react';
import { CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { Button } from '../ui/Button';

interface PaymentItem {
    id: number;
    curso_titulo?: string;
    taller_nombre?: string;
    estado_pago: string;
    transacciones?: any[];
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
            <h3 className="text-lg font-bold mb-4 font-serif text-sage-gray">Pagos Pendientes de Verificación</h3>
            {pendingItems.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-4" />
                    <p className="text-gray-500">¡Estás al día! No tienes pagos pendientes.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingItems.map((item, idx) => {
                        const isReviewing = hasPendingReceipt(item);
                        return (
                            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-yellow-200 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isReviewing ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                        {isReviewing ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sage-gray">{item.curso_titulo || item.taller_nombre}</h4>
                                        <p className="text-sm text-gray-500">
                                            {isReviewing
                                                ? 'Comprobante subido. Esperando verificación del administrador.'
                                                : 'Esperando comprobante de pago'}
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
