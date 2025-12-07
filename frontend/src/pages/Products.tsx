import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye } from '@phosphor-icons/react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useCart } from '../context/CartContext';

interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio_venta: number;
    imagen: string;
    stock_actual: number;
    esta_disponible: boolean;
}

const Products = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await client.get('/public/productos/');
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = (product: Product) => {
        addToCart({
            id: product.id,
            type: 'product',
            title: product.nombre,
            price: product.precio_venta,
            image: product.imagen
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-tmm-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tmm-pink"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-tmm-white">
            {/* Hero Section */}
            <section className="relative py-20 bg-tmm-pink/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-serif text-4xl md:text-5xl font-bold text-tmm-black mb-4"
                    >
                        Tienda TMM
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-tmm-black/70 max-w-2xl mx-auto"
                    >
                        Herramientas y productos seleccionados con amor para tu bienestar y creatividad.
                    </motion.p>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {products.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-xl text-gray-500">No hay productos disponibles en este momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products.map((product) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                                >
                                    {/* Image */}
                                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                                        {product.imagen ? (
                                            <img
                                                src={product.imagen}
                                                alt={product.nombre}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <ShoppingBag size={48} />
                                            </div>
                                        )}

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => navigate(`/tienda/${product.id}`)}
                                                className="p-3 bg-white rounded-full text-tmm-black hover:bg-tmm-pink hover:text-white transition-colors transform hover:scale-110"
                                                title="Ver Detalles"
                                            >
                                                <Eye size={24} />
                                            </button>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                disabled={!product.esta_disponible || product.stock_actual === 0}
                                                className="p-3 bg-white rounded-full text-tmm-black hover:bg-tmm-pink hover:text-white transition-colors transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Agregar al Carrito"
                                            >
                                                <ShoppingBag size={24} />
                                            </button>
                                        </div>

                                        {/* Stock Badge */}
                                        {product.stock_actual === 0 && (
                                            <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                AGOTADO
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3 className="font-serif text-xl font-bold text-tmm-black mb-2 line-clamp-1">
                                            {product.nombre}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[2.5rem]">
                                            {product.descripcion}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-tmm-pink">
                                                ${product.precio_venta.toLocaleString('es-CL')}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/tienda/${product.id}`)}
                                                className="border-tmm-pink text-tmm-pink hover:bg-tmm-pink hover:text-white"
                                            >
                                                Ver Más
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Products;
