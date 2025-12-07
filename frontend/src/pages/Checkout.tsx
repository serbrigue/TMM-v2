import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { Trash2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import PaymentModal from '../components/PaymentModal';

const Checkout = () => {
    const { items: cart, removeFromCart, cartTotal: total, clearCart } = useCart();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [orderId, setOrderId] = useState<number | null>(null);

    const handleCreateOrder = async () => {
        setIsProcessing(true);
        try {
            const items = cart.map(item => ({
                type: item.type,
                id: item.id,
                quantity: item.quantity
            }));

            const response = await client.post('/checkout/', { items });

            if (response.status === 201) {
                setOrderId(response.data.orden_id);
                setIsPaymentModalOpen(true);
                // Don't clear cart yet, wait for payment confirmation or just leave it?
                // Usually clear cart after order creation to avoid double order
                clearCart();
            }
        } catch (error) {
            console.error("Error creating order:", error);
            alert("Hubo un error al crear la orden. Por favor intenta nuevamente.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0 && !orderId) {
        return (
            <div className="min-h-screen bg-tmm-gray-light pt-24 pb-12 px-4 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-tmm-black mb-4">Tu carrito está vacío</h1>
                <p className="text-gray-600 mb-8">Agrega cursos, talleres o productos para continuar.</p>
                <Link to="/productos">
                    <Button>Ver Productos</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-tmm-gray-light pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-tmm-black mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                </button>

                <h1 className="text-3xl font-bold text-tmm-black mb-8">Resumen de Compra</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div key={item.uniqueId} className="bg-white p-4 rounded-xl shadow-sm flex gap-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={item.image || '/placeholder.jpg'}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-tmm-black">{item.title}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{item.type === 'workshop' ? 'Taller' : item.type === 'course' ? 'Curso' : 'Producto'}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.uniqueId)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Cantidad: {item.quantity}</span>
                                        <span className="font-bold text-tmm-pink">${(item.price * item.quantity).toLocaleString('es-CL')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-tmm-black mb-4">Total a Pagar</h2>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${total.toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-tmm-black pt-4 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>${total.toLocaleString('es-CL')}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleCreateOrder}
                                disabled={isProcessing || cart.length === 0}
                                className="w-full py-4 text-lg shadow-lg shadow-tmm-pink/20"
                            >
                                {isProcessing ? 'Procesando...' : 'Confirmar Pedido'}
                            </Button>

                            <p className="text-xs text-center text-gray-400 mt-4">
                                Al confirmar, serás redirigido al proceso de pago.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    navigate('/profile?tab=payments'); // Redirect to profile after closing
                }}
                onConfirm={async () => { }} // Not needed for order flow as order is already created
                amount={orderId ? total : 0} // Use stored total or passed total? Ideally from order response but total is fine
                itemName={`Orden #${orderId}`}
                enrollmentId={null} // Not used for orders
                itemType="order"
                orderId={orderId}
            />
        </div>
    );
};

export default Checkout;
