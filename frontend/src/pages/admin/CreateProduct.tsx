import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import client from '../../api/client';
import { ArrowLeft, Image as ImageIcon, Save } from 'lucide-react';

const CreateProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio_venta: '',
        stock_actual: 0,
        stock_critico: 5,
        esta_disponible: true,
        es_fisico: true,
        controlar_stock: true,
        imagen: null as File | null | string,
    });

    useEffect(() => {
        if (isEditing) {
            const fetchProduct = async () => {
                try {
                    const response = await client.get(`/admin/productos/${id}/`);
                    const product = response.data;
                    setFormData({
                        nombre: product.nombre,
                        descripcion: product.descripcion,
                        precio_venta: parseInt(product.precio_venta).toString(),
                        stock_actual: product.stock_actual,
                        stock_critico: product.stock_critico,
                        esta_disponible: product.esta_disponible,
                        es_fisico: product.es_fisico,
                        controlar_stock: product.controlar_stock,
                        imagen: product.imagen,
                    });
                } catch (error) {
                    console.error("Error fetching product", error);
                    alert("Error al cargar el producto.");
                    navigate('/admin/products');
                }
            };
            fetchProduct();
        }
    }, [id, isEditing, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append('nombre', formData.nombre);
        data.append('descripcion', formData.descripcion);
        data.append('precio_venta', formData.precio_venta);
        data.append('stock_actual', formData.stock_actual.toString());
        data.append('stock_critico', formData.stock_critico.toString());
        data.append('esta_disponible', formData.esta_disponible.toString());
        data.append('es_fisico', formData.es_fisico.toString());
        data.append('controlar_stock', formData.controlar_stock.toString());

        if (formData.imagen instanceof File) {
            data.append('imagen', formData.imagen);
        }

        try {
            if (isEditing) {
                await client.put(`/admin/productos/${id}/`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await client.post('/admin/productos/', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            navigate('/admin/products');
        } catch (error: any) {
            console.error("Error saving product", error);
            const errorMessage = error.response?.data
                ? Object.entries(error.response.data)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n')
                : "Error al guardar el producto.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <Link to="/admin/products" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4">
                    <ArrowLeft size={20} /> Volver a Productos
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tmm-black focus:border-transparent"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea
                            required
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tmm-black focus:border-transparent"
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tmm-black focus:border-transparent"
                                value={formData.precio_venta}
                                onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    <ImageIcon size={20} className="text-gray-500" />
                                    <span className="text-sm text-gray-600">Subir imagen</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setFormData({ ...formData, imagen: e.target.files ? e.target.files[0] : null })}
                                    />
                                </label>
                                {formData.imagen && (
                                    <span className="text-xs text-green-600">
                                        {formData.imagen instanceof File ? `Imagen seleccionada: ${formData.imagen.name}` : 'Imagen actual conservada'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual</label>
                            <input
                                type="number"
                                required
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tmm-black focus:border-transparent"
                                value={formData.stock_actual}
                                onChange={(e) => setFormData({ ...formData, stock_actual: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Crítico (Alerta)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tmm-black focus:border-transparent"
                                value={formData.stock_critico}
                                onChange={(e) => setFormData({ ...formData, stock_critico: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="esta_disponible"
                                checked={formData.esta_disponible}
                                onChange={(e) => setFormData({ ...formData, esta_disponible: e.target.checked })}
                                className="w-4 h-4 text-tmm-black border-gray-300 rounded focus:ring-tmm-black"
                            />
                            <label htmlFor="esta_disponible" className="text-sm font-medium text-gray-700">Disponible para Venta</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="es_fisico"
                                checked={formData.es_fisico}
                                onChange={(e) => setFormData({ ...formData, es_fisico: e.target.checked })}
                                className="w-4 h-4 text-tmm-black border-gray-300 rounded focus:ring-tmm-black"
                            />
                            <label htmlFor="es_fisico" className="text-sm font-medium text-gray-700">Es Producto Físico</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="controlar_stock"
                                checked={formData.controlar_stock}
                                onChange={(e) => setFormData({ ...formData, controlar_stock: e.target.checked })}
                                className="w-4 h-4 text-tmm-black border-gray-300 rounded focus:ring-tmm-black"
                            />
                            <label htmlFor="controlar_stock" className="text-sm font-medium text-gray-700">Controlar Stock</label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-tmm-black text-white rounded-lg hover:bg-opacity-90 flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={20} />
                            {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Guardar Producto')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProduct;
