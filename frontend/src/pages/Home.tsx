import { Star, ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsletterModal from '../components/NewsletterModal';

const Home = () => {
    return (
        <div className="flex flex-col">
            <section className="relative bg-brand-pink/30 py-20 lg:py-32 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-pink rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-brand-mint rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-8 animate-fade-in-up">
                            <Heart className="w-4 h-4 text-brand-fuchsia" />
                            <span className="text-sm font-medium text-gray-600">Bienestar y Creatividad</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-heading font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up animation-delay-100">
                            Crea, sana y conecta <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-fuchsia to-brand-calypso">desde tus manos 💕</span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-10 animate-fade-in-up animation-delay-200">
                            Un espacio seguro donde el arte y el bienestar se encuentran. Descubre talleres, cursos y una comunidad que te acompaña.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
                            <Link to="/workshops" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-brand-calypso hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                Ver Talleres
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                            <Link to="/about" className="inline-flex items-center justify-center px-8 py-3 border-2 border-brand-pink text-base font-medium rounded-full text-gray-700 bg-white hover:bg-brand-pink/10 transition-all">
                                Conóceme
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features/Values Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center p-6 rounded-2xl hover:bg-brand-pink/10 transition-colors duration-300">
                            <div className="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl">✨</span>
                            </div>
                            <h3 className="text-xl font-heading font-bold mb-3">Creatividad Consciente</h3>
                            <p className="text-gray-600">Aprende a usar tus manos como herramienta de sanación y expresión personal.</p>
                        </div>
                        <div className="text-center p-6 rounded-2xl hover:bg-brand-mint/10 transition-colors duration-300">
                            <div className="w-16 h-16 bg-brand-mint rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl">🌿</span>
                            </div>
                            <h3 className="text-xl font-heading font-bold mb-3">Bienestar Integral</h3>
                            <p className="text-gray-600">Conecta contigo misma a través de procesos creativos pausados y amorosos.</p>
                        </div>
                        <div className="text-center p-6 rounded-2xl hover:bg-brand-pink/10 transition-colors duration-300">
                            <div className="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl">🤝</span>
                            </div>
                            <h3 className="text-xl font-heading font-bold mb-3">Comunidad Segura</h3>
                            <p className="text-gray-600">Forma parte de un grupo de mujeres que comparten, crecen y se apoyan.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-brand-pink/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">Lo que dicen nuestras alumnas</h2>
                        <div className="w-24 h-1 bg-brand-calypso mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex gap-1 text-brand-intenseYellow mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 italic">
                                    "Un espacio maravilloso donde pude reconectar con mi creatividad. Las clases son súper claras y el ambiente es muy acogedor."
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                                        {/* Placeholder for user avatar */}
                                        <div className="w-full h-full bg-brand-mint flex items-center justify-center text-white font-bold">
                                            A
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Ana María</h4>
                                        <p className="text-sm text-gray-500">Alumna de Resina</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-brand-calypso text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">¿Lista para comenzar tu viaje creativo?</h2>
                    <p className="text-xl mb-10 opacity-90">Descarga nuestro E-book gratuito y da el primer paso hacia tu bienestar.</p>
                    <button className="bg-white text-brand-calypso px-8 py-3 rounded-full font-bold text-lg hover:bg-brand-pink transition-colors shadow-lg">
                        Descargar E-book Gratis
                    </button>
                </div>
            </section>
            {/* Newsletter Modal */}
            <NewsletterModal />
        </div>
    );
};

export default Home;
