import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CalendarBlank, User, ArrowRight } from '@phosphor-icons/react';
import { Button } from '../components/ui/Button';

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

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-cloud-pink">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sage-gray border-t-transparent"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-cloud-pink py-12">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h1 className="mb-4 font-serif text-4xl font-bold text-sage-gray md:text-5xl">Blog de Bienestar</h1>
                    <p className="mx-auto max-w-2xl text-lg text-charcoal-gray/80">
                        Reflexiones, tutoriales e historias para inspirar tu día a día.
                    </p>
                </div>

                <div className="space-y-12">
                    {posts.map((post) => (
                        <article key={post.id} className="group overflow-hidden rounded-2xl bg-white/40 shadow-sm transition-all hover:bg-white/60 hover:shadow-md">
                            <div className="flex flex-col md:flex-row">
                                {/* Image */}
                                <div className="md:w-2/5 lg:w-1/3">
                                    <div className="h-64 w-full overflow-hidden md:h-full">
                                        <img
                                            src={post.imagen || "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                                            alt={post.titulo}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 sepia-[.10]"
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-1 flex-col p-8">
                                    <div className="mb-4 flex items-center gap-4 text-xs font-medium uppercase tracking-wider text-sage-gray">
                                        {post.categoria_nombre && (
                                            <span className="rounded-full bg-butter-yellow/50 px-3 py-1 text-charcoal-gray">
                                                {post.categoria_nombre}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <CalendarBlank className="h-4 w-4" />
                                            {new Date(post.fecha_publicacion).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <h2 className="mb-3 font-serif text-2xl font-bold text-charcoal-gray transition-colors group-hover:text-sage-gray">
                                        <Link to={`/blog/${post.id}`}>
                                            {post.titulo}
                                        </Link>
                                    </h2>

                                    <p className="mb-6 line-clamp-3 flex-grow text-charcoal-gray/80 leading-relaxed">
                                        {post.extracto}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between border-t border-silver-gray pt-6">
                                        <div className="flex items-center text-sm font-medium text-charcoal-gray/70">
                                            <User className="mr-2 h-4 w-4 text-sage-gray" />
                                            {post.autor_nombre || "Admin"}
                                        </div>
                                        <Link to={`/blog/${post.id}`}>
                                            <Button variant="ghost" size="sm" className="group/btn pl-0 hover:bg-transparent">
                                                Leer más <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-lg text-sage-gray">No hay artículos publicados aún.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
