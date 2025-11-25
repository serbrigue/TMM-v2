import React, { useState, useEffect } from 'react';
import { X, CreditCard, Lock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    amount: number;
    itemName: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm, amount, itemName }) => {
    const { refreshEnrollments } = useAuth();
    const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
    const [userInfo, setUserInfo] = useState<any>(null);
    const [cardNumber, setCardNumber] = useState('4532 1234 5678 9010');
    const [expiry, setExpiry] = useState('12/25');
    const [cvc, setCvc] = useState('123');

    useEffect(() => {
        if (isOpen) {
            fetchUserInfo();
        }
    }, [isOpen]);

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('http://localhost:8000/api/profile/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserInfo(response.data);
        } catch (error) {
            console.error("Error fetching user info", error);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('processing');

        // Simulate payment processing delay
        setTimeout(async () => {
            try {
                await onConfirm();
                await refreshEnrollments(); // Refresh enrollments in context
                setStep('success');
            } catch (error) {
                console.error(error);
                setStep('form'); // Go back to form on error
                alert("Error al procesar el pago. Inténtalo de nuevo.");
            }
        }, 1500);
    };

    const handleQuickPay = async () => {
        setStep('processing');
        setTimeout(async () => {
            try {
                await onConfirm();
                await refreshEnrollments(); // Refresh enrollments in context
                setStep('success');
            } catch (error) {
                console.error(error);
                setStep('form');
                alert("Error al procesar el pago. Inténtalo de nuevo.");
            }
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative">
                {step !== 'success' && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    >
                        <X size={24} />
                    </button>
                )}

                <div className="p-8">
                    {step === 'form' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-brand-calypso/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="w-8 h-8 text-brand-calypso" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Pago Seguro</h2>
                                <p className="text-gray-500 mt-2">Estás comprando: <span className="font-medium text-gray-900">{itemName}</span></p>
                                <p className="text-3xl font-bold text-brand-calypso mt-4">${amount.toLocaleString('es-CL')}</p>
                            </div>

                            {/* Quick Pay Button */}
                            <div className="mb-6">
                                <button
                                    onClick={handleQuickPay}
                                    className="w-full bg-gradient-to-r from-brand-calypso to-brand-pink text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg"
                                >
                                    ✨ Pago Rápido - ${amount.toLocaleString('es-CL')}
                                </button>
                                <p className="text-xs text-center text-gray-500 mt-2">Modo de prueba activado - Click para inscribirte</p>
                            </div>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">o completa los datos</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-calypso focus:border-transparent transition-all"
                                        />
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Exp.</label>
                                        <input
                                            type="text"
                                            value={expiry}
                                            onChange={(e) => setExpiry(e.target.value)}
                                            placeholder="MM/AA"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-calypso focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                        <input
                                            type="text"
                                            value={cvc}
                                            onChange={(e) => setCvc(e.target.value)}
                                            placeholder="123"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-calypso focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-2 text-xs text-gray-500 mt-4">
                                    <Lock className="w-3 h-3" />
                                    Pagos encriptados y seguros. Modo Simulación Activado.
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-brand-calypso text-white py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all transform hover:scale-[1.02] shadow-lg shadow-brand-calypso/30 mt-6"
                                >
                                    Pagar ${amount.toLocaleString('es-CL')}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 'processing' && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 border-4 border-brand-calypso border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                            <h3 className="text-xl font-bold text-gray-900">Procesando pago...</h3>
                            <p className="text-gray-500 mt-2">Por favor no cierres esta ventana.</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h2>
                            <p className="text-gray-500 mb-2">Te has inscrito correctamente en {itemName}.</p>
                            {userInfo && (
                                <p className="text-sm text-gray-600 mb-8">
                                    Hemos enviado un correo de confirmación a <span className="font-medium">{userInfo.email}</span>
                                </p>
                            )}
                            <button
                                onClick={() => {
                                    onClose();
                                    setStep('form');
                                    // Reload to show updated enrollment status
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 500);
                                }}
                                className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                            >
                                Continuar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
