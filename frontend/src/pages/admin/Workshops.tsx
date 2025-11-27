import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, Calendar, Users, Image as ImageIcon } from 'lucide-react';

const AdminWorkshops = () => {
    const [workshops, setWorkshops] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentWorkshop, setCurrentWorkshop] = useState<any>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        fecha_taller: '',
        hora_taller: '',
        modalidad: 'PRESENCIAL',
        cupos_totales: 10,
        cupos_disponibles: 10,
        imagen: null as File | null,
        categoria: '',
        esta_activo: true
    });

    const fetchWorkshops = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('http://localhost:8000/api/admin/talleres/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkshops(response.data);
        } catch (error) {
            console.error("Error fetching workshops", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('http://localhost:8000/api/admin/intereses/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    useEffect(() => {
        fetchWorkshops();
        fetchCategories();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este taller?')) {
            try {
                const token = localStorage.getItem('access_token');
                await axios.delete(`http://localhost:8000/api/admin/talleres/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchWorkshops();
            } catch (error) {
                console.error("Error deleting workshop", error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        const data = new FormData();
        data.append('nombre', formData.nombre);
        data.append('descripcion', formData.descripcion);
        data.append('precio', formData.precio);
        data.append('fecha_taller', formData.fecha_taller);
        data.append('hora_taller', formData.hora_taller);
        data.append('modalidad', formData.modalidad);
        data.append('cupos_totales', formData.cupos_totales.toString());
        data.append('cupos_disponibles', formData.cupos_disponibles.toString());
        data.append('esta_activo', formData.esta_activo.toString());
        if (formData.categoria) {
            data.append('categoria', formData.categoria);
        }
        if (formData.imagen) {
            data.append('imagen', formData.imagen);
        }

        try {
            if (currentWorkshop) {
                await axios.put(`http://localhost:8000/api/admin/talleres/${currentWorkshop.id}/`, data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post('http://localhost:8000/api/admin/talleres/', data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            setIsModalOpen(false);
            fetchWorkshops();
            resetForm();
        } catch (error) {
            console.error("Error saving workshop", error);
            alert("Error al guardar el taller.");
        }
    };

    const resetForm = () => {
        setCurrentWorkshop(null);
        setFormData({
            nombre: '',
            descripcion: '',
            precio: '',
            fecha_taller: '',
            hora_taller: '',
            modalidad: 'PRESENCIAL',
            cupos_totales: 10,
            cupos_disponibles: 10,
            imagen: null,
            categoria: '',
            esta_activo: true
        });
    };

    const openEditModal = (workshop: any) => {
        setCurrentWorkshop(workshop);
        setFormData({
            nombre: workshop.nombre,
            descripcion: workshop.descripcion,
            precio: workshop.precio,
            fecha_taller: workshop.fecha_taller,
            hora_taller: workshop.hora_taller,
            modalidad: workshop.modalidad,
            cupos_totales: workshop.cupos_totales,
            cupos_disponibles: workshop.cupos_disponibles,
            imagen: null,
            categoria: workshop.categoria || '',
            esta_activo: workshop.esta_activo
        });
        setIsModalOpen(true);
    };

    const filteredWorkshops = workshops.filter(workshop =>
        workshop.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-6">Cargando...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Talleres</h1>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-brand-calypso text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90"
                >
                    <Plus size={20} /> Nuevo Taller
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar talleres..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-calypso/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                            <tr>
                                <th className="p-4">Taller</th>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Modalidad</th>
                                <th className="p-4">Cupos</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredWorkshops.map((workshop) => (
                                <tr key={workshop.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {workshop.imagen ? (
                                                    <img src={workshop.imagen} alt={workshop.nombre} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Calendar size={20} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <Link to={`/admin/workshops/${workshop.id}`} className="font-medium text-gray-900 hover:text-brand-calypso hover:underline">
                                                    {workshop.nombre}
                                                </Link>
                                                <p className="text-xs text-gray-500">${parseInt(workshop.precio).toLocaleString('es-CL')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {workshop.fecha_taller} {workshop.hora_taller}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${workshop.modalidad === 'PRESENCIAL' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {workshop.modalidad}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {workshop.cupos_disponibles} / {workshop.cupos_totales}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${workshop.esta_activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {workshop.esta_activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(workshop)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(workshop.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6">{currentWorkshop ? 'Editar Taller' : 'Nuevo Taller'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Taller</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-calypso focus:border-transparent"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-calypso focus:border-transparent"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-calypso focus:border-transparent"
                                        value={formData.fecha_taller}
                                        onChange={(e) => setFormData({ ...formData, fecha_taller: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-calypso focus:border-transparent"
                                        value={formData.hora_taller}
                                        onChange={(e) => setFormData({ ...formData, hora_taller: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-calypso focus:border-transparent"
                                        value={formData.precio}
                                        onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-calypso focus:border-transparent"
                                        value={formData.modalidad}
                                        onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                                    >
                                        <option value="PRESENCIAL">Presencial</option>
                                        <option value="ONLINE">Online</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cupos Totales</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-calypso focus:border-transparent"
                                        value={formData.cupos_totales}
                                        onChange={(e) => setFormData({ ...formData, cupos_totales: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cupos Disponibles</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-calypso focus:border-transparent"
                                        value={formData.cupos_disponibles}
                                        onChange={(e) => setFormData({ ...formData, cupos_disponibles: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-calypso focus:border-transparent"
                                    value={formData.categoria}
                                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                >
                                    <option value="">Seleccionar categoría...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
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
                                    {formData.imagen && <span className="text-xs text-green-600">Imagen seleccionada</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="esta_activo"
                                    checked={formData.esta_activo}
                                    onChange={(e) => setFormData({ ...formData, esta_activo: e.target.checked })}
                                    className="w-4 h-4 text-brand-calypso border-gray-300 rounded focus:ring-brand-calypso"
                                />
                                <label htmlFor="esta_activo" className="text-sm font-medium text-gray-700">Taller Activo (Visible al público)</label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-brand-calypso text-white rounded-lg hover:bg-opacity-90"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWorkshops;
