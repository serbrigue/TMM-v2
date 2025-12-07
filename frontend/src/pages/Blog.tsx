import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CalendarBlank, User, ArrowRight, MagnifyingGlass, CaretRight, Sparkle } from '@phosphor-icons/react';
import { Button } from '../components/ui/Button';
import { API_URL } from '../config/api';

// Mock data for "Default Template" visualization if API is empty
const MOCK_POSTS = [
    {
        id: 101,
        titulo: "El Arte de la Calma: Técnicas de Respiración para el Día a Día",
        extracto: "Descubre cómo simples ejercicios de respiración pueden transformar tu estado mental y reducir el estrés en cuestión de minutos.",
        imagen: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        categoria_nombre: "Bienestar",
        fecha_publicacion: "2024-03-15",
        autor_nombre: "Ana García",
        lectura_tiempo: 5
    },
    {
        id: 102,
        titulo: "Nutrición Consciente: Más allá de las Calorías",
        extracto: "Aprende a escuchar a tu cuerpo y a nutrirlo con alimentos que te llenan de energía y vitalidad.",
        imagen: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        categoria_nombre: "Nutrición",
        fecha_publicacion: "2024-03-10",
        autor_nombre: "Carlos Ruiz",
        lectura_tiempo: 8
    },
    {
        id: 103,
        titulo: "Yoga para Principiantes: Tu Primera Semana",
        extracto: "Una guía completa para iniciar tu práctica de yoga desde casa, sin presiones y a tu propio ritmo.",
        imagen: "https://images.unsplash.com/photo-1544367563-12123d8965cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        categoria_nombre: "Yoga",
        fecha_publicacion: "2024-03-05",
        autor_nombre: "Elena Torres",
        lectura_tiempo: 12
    }
];

const Blog = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${API_URL}/public/posts/`);
                // If API returns empty, use MOCK_POSTS for demonstration
                if (response.data && response.data.length > 0) {
                    setPosts(response.data);
                } else {
                    setPosts(MOCK_POSTS);
                }
            } catch (error) {
                console.error("Error fetching posts", error);
                setPosts(MOCK_POSTS); // Fallback to mock on error
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // Filter logic
    const categories = ["Todos", ...Array.from(new Set(posts.map(p => p.categoria_nombre).filter(Boolean)))];

    const filteredPosts = posts.filter(post => {
        const matchesCategory = selectedCategory === "Todos" || post.categoria_nombre === selectedCategory;
        const matchesSearch = post.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.extracto.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const featuredPost = filteredPosts[0];
    const gridPosts = filteredPosts.slice(1);

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-tmm-white">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-tmm-pink border-t-transparent"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-tmm-white font-sans selection:bg-tmm-pink/30">
            {/* Header / Hero Section */}
            <div className="relative bg-tmm-pink/30 text-tmm-black py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-tmm-yellow rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 -left-24 w-72 h-72 bg-tmm-green rounded-full blur-3xl"></div>
                </div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-sm border border-white/50 mb-6 shadow-sm">
                        <Sparkle className="text-tmm-black" weight="fill" />
                        <span className="text-sm font-medium tracking-wide text-tmm-black">TMM Blog & Recursos</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold font-serif mb-6 tracking-tight text-tmm-black">
                        Historias que <span className="text-tmm-black/70 italic">Inspiran</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl text-tmm-black/70 leading-relaxed">
                        Explora nuestros artículos sobre bienestar, salud mental y crecimiento personal.
                    </p>
                </div>
            </div>

            {/* Filters & Search Bar */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Categories */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === cat
                                        ? 'bg-tmm-black text-white shadow-md transform scale-105'
                                        : 'bg-tmm-white text-tmm-black/60 hover:bg-tmm-white/80 hover:text-tmm-black'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlass className="h-4 w-4 text-tmm-black/40" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar artículo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-tmm-black/10 rounded-full leading-5 bg-tmm-white placeholder-tmm-black/40 focus:outline-none focus:bg-white focus:border-tmm-pink focus:ring-1 focus:ring-tmm-pink sm:text-sm transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                {/* Featured Post */}
                {featuredPost && (
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold font-serif text-tmm-black mb-8 flex items-center gap-3">
                            <span className="w-8 h-1 bg-tmm-pink rounded-full"></span>
                            Destacado de la semana
                        </h2>
                        <Link to={`/blog/${featuredPost.id}`} className="group relative block overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
                            <div className="grid md:grid-cols-2 h-full">
                                <div className="relative h-64 md:h-auto overflow-hidden">
                                    <div className="absolute inset-0 bg-tmm-white animate-pulse" /> {/* Placeholder */}
                                    <img
                                        src={featuredPost.imagen || "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                                        alt={featuredPost.titulo}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-tmm-black/60 to-transparent md:hidden" />
                                </div>
                                <div className="relative bg-tmm-green/20 p-8 md:p-12 flex flex-col justify-center">
                                    <div className="absolute top-0 right-0 p-12 opacity-10">
                                        <Sparkle size={120} weight="fill" className="text-tmm-black" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-6">
                                            {featuredPost.categoria_nombre && (
                                                <span className="px-3 py-1 bg-tmm-black text-white text-xs font-bold uppercase tracking-wider rounded-sm">
                                                    {featuredPost.categoria_nombre}
                                                </span>
                                            )}
                                            <span className="text-tmm-black/60 text-sm flex items-center gap-1">
                                                <CalendarBlank size={14} />
                                                {new Date(featuredPost.fecha_publicacion).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-tmm-black mb-6 leading-tight group-hover:text-tmm-black/70 transition-colors">
                                            {featuredPost.titulo}
                                        </h3>

                                        <p className="text-tmm-black/70 text-lg mb-8 line-clamp-3 leading-relaxed">
                                            {featuredPost.extracto}
                                        </p>

                                        <div className="flex items-center justify-between border-t border-tmm-black/10 pt-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-tmm-black shadow-sm">
                                                    <User size={20} />
                                                </div>
                                                <div className="text-sm">
                                                    <p className="text-tmm-black font-medium">{featuredPost.autor_nombre || "Equipo TMM"}</p>
                                                    <p className="text-tmm-black/50">{featuredPost.lectura_tiempo || 5} min de lectura</p>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-tmm-black text-white group-hover:bg-tmm-pink group-hover:text-tmm-black transition-colors duration-300">
                                                <ArrowRight size={20} weight="bold" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Grid Layout */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {gridPosts.map((post) => (
                        <article key={post.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-tmm-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <Link to={`/blog/${post.id}`} className="relative h-56 overflow-hidden">
                                <img
                                    src={post.imagen || "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                                    alt={post.titulo}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-tmm-black/0 group-hover:bg-tmm-black/10 transition-colors duration-300" />
                                {post.categoria_nombre && (
                                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider text-tmm-black rounded-sm shadow-sm">
                                        {post.categoria_nombre}
                                    </span>
                                )}
                            </Link>

                            <div className="flex flex-1 flex-col p-6">
                                <div className="flex items-center gap-3 text-xs text-tmm-black/50 mb-4">
                                    <span className="flex items-center gap-1">
                                        <CalendarBlank size={14} />
                                        {new Date(post.fecha_publicacion).toLocaleDateString()}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-tmm-black/20" />
                                    <span>{post.lectura_tiempo || 5} min lectura</span>
                                </div>

                                <h3 className="text-xl font-bold font-serif text-tmm-black mb-3 line-clamp-2 group-hover:text-tmm-pink transition-colors">
                                    <Link to={`/blog/${post.id}`}>
                                        {post.titulo}
                                    </Link>
                                </h3>

                                <p className="text-tmm-black/70 mb-6 line-clamp-3 text-sm leading-relaxed flex-grow">
                                    {post.extracto}
                                </p>

                                <div className="mt-auto pt-4 border-t border-tmm-black/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-medium text-tmm-black/60">
                                        <User size={16} className="text-tmm-pink" />
                                        {post.autor_nombre || "Admin"}
                                    </div>
                                    <Link to={`/blog/${post.id}`} className="text-tmm-pink font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Leer más <CaretRight weight="bold" />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className="py-20 text-center bg-tmm-white rounded-3xl border border-dashed border-tmm-black/20">
                        <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                            <MagnifyingGlass size={32} className="text-tmm-black/40" />
                        </div>
                        <h3 className="text-xl font-medium text-tmm-black mb-2">No se encontraron artículos</h3>
                        <p className="text-tmm-black/60">Intenta ajustar tu búsqueda o filtros.</p>
                        <Button
                            variant="outline"
                            className="mt-6"
                            onClick={() => {
                                setSelectedCategory("Todos");
                                setSearchQuery("");
                            }}
                        >
                            Limpiar filtros
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
