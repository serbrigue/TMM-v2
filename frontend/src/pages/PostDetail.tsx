import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CalendarBlank, User, ArrowLeft, ArrowRight, ArrowUp, Clock, ShareNetwork, FacebookLogo, TwitterLogo, LinkedinLogo, CaretRight, Quotes } from '@phosphor-icons/react';
import { API_URL } from '../config/api';

// Mock data for visualization
interface Post {
    id: number;
    titulo: string;
    extracto: string;
    contenido: string;
    imagen: string;
    categoria_nombre: string;
    fecha_publicacion: string;
    autor_nombre: string;
    autor_bio: string;
    autor_avatar: string;
    categoria?: string;
}

const MOCK_POST: Post = {
    id: 101,
    titulo: "El Arte de la Calma: Técnicas de Respiración para el Día a Día",
    extracto: "Descubre cómo simples ejercicios de respiración pueden transformar tu estado mental y reducir el estrés en cuestión de minutos.",
    contenido: `
# La importancia de respirar

En un mundo que nunca se detiene, encontrar momentos de calma puede parecer una tarea imposible. Sin embargo, la herramienta más poderosa para combatir el estrés la llevamos con nosotros todo el tiempo: nuestra respiración.

> "La respiración es el puente que conecta la vida con la conciencia, que une tu cuerpo con tus pensamientos."

## ¿Por qué funciona?

Cuando respiramos de manera consciente, enviamos una señal directa a nuestro sistema nervioso parasimpático, indicándole que es seguro relajarse. Esto reduce los niveles de cortisol y disminuye la frecuencia cardíaca.

### Técnica 4-7-8

Una de las técnicas más efectivas es la respiración 4-7-8:
1. Inhala por la nariz durante 4 segundos.
2. Mantén el aire durante 7 segundos.
3. Exhala por la boca durante 8 segundos.

Repite este ciclo 4 veces y notarás la diferencia inmediatamente.

## Integrando la práctica

No necesitas una hora libre. Puedes practicar mientras esperas el autobús, antes de una reunión importante o justo antes de dormir. La clave es la constancia.
    `,
    imagen: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    categoria_nombre: "Bienestar",
    fecha_publicacion: "2024-03-15",
    autor_nombre: "Ana García",
    autor_bio: "Instructora de yoga y meditación con más de 10 años de experiencia ayudando a personas a encontrar su equilibrio interior.",
    autor_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
};

const PostDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [readingProgress, setReadingProgress] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`${API_URL}/public/posts/${id}/`);
                setPost(response.data);

                if (response.data.categoria) {
                    const relatedResponse = await axios.get(`${API_URL}/public/posts/`);
                    const related = relatedResponse.data
                        .filter((p: any) => p.id !== parseInt(id!) && p.categoria === response.data.categoria)
                        .slice(0, 3);
                    setRelatedPosts(related);
                }
            } catch (error) {
                console.error("Error fetching post", error);
                // Fallback to mock data if API fails or returns 404 (for demo purposes)
                setPost(MOCK_POST);
                setRelatedPosts([
                    {
                        id: 102,
                        titulo: "Nutrición Consciente",
                        extracto: "Aprende a escuchar a tu cuerpo.",
                        imagen: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                        categoria_nombre: "Nutrición",
                        fecha_publicacion: "2024-03-10"
                    },
                    {
                        id: 103,
                        titulo: "Yoga para Principiantes",
                        extracto: "Guía completa para iniciar.",
                        imagen: "https://images.unsplash.com/photo-1544367563-12123d8965cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                        categoria_nombre: "Yoga",
                        fecha_publicacion: "2024-03-05"
                    }
                ]);
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

    const estimatedReadTime = post ? Math.ceil((post.contenido || "").split(' ').length / 200) : 0;

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-tmm-white">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-tmm-pink border-t-transparent"></div>
        </div>
    );

    if (!post) return <div className="min-h-screen flex items-center justify-center bg-tmm-white text-tmm-black">Artículo no encontrado</div>;

    return (
        <div className="min-h-screen bg-tmm-white font-sans selection:bg-tmm-pink/30">
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1.5 bg-tmm-white z-50">
                <div
                    className="h-full bg-gradient-to-r from-tmm-pink to-tmm-yellow transition-all duration-150 ease-out"
                    style={{ width: `${readingProgress}%` }}
                />
            </div>

            {/* Hero Section */}
            <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={post.imagen}
                        alt={post.titulo}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-tmm-black/30 via-tmm-black/20 to-tmm-black/80" />
                </div>

                <div className="absolute inset-0 flex flex-col justify-end pb-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 group">
                            <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-all">
                                <ArrowLeft size={20} />
                            </div>
                            <span className="font-medium">Volver al Blog</span>
                        </Link>

                        <div className="animate-fade-in-up">
                            {post.categoria_nombre && (
                                <span className="inline-block px-4 py-1.5 bg-tmm-yellow text-tmm-black rounded-full text-sm font-bold uppercase tracking-wider mb-6 shadow-lg">
                                    {post.categoria_nombre}
                                </span>
                            )}

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-6 leading-tight text-white drop-shadow-lg">
                                {post.titulo}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm font-medium">
                                <div className="flex items-center gap-2 bg-tmm-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    <User size={18} className="text-tmm-yellow" />
                                    <span>{post.autor_nombre || 'TMM Team'}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-tmm-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    <CalendarBlank size={18} className="text-tmm-yellow" />
                                    <span>{new Date(post.fecha_publicacion).toLocaleDateString('es-CL', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-tmm-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    <Clock size={18} className="text-tmm-yellow" />
                                    <span>{estimatedReadTime} min de lectura</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white -mt-20 relative rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10">
                {/* Share Buttons */}
                <div className="flex items-center justify-between border-b border-tmm-black/5 pb-8 mb-12">
                    <span className="text-sm font-bold text-tmm-black/40 uppercase tracking-wider flex items-center gap-2">
                        <ShareNetwork size={18} />
                        Compartir
                    </span>
                    <div className="flex items-center gap-2">
                        {[
                            { icon: FacebookLogo, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, color: "hover:text-[#1877F2]" },
                            { icon: TwitterLogo, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, color: "hover:text-[#1DA1F2]" },
                            { icon: LinkedinLogo, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, color: "hover:text-[#0A66C2]" }
                        ].map((item, index) => (
                            <a
                                key={index}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-3 rounded-full bg-tmm-white text-tmm-black/50 hover:bg-tmm-white/80 transition-all duration-300 ${item.color}`}
                            >
                                <item.icon size={20} weight="fill" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Post Content */}
                <div className="prose prose-lg prose-neutral max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-tmm-black prose-p:text-tmm-black/80 prose-p:leading-relaxed prose-a:text-tmm-pink prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg">
                    <div className="text-xl md:text-2xl leading-relaxed text-tmm-black/90 mb-12 font-serif italic border-l-4 border-tmm-pink pl-8 py-2 bg-gradient-to-r from-tmm-pink/5 to-transparent rounded-r-lg">
                        {post.extracto}
                    </div>

                    <div className="space-y-8">
                        {post.contenido.split('\n').map((paragraph: string, index: number) => {
                            if (!paragraph.trim()) return null;

                            if (paragraph.startsWith('# ')) {
                                return <h2 key={index} className="text-3xl md:text-4xl mt-12 mb-6 text-tmm-black">{paragraph.slice(2)}</h2>;
                            }
                            if (paragraph.startsWith('## ')) {
                                return <h3 key={index} className="text-2xl md:text-3xl mt-10 mb-4 text-tmm-black">{paragraph.slice(3)}</h3>;
                            }
                            if (paragraph.startsWith('### ')) {
                                return <h4 key={index} className="text-xl md:text-2xl mt-8 mb-3 text-tmm-black">{paragraph.slice(4)}</h4>;
                            }
                            if (paragraph.startsWith('> ')) {
                                return (
                                    <div key={index} className="relative my-10 pl-10 pr-4 py-4">
                                        <Quotes size={48} weight="fill" className="absolute top-0 left-0 text-tmm-pink/20 -z-10" />
                                        <blockquote className="text-xl italic text-tmm-black/90 font-serif relative z-10">
                                            {paragraph.slice(2)}
                                        </blockquote>
                                    </div>
                                );
                            }
                            if (paragraph.match(/^\d+\./)) {
                                return (
                                    <div key={index} className="flex gap-4 ml-4 mb-4">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-tmm-pink/10 text-tmm-pink font-bold flex items-center justify-center text-sm">
                                            {paragraph.split('.')[0]}
                                        </span>
                                        <p className="m-0">{paragraph.split('.').slice(1).join('.').trim()}</p>
                                    </div>
                                );
                            }

                            return (
                                <p key={index} className="text-lg text-tmm-black/70 leading-8">
                                    {paragraph}
                                </p>
                            );
                        })}
                    </div>
                </div>

                {/* Author Bio */}
                <div className="mt-16 p-8 bg-tmm-white rounded-2xl border border-tmm-black/5 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                    <img
                        src={post.autor_avatar || "https://ui-avatars.com/api/?name=" + (post.autor_nombre || "Admin") + "&background=random"}
                        alt={post.autor_nombre}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <div>
                        <h4 className="text-lg font-bold text-tmm-black mb-1">Escrito por {post.autor_nombre || "Equipo TMM"}</h4>
                        <p className="text-tmm-black/70 leading-relaxed mb-4">
                            {post.autor_bio || "Apasionados por el bienestar y el crecimiento personal. Compartimos herramientas para una vida más plena."}
                        </p>
                        <Link to="/blog" className="text-sm font-bold text-tmm-pink hover:text-tmm-yellow transition-colors inline-flex items-center gap-1">
                            Ver más artículos <CaretRight weight="bold" />
                        </Link>
                    </div>
                </div>
            </article>

            {/* Newsletter CTA */}
            <div className="bg-tmm-pink/20 py-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-30">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-tmm-yellow rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-tmm-green rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h3 className="text-3xl md:text-4xl font-bold font-serif text-tmm-black mb-6">
                        ¿Te inspiró este artículo?
                    </h3>
                    <p className="text-xl text-tmm-black/70 mb-10 max-w-2xl mx-auto">
                        Únete a nuestra comunidad y recibe dosis semanales de inspiración, consejos de bienestar y novedades exclusivas.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                        <input
                            type="email"
                            placeholder="Tu correo electrónico"
                            className="px-6 py-4 rounded-full border border-tmm-black/10 bg-white text-tmm-black placeholder-tmm-black/40 focus:border-tmm-pink focus:outline-none focus:ring-1 focus:ring-tmm-pink flex-1 shadow-sm transition-all"
                        />
                        <button className="px-8 py-4 bg-tmm-black text-white rounded-full font-bold hover:bg-tmm-black/80 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            Suscribirme
                        </button>
                    </div>
                    <p className="mt-4 text-xs text-tmm-black/40">Respetamos tu privacidad. Cancele en cualquier momento.</p>
                </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-tmm-white">
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="text-3xl font-bold font-serif text-tmm-black">
                            Artículos Relacionados
                        </h3>
                        <Link to="/blog" className="hidden sm:flex items-center gap-2 text-tmm-pink font-bold hover:gap-3 transition-all">
                            Ver todo el blog <ArrowRight weight="bold" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {relatedPosts.map((relatedPost) => (
                            <Link
                                key={relatedPost.id}
                                to={`/blog/${relatedPost.id}`}
                                className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img
                                        src={relatedPost.imagen || "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                                        alt={relatedPost.titulo}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-tmm-black/0 group-hover:bg-tmm-black/10 transition-colors" />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-xs font-bold text-tmm-pink uppercase tracking-wider mb-3">
                                        {relatedPost.categoria_nombre || "Blog"}
                                    </div>
                                    <h4 className="mb-3 font-serif text-xl font-bold text-tmm-black group-hover:text-tmm-pink transition-colors line-clamp-2">
                                        {relatedPost.titulo}
                                    </h4>
                                    <p className="text-sm text-tmm-black/60 line-clamp-2 mb-4">
                                        {relatedPost.extracto}
                                    </p>
                                    <span className="text-xs font-medium text-tmm-black/40 flex items-center gap-1">
                                        <CalendarBlank size={14} />
                                        {new Date(relatedPost.fecha_publicacion).toLocaleDateString()}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-12 text-center sm:hidden">
                        <Link to="/blog" className="inline-flex items-center gap-2 text-tmm-pink font-bold">
                            Ver todo el blog <ArrowRight weight="bold" />
                        </Link>
                    </div>
                </div>
            )}

            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 p-4 bg-tmm-black text-white rounded-full shadow-lg hover:bg-tmm-pink transition-all transform hover:scale-110 z-40 ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                    }`}
                aria-label="Volver arriba"
            >
                <ArrowUp size={24} weight="bold" />
            </button>
        </div>
    );
};

export default PostDetail;
