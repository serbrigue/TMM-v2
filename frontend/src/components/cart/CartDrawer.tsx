import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash, Minus, Plus, ShoppingBag } from '@phosphor-icons/react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
    const { isOpen, closeCart, items, removeFromCart, updateQuantity, cartTotal } = useCart();
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-tmm-pink/10">
                            <div className="flex items-center gap-3">
                                <ShoppingBag size={24} className="text-tmm-black" />
                                <h2 className="font-serif text-xl font-bold text-tmm-black">Tu Carrito</h2>
                            </div>
                            <button
                                onClick={closeCart}
                                className="p-2 hover:bg-white/50 rounded-full transition-colors text-tmm-black"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                                    <ShoppingBag size={64} className="text-tmm-pink" />
                                    <p className="text-lg font-medium">Tu carrito está vacío</p>
                                    <Button variant="outline" onClick={closeCart}>
                                        Seguir Explorando
                                    </Button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <motion.div
                                        layout
                                        key={item.uniqueId}
                                        className="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
                                    >
                                        {/* Image */}
                                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-tmm-pink/10 text-tmm-pink">
                                                    <ShoppingBag size={24} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-medium text-tmm-black line-clamp-2">{item.title}</h3>
                                                    <button
                                                        onClick={() => removeFromCart(item.uniqueId)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-tmm-pink font-bold mt-1">
                                                    ${item.price.toLocaleString('es-CL')}
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                                    <button
                                                        onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)}
                                                        className="p-1 hover:bg-gray-100 rounded-l-lg transition-colors"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)}
                                                        className="p-1 hover:bg-gray-100 rounded-r-lg transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                                                    {item.type === 'product' ? 'Producto' : item.type === 'workshop' ? 'Taller' : 'Curso'}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 bg-white border-t border-gray-100 space-y-4">
                                <div className="flex justify-between items-center text-lg font-bold text-tmm-black">
                                    <span>Total</span>
                                    <span>${cartTotal.toLocaleString('es-CL')}</span>
                                </div>
                                <Button
                                    className="w-full py-4 text-lg shadow-lg shadow-tmm-pink/20"
                                    onClick={() => {
                                        closeCart();
                                        navigate('/checkout');
                                    }}
                                >
                                    Ir a Pagar
                                </Button>
                                <p className="text-xs text-center text-gray-400">
                                    Los impuestos y gastos de envío se calculan en el pago.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
