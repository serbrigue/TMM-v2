import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowRight } from 'lucide-react';

const Blog = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/public/posts/');
                setPosts(response.data);
            } catch (error) {
                console.error("Error fetching posts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando blog...</div>;

    return (
        <div className="bg-white min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">Blog de Bienestar</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Reflexiones, tutoriales e historias para inspirar tu día a día.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {posts.map((post) => (
                        <article key={post.id} className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                            <div className="h-56 overflow-hidden">
                                <img
                                    src={post.imagen || "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                                    alt={post.titulo}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                    {post.categoria_nombre && (
                                        <span className="bg-brand-pink/20 text-brand-fuchsia px-2 py-1 rounded font-bold uppercase">
                                            {post.categoria_nombre}
                                        </span>
                                    )}
                                    <div className="flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {new Date(post.fecha_publicacion).toLocaleDateString()}
                                    </div>
                                </div>

                                <h2 className="text-xl font-heading font-bold text-gray-900 mb-3 hover:text-brand-calypso transition-colors cursor-pointer">
                                    {post.titulo}
                                </h2>
                                <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">
                                    {post.extracto}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                    <div className="flex items-center text-sm font-medium text-gray-900">
                                        <User className="w-4 h-4 mr-2 text-gray-400" />
                                        {post.autor_nombre || "Admin"}
                                    </div>
                                    <Link to={`/blog/${post.id}`} className="text-brand-calypso font-bold text-sm flex items-center hover:underline">
                                        Leer más <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No hay artículos publicados aún.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
