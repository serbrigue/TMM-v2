import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { Plus, Edit, Trash2, Search, ShoppingBag, Package, Download, Upload, Filter, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { API_URL } from '../../config/api';

const AdminProducts = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('TODOS'); // TODOS, ACTIVO, INACTIVO, BAJO_STOCK

    const fetchProducts = async () => {
        try {
            const response = await client.get('/admin/productos/');
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                await client.delete(`/admin/productos/${id}/`);
                fetchProducts();
            } catch (error: any) {
                console.error("Error deleting product", error);
                alert(error.response?.data?.error || "Error al eliminar el producto.");
            }
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            const response = await client.post('/admin/import/?model=productos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(`Importación completada: ${response.data.created} creados, ${response.data.updated} actualizados.`);
            fetchProducts();
        } catch (error) {
            console.error("Error importing products", error);
            alert("Error al importar productos.");
        } finally {
            setLoading(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleExport = async () => {
        try {
            const response = await client.get('/admin/export/?model=productos', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'productos.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error exporting products", error);
            alert("Error al exportar productos");
        }
    };

    // Metrics Calculation
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.esta_disponible).length;
    const lowStockProducts = products.filter(p => p.controlar_stock && p.stock_actual <= p.stock_critico).length;
    const totalValue = products.reduce((sum, p) => sum + (p.precio_venta * p.stock_actual), 0);

    // Filtering
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = true;
        if (filterStatus === 'ACTIVO') matchesFilter = product.esta_disponible;
        if (filterStatus === 'INACTIVO') matchesFilter = !product.esta_disponible;
        if (filterStatus === 'BAJO_STOCK') matchesFilter = product.controlar_stock && product.stock_actual <= product.stock_critico;

        return matchesSearch && matchesFilter;
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tmm-pink"></div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingBag className="text-tmm-pink" />
                        Inventario de Productos
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Gestiona tu catálogo, stock y precios.</p>
                </div>
                <div className="flex gap-2">
                    <label className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span className="hidden md:inline">Importar</span>
                        <input type="file" accept=".csv,.xlsx" className="hidden" onChange={handleImport} />
                    </label>
                    <button onClick={handleExport} className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" />
                        <span className="hidden md:inline">Exportar</span>
                    </button>
                    <Link
                        to="/admin/products/create"
                        className="bg-tmm-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 shadow-lg shadow-tmm-black/20"
                    >
                        <Plus size={20} /> Nuevo Producto
                    </Link>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Productos</h3>
                    <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Activos</h3>
                    <p className="text-2xl font-bold text-gray-800">{activeProducts}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-50 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Bajo Stock</h3>
                    <p className="text-2xl font-bold text-gray-800">{lowStockProducts}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <ShoppingBag className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Valor Inventario</h3>
                    <p className="text-2xl font-bold text-gray-800">${totalValue.toLocaleString('es-CL')}</p>
                </div>
            </div>

            {/* Filters & Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tmm-black/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="text-gray-400 w-5 h-5" />
                        <select
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tmm-black/20"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="TODOS">Todos los Estados</option>
                            <option value="ACTIVO">Activos</option>
                            <option value="INACTIVO">Inactivos</option>
                            <option value="BAJO_STOCK">Bajo Stock</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                            <tr>
                                <th className="p-4">Producto</th>
                                <th className="p-4">Precio</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                                {product.imagen ? (
                                                    <img src={product.imagen} alt={product.nombre} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900 block">{product.nombre}</span>
                                                <span className="text-xs text-gray-500">{product.es_fisico ? 'Físico' : 'Digital'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 font-medium">${product.precio_venta.toLocaleString('es-CL')}</td>
                                    <td className="p-4">
                                        {product.controlar_stock ? (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock_actual <= product.stock_critico ? 'bg-red-100 text-red-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {product.stock_actual} unid.
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">Infinito</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.esta_disponible ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {product.esta_disponible ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/admin/products/edit/${product.id}`}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminProducts;
