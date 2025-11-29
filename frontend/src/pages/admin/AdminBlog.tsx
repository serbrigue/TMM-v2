import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { Plus, Edit, Trash2, Search, FileText, Image as ImageIcon } from 'lucide-react';

const AdminBlog = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState<any>(null);
    const [formData, setFormData] = useState({
        titulo: '',
        extracto: '',
        contenido: '',
        imagen: null as File | null,
        categoria: '',
        esta_publicado: true
    });

    const fetchPosts = async () => {
        try {
            const response = await client.get('/admin/posts/');
            setPosts(response.data);
        } catch (error) {
            console.error("Error fetching posts", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await client.get('/admin/intereses/');
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchCategories();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este artículo?')) {
            try {
                await client.delete(`/admin/posts/${id}/`);
                fetchPosts();
            } catch (error) {
                console.error("Error deleting post", error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('titulo', formData.titulo);
        data.append('extracto', formData.extracto);
        data.append('contenido', formData.contenido);
        data.append('esta_publicado', formData.esta_publicado.toString());
        if (formData.categoria) {
            data.append('categoria', formData.categoria);
        }
        if (formData.imagen) {
            data.append('imagen', formData.imagen);
        }

        try {
            if (currentPost) {
                await client.put(`/admin/posts/${currentPost.id}/`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await client.post('/admin/posts/', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            setIsModalOpen(false);
            fetchPosts();
            resetForm();
        } catch (error) {
            console.error("Error saving post", error);
            alert("Error al guardar el artículo.");
        }
    };

    const resetForm = () => {
        setCurrentPost(null);
        setFormData({
            titulo: '',
            extracto: '',
            contenido: '',
            imagen: null,
            categoria: '',
            esta_publicado: true
        });
    };

    const openEditModal = (post: any) => {
        setCurrentPost(post);
        setFormData({
            titulo: post.titulo,
            extracto: post.extracto,
            contenido: post.contenido,
            imagen: null,
            categoria: post.categoria || '',
            esta_publicado: post.esta_publicado
        });
        setIsModalOpen(true);
    };

    const filteredPosts = posts.filter(post =>
        post.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-6">Cargando...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Gestión del Blog</h1>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-brand-calypso text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90"
                >
                    <Plus size={20} /> Nuevo Artículo
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar artículos..."
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
                                <th className="p-4">Artículo</th>
                                <th className="p-4">Categoría</th>
                                <th className="p-4">Autor</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {post.imagen ? (
                                                    <img src={post.imagen} alt={post.titulo} className="w-full h-full object-cover" />
                                                ) : (
                                                    <FileText size={20} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{post.titulo}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-xs">{post.extracto}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {post.categoria_nombre || <span className="text-gray-400 italic">Sin categoría</span>}
                                    </td>
                                    <td className="p-4">{post.autor_nombre || 'Admin'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.esta_publicado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {post.esta_publicado ? 'Publicado' : 'Borrador'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(post)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
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
                        <h2 className="text-xl font-bold mb-6">{currentPost ? 'Editar Artículo' : 'Nuevo Artículo'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-calypso focus:border-transparent"
                                    value={formData.titulo}
                                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Extracto (Resumen)</label>
                                <textarea
                                    required
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-calypso focus:border-transparent"
                                    value={formData.extracto}
                                    onChange={(e) => setFormData({ ...formData, extracto: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido Completo</label>
                                <textarea
                                    required
                                    rows={10}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-calypso focus:border-transparent"
                                    value={formData.contenido}
                                    onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                                />
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen Principal</label>
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
                                    id="esta_publicado"
                                    checked={formData.esta_publicado}
                                    onChange={(e) => setFormData({ ...formData, esta_publicado: e.target.checked })}
                                    className="w-4 h-4 text-brand-calypso border-gray-300 rounded focus:ring-brand-calypso"
                                />
                                <label htmlFor="esta_publicado" className="text-sm font-medium text-gray-700">Publicar ahora</label>
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

export default AdminBlog;
