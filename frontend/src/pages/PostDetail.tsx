import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CalendarBlank, User, ArrowLeft, ArrowUp, Clock, ShareNetwork, FacebookLogo, TwitterLogo, LinkedinLogo } from '@phosphor-icons/react';

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

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-cloud-pink">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sage-gray border-t-transparent"></div>
        </div>
    );

    if (!post) return <div className="min-h-screen flex items-center justify-center bg-cloud-pink text-sage-gray">Artículo no encontrado</div>;

    return (
        <div className="min-h-screen bg-cloud-pink">
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-silver-gray z-50">
                <div
                    className="h-full bg-butter-yellow transition-all duration-150"
                    style={{ width: `${readingProgress}%` }}
                />
            </div>

            {/* Hero Section */}
            <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
                {post.imagen && (
                    <div className="absolute inset-0">
                        <img
                            src={post.imagen}
                            alt={post.titulo}
                            className="w-full h-full object-cover sepia-[.15]"
                        />
                        <div className="absolute inset-0 bg-charcoal-gray/40 mix-blend-multiply" />
                    </div>
                )}

                <div className="relative h-full flex items-center">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-white w-full">
                        <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8">
                            <ArrowLeft size={20} />
                            Volver al Blog
                        </Link>

                        {post.categoria_nombre && (
                            <span className="inline-block px-4 py-1 bg-butter-yellow/90 text-charcoal-gray rounded-full text-sm font-medium mb-6">
                                {post.categoria_nombre}
                            </span>
                        )}

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-8 leading-tight text-white drop-shadow-sm">
                            {post.titulo}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <User size={18} />
                                <span>{post.autor_nombre || 'TMM Team'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarBlank size={18} />
                                <span>{new Date(post.fecha_publicacion).toLocaleDateString('es-CL', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={18} />
                                <span>{estimatedReadTime} min de lectura</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white -mt-20 relative rounded-t-3xl shadow-sm z-10">
                {/* Share Buttons */}
                <div className="mb-12 pb-8 border-b border-silver-gray">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <span className="text-sm font-medium text-sage-gray flex items-center gap-2">
                            <ShareNetwork size={18} />
                            Compartir:
                        </span>
                        <div className="flex items-center gap-3">
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-sage-gray hover:text-charcoal-gray transition-colors"
                            >
                                <FacebookLogo size={20} />
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-sage-gray hover:text-charcoal-gray transition-colors"
                            >
                                <TwitterLogo size={20} />
                            </a>
                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-sage-gray hover:text-charcoal-gray transition-colors"
                            >
                                <LinkedinLogo size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Post Content */}
                <div className="prose prose-lg prose-stone max-w-none">
                    <div className="text-xl leading-relaxed text-charcoal-gray mb-10 font-serif italic border-l-4 border-sage-gray pl-6">
                        {post.extracto}
                    </div>

                    <div className="space-y-6 text-charcoal-gray/90 leading-relaxed font-sans">
                        {post.contenido.split('\n').map((paragraph: string, index: number) => {
                            if (!paragraph.trim()) return null;

                            if (paragraph.startsWith('# ')) {
                                return <h2 key={index} className="text-3xl font-bold font-serif text-sage-gray mt-12 mb-6">{paragraph.slice(2)}</h2>;
                            }
                            if (paragraph.startsWith('## ')) {
                                return <h3 key={index} className="text-2xl font-bold font-serif text-sage-gray mt-10 mb-4">{paragraph.slice(3)}</h3>;
                            }
                            if (paragraph.startsWith('> ')) {
                                return (
                                    <blockquote key={index} className="border-l-4 border-sage-gray pl-6 py-2 my-8 italic text-lg text-charcoal-gray bg-cloud-pink/30 rounded-r-lg">
                                        {paragraph.slice(2)}
                                    </blockquote>
                                );
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
            <div className="bg-white py-16 border-t border-silver-gray">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="text-3xl font-bold font-serif text-sage-gray mb-4">
                        ¿Te gustó este artículo?
                    </h3>
                    <p className="text-xl text-charcoal-gray/80 mb-8">
                        Suscríbete a nuestro newsletter y recibe contenido exclusivo cada semana.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Tu correo electrónico"
                            className="px-6 py-3 rounded-lg border border-silver-gray bg-cloud-pink/30 focus:border-sage-gray focus:outline-none flex-1"
                        />
                        <button className="px-8 py-3 bg-butter-yellow text-charcoal-gray rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md">
                            Suscribirme
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h3 className="text-3xl font-bold font-serif text-sage-gray mb-12 text-center">
                        Artículos Relacionados
                    </h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        {relatedPosts.map((relatedPost) => (
                            <Link
                                key={relatedPost.id}
                                to={`/blog/${relatedPost.id}`}
                                className="group block overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={relatedPost.imagen || "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                                        alt={relatedPost.titulo}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 sepia-[.10]"
                                    />
                                </div>
                                <div className="p-6">
                                    <h4 className="mb-2 font-serif text-lg font-bold text-charcoal-gray group-hover:text-sage-gray transition-colors line-clamp-2">
                                        {relatedPost.titulo}
                                    </h4>
                                    <p className="text-sm text-charcoal-gray/70 line-clamp-3">
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
                    className="fixed bottom-8 right-8 p-3 bg-sage-gray text-white rounded-full shadow-lg hover:bg-charcoal-gray transition-all transform hover:scale-110 z-40"
                    aria-label="Volver arriba"
                >
                    <ArrowUp size={24} />
                </button>
            )}
        </div>
    );
};

export default PostDetail;
