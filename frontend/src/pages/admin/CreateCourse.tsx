import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import client from '../../api/client';
import { ArrowLeft, Image as ImageIcon, Save } from 'lucide-react';

const CreateCourse = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        precio: '',
        duracion: '',
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
            const fetchCourse = async () => {
                try {
                    const response = await client.get(`/admin/cursos/${id}/`);
                    const course = response.data;
                    setFormData({
                        titulo: course.titulo,
                        descripcion: course.descripcion,
                        precio: parseInt(course.precio).toString(),
                        duracion: course.duracion,
                        imagen: course.imagen, // Keep existing image URL
                        categoria: course.categoria || '',
                        esta_activo: course.esta_activo
                    });
                } catch (error) {
                    console.error("Error fetching course", error);
                    alert("Error al cargar el curso.");
                    navigate('/admin/courses');
                }
            };
            fetchCourse();
        }
    }, [id, isEditing, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append('titulo', formData.titulo);
        data.append('descripcion', formData.descripcion);
        data.append('precio', formData.precio);
        data.append('duracion', formData.duracion);
        data.append('esta_activo', formData.esta_activo.toString());
        if (formData.categoria) {
            data.append('categoria', formData.categoria);
        }
        if (formData.imagen instanceof File) {
            data.append('imagen', formData.imagen);
        }

        try {
            if (isEditing) {
                await client.put(`/admin/cursos/${id}/`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await client.post('/admin/cursos/', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            navigate('/admin/courses');
        } catch (error: any) {
            console.error("Error saving course", error);
            const errorMessage = error.response?.data
                ? Object.entries(error.response.data)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n')
                : "Error al guardar el curso. Por favor revisa los datos.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <Link to="/admin/courses" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4">
                    <ArrowLeft size={20} /> Volver a Cursos
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Curso' : 'Crear Nuevo Curso'}</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-gray focus:border-transparent"
                            value={formData.titulo}
                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
                            <input
                                type="text"
                                required
                                placeholder="Ej: 5 horas"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-gray focus:border-transparent"
                                value={formData.duracion}
                                onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
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

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="esta_activo"
                            checked={formData.esta_activo}
                            onChange={(e) => setFormData({ ...formData, esta_activo: e.target.checked })}
                            className="w-4 h-4 text-sage-gray border-gray-300 rounded focus:ring-sage-gray"
                        />
                        <label htmlFor="esta_activo" className="text-sm font-medium text-gray-700">Curso Activo (Visible al público)</label>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-sage-gray text-white rounded-lg hover:bg-opacity-90 flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={20} />
                            {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Guardar Curso')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCourse;
