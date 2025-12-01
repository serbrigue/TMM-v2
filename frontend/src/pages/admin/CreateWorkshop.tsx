import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import client from '../../api/client';
import { ArrowLeft, Image as ImageIcon, Save } from 'lucide-react';

const CreateWorkshop = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        fecha_taller: '',
        hora_taller: '',
        modalidad: 'PRESENCIAL',
        cupos_totales: 10,
        cupos_disponibles: 10,
        imagen: null as File | null | string,
        categoria: '',
        esta_activo: true
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await client.get('/admin/intereses/');
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (isEditing) {
            const fetchWorkshop = async () => {
                try {
                    const response = await client.get(`/admin/talleres/${id}/`);
                    const workshop = response.data;
                    setFormData({
                        nombre: workshop.nombre,
                        descripcion: workshop.descripcion,
                        precio: parseInt(workshop.precio).toString(),
                        fecha_taller: workshop.fecha_taller,
                        hora_taller: workshop.hora_taller,
                        modalidad: workshop.modalidad,
                        cupos_totales: workshop.cupos_totales,
                        cupos_disponibles: workshop.cupos_disponibles,
                        imagen: workshop.imagen,
                        categoria: workshop.categoria || '',
                        esta_activo: workshop.esta_activo
                    });
                } catch (error) {
                    console.error("Error fetching workshop", error);
                    alert("Error al cargar el taller.");
                    navigate('/admin/workshops');
                }
            };
            fetchWorkshop();
        }
    }, [id, isEditing, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
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
        if (formData.imagen instanceof File) {
            data.append('imagen', formData.imagen);
        }

        try {
            if (isEditing) {
                await client.put(`/admin/talleres/${id}/`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await client.post('/admin/talleres/', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            navigate('/admin/workshops');
        } catch (error: any) {
            console.error("Error saving workshop", error);
            const errorMessage = error.response?.data
                ? Object.entries(error.response.data)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n')
                : "Error al guardar el taller.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <Link to="/admin/workshops" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4">
                    <ArrowLeft size={20} /> Volver a Talleres
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Taller' : 'Crear Nuevo Taller'}</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Taller</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-gray focus:border-transparent"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea
                            required
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-gray focus:border-transparent"
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                            <input
                                type="date"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-gray focus:border-transparent"
                                value={formData.fecha_taller}
                                onChange={(e) => setFormData({ ...formData, fecha_taller: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                            <input
                                type="time"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-gray focus:border-transparent"
                                value={formData.hora_taller}
                                onChange={(e) => setFormData({ ...formData, hora_taller: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-gray focus:border-transparent"
                                value={formData.precio}
                                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-gray focus:border-transparent"
                                value={formData.modalidad}
                                onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                            >
                                <option value="PRESENCIAL">Presencial</option>
                                <option value="ONLINE">Online</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cupos Totales</label>
                            <input
                                type="number"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-gray focus:border-transparent"
                                value={formData.cupos_totales}
                                onChange={(e) => setFormData({ ...formData, cupos_totales: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cupos Disponibles</label>
                            <input
                                type="number"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-gray focus:border-transparent"
                                value={formData.cupos_disponibles}
                                onChange={(e) => setFormData({ ...formData, cupos_disponibles: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-gray focus:border-transparent"
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
                                {formData.imagen && (
                                    <span className="text-xs text-green-600">
                                        {formData.imagen instanceof File ? `Imagen seleccionada: ${formData.imagen.name}` : 'Imagen actual conservada'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="esta_activo"
                            checked={formData.esta_activo}
                            onChange={(e) => setFormData({ ...formData, esta_activo: e.target.checked })}
                            className="w-4 h-4 text-sage-gray border-gray-300 rounded focus:ring-sage-gray"
                        />
                        <label htmlFor="esta_activo" className="text-sm font-medium text-gray-700">Taller Activo (Visible al público)</label>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-sage-gray text-white rounded-lg hover:bg-opacity-90 flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={20} />
                            {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Guardar Taller')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateWorkshop;
