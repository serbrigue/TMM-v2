import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Minus, Plus, CheckCircle } from '@phosphor-icons/react';
import { Button } from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import client from '../api/client';

interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio_venta: number;
    imagen: string;
    stock_actual: number;
    esta_disponible: boolean;
}

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await client.get(`/public/productos/${id}/`);
                setProduct(response.data);
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;



        addToCart({
            id: product.id,
            type: 'product',
            title: product.nombre,
            price: product.precio_venta,
            image: product.imagen,
            quantity: quantity
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-tmm-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tmm-pink"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-tmm-white">
                <h2 className="text-2xl font-serif text-tmm-black mb-4">Producto no encontrado</h2>
                <Button onClick={() => navigate('/tienda')}>Volver a la Tienda</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-tmm-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/tienda')}
                    className="mb-8 flex items-center gap-2"
                >
                    <ArrowLeft /> Volver a la Tienda
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-2xl overflow-hidden shadow-lg border border-tmm-pink/20 bg-white"
                    >
                        {product.imagen ? (
                            <img
                                src={product.imagen}
                                alt={product.nombre}
                                className="w-full h-full object-cover aspect-square"
                            />
                        ) : (
                            <div className="w-full h-full aspect-square flex items-center justify-center bg-gray-100 text-gray-400">
                                <ShoppingBag size={64} />
                            </div>
                        )}
                    </motion.div>

                    {/* Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div>
                            <h1 className="font-serif text-4xl md:text-5xl font-bold text-tmm-black mb-4">
                                {product.nombre}
                            </h1>
                            <p className="text-3xl font-bold text-tmm-pink">
                                ${product.precio_venta.toLocaleString('es-CL')}
                            </p>
                        </div>

                        <div className="prose prose-lg text-tmm-black/80">
                            <p>{product.descripcion}</p>
                        </div>

                        <div className="border-t border-b border-gray-100 py-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <span className="font-medium text-tmm-black">Cantidad:</span>
                                <div className="flex items-center bg-white border border-gray-200 rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-12 text-center font-bold">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock_actual, quantity + 1))}
                                        className="p-3 hover:bg-gray-50 transition-colors"
                                        disabled={quantity >= product.stock_actual}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {product.stock_actual} disponibles
                                </span>
                            </div>

                            <Button
                                onClick={handleAddToCart}
                                disabled={!product.esta_disponible || product.stock_actual === 0}
                                className="w-full md:w-auto px-8 py-4 text-lg shadow-lg shadow-tmm-pink/20 flex items-center justify-center gap-3"
                            >
                                <ShoppingBag size={24} />
                                {product.stock_actual > 0 ? 'Agregar al Carrito' : 'Agotado'}
                            </Button>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-tmm-black/60 bg-tmm-green/10 p-4 rounded-xl">
                            <CheckCircle size={20} className="text-tmm-green" />
                            <span>Compra segura y garantía de satisfacción TMM.</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
