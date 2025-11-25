import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowLeft, ArrowUp, Clock, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';

const PostDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState<any>(null);
    const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [readingProgress, setReadingProgress] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/public/posts/${id}/`);
                setPost(response.data);

                // Fetch related posts (same category)
                if (response.data.categoria) {
                    const relatedResponse = await axios.get('http://localhost:8000/api/public/posts/');
                    const related = relatedResponse.data
                        .filter((p: any) => p.id !== parseInt(id!) && p.categoria === response.data.categoria)
                        .slice(0, 3);
                    setRelatedPosts(related);
                }
            } catch (error) {
                console.error("Error fetching post", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    // Reading progress bar
    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            setReadingProgress(progress);
            setShowScrollTop(scrollTop > 300);
        };

        window.addEventListener('scroll', updateProgress);
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = post?.titulo || '';

    const estimatedReadTime = post ? Math.ceil(post.contenido.split(' ').length / 200) : 0;

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    if (!post) return <div className="min-h-screen flex items-center justify-center">Artículo no encontrado</div>;

    return (
        <div className="min-h-screen bg-white">
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
                <div
                    className="h-full bg-gradient-to-r from-brand-calypso to-brand-fuchsia transition-all duration-150"
                    style={{ width: `${readingProgress}%` }}
                />
            </div>

            {/* Hero Section with Parallax */}
            <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
                {post.imagen && (
                    <div className="absolute inset-0">
                        <img
                            src={post.imagen}
                            alt={post.titulo}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
                    </div>
                )}

                <div className="relative h-full flex items-center">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
                        <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6">
                            <ArrowLeft size={20} />
                            Volver al Blog
                        </Link>

                        {post.categoria_nombre && (
                            <span className="inline-block px-4 py-2 bg-brand-pink/20 backdrop-blur-sm text-brand-yellow rounded-full text-sm font-bold mb-4 border border-brand-yellow/30">
                                {post.categoria_nombre}
                            </span>
                        )}

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6 leading-tight">
                            {post.titulo}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-white/90">
                            <div className="flex items-center gap-2">
                                <User size={20} />
                                <span className="font-medium">{post.autor_nombre || 'TMM Team'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={20} />
                                <span>{new Date(post.fecha_publicacion).toLocaleDateString('es-CL', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={20} />
                                <span>{estimatedReadTime} min de lectura</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Share Buttons */}
                <div className="mb-12 pb-8 border-b border-gray-200">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <span className="text-sm font-medium text-gray-600">Compartir este artículo:</span>
                        <div className="flex items-center gap-3">
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                <Facebook size={16} />
                                Facebook
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm font-medium"
                            >
                                <Twitter size={16} />
                                Twitter
                            </a>
                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
                            >
                                <Linkedin size={16} />
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </div>

                {/* Post Content with Enhanced Typography */}
                <div className="prose prose-lg prose-gray max-w-none">
                    <div className="text-xl leading-relaxed text-gray-700 mb-8 font-medium border-l-4 border-brand-calypso pl-6 italic">
                        {post.extracto}
                    </div>

                    <div className="space-y-6 text-gray-700 leading-relaxed">
                        {post.contenido.split('\n').map((paragraph: string, index: number) => {
                            if (!paragraph.trim()) return null;

                            // Check if it's a heading
                            if (paragraph.startsWith('# ')) {
                                return <h2 key={index} className="text-3xl font-bold font-heading text-gray-900 mt-12 mb-6">{paragraph.slice(2)}</h2>;
                            }
                            if (paragraph.startsWith('## ')) {
                                return <h3 key={index} className="text-2xl font-bold font-heading text-gray-900 mt-10 mb-4">{paragraph.slice(3)}</h3>;
                            }

                            return (
                                <p key={index} className="text-lg leading-relaxed">
                                    {paragraph}
                                </p>
                            );
                        })}
                    </div>
                </div>
            </article>

            {/* Newsletter CTA */}
            <div className="bg-gradient-to-r from-brand-pink/20 via-brand-yellow/20 to-brand-mint/20 py-16 my-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="text-3xl font-bold font-heading text-gray-900 mb-4">
                        ¿Te gustó este artículo?
                    </h3>
                    <p className="text-xl text-gray-600 mb-8">
                        Suscríbete a nuestro newsletter y recibe contenido exclusivo cada semana.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Tu correo electrónico"
                            className="px-6 py-3 rounded-lg border-2 border-gray-300 focus:border-brand-calypso focus:outline-none flex-1"
                        />
                        <button className="px-8 py-3 bg-brand-calypso text-white rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl">
                            Suscribirme
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h3 className="text-3xl font-bold font-heading text-gray-900 mb-8 text-center">
                        Artículos Relacionados
                    </h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        {relatedPosts.map((relatedPost) => (
                            <Link
                                key={relatedPost.id}
                                to={`/blog/${relatedPost.id}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                            >
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={relatedPost.imagen || "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                                        alt={relatedPost.titulo}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6">
                                    {relatedPost.categoria_nombre && (
                                        <span className="inline-block px-3 py-1 bg-brand-pink/20 text-brand-fuchsia rounded-full text-xs font-bold mb-3">
                                            {relatedPost.categoria_nombre}
                                        </span>
                                    )}
                                    <h4 className="text-lg font-bold font-heading text-gray-900 mb-2 group-hover:text-brand-calypso transition-colors line-clamp-2">
                                        {relatedPost.titulo}
                                    </h4>
                                    <p className="text-gray-600 text-sm line-clamp-3">
                                        {relatedPost.extracto}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 p-4 bg-brand-calypso text-white rounded-full shadow-lg hover:shadow-xl hover:bg-opacity-90 transition-all transform hover:scale-110 z-40"
                    aria-label="Volver arriba"
                >
                    <ArrowUp size={24} />
                </button>
            )}
        </div>
    );
};

export default PostDetail;
