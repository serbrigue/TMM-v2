import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Heart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, user, isAdmin } = useAuth();

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex justify-between h-20 items-center">
                    {/* Logo - Left */}
                    <div className="flex items-center flex-shrink-0 z-10">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-brand-pink rounded-full flex items-center justify-center">
                                <Heart className="w-6 h-6 text-white fill-current" />
                            </div>
                            <span className="font-heading font-bold text-xl text-gray-800">TMM Bienestar</span>
                        </Link>
                    </div>

                    {/* Desktop Menu - Centered */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center space-x-6">
                        <Link to="/" className="text-gray-600 hover:text-brand-calypso px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
                        <Link to="/workshops" className="text-gray-600 hover:text-brand-calypso px-3 py-2 rounded-md text-sm font-medium transition-colors">Talleres</Link>
                        <Link to="/courses" className="text-gray-600 hover:text-brand-calypso px-3 py-2 rounded-md text-sm font-medium transition-colors">Cursos</Link>
                        <Link to="/calendar" className="text-gray-600 hover:text-brand-calypso px-3 py-2 rounded-md text-sm font-medium transition-colors">Calendario</Link>
                        <Link to="/blog" className="text-gray-600 hover:text-brand-calypso px-3 py-2 rounded-md text-sm font-medium transition-colors">Blog</Link>
                        <Link to="/about" className="text-gray-600 hover:text-brand-calypso px-3 py-2 rounded-md text-sm font-medium transition-colors">Fundadora</Link>
                    </div>

                    {/* User Menu - Right */}
                    <div className="hidden md:flex items-center flex-shrink-0 z-10">
                        {isAuthenticated ? (
                            <>
                                {isAdmin && (
                                    <Link to="/admin/dashboard" className="text-gray-600 hover:text-brand-calypso font-medium transition-colors mr-4">
                                        Panel Admin
                                    </Link>
                                )}
                                <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-brand-calypso font-medium transition-colors">
                                    <div className="w-8 h-8 bg-brand-pink rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-gray-700" />
                                    </div>
                                    <span>{user?.first_name || 'Perfil'}</span>
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-gray-600 hover:text-brand-calypso font-medium transition-colors">Ingresar</Link>
                                <Link to="/register" className="bg-brand-calypso text-white px-5 py-2 rounded-full font-medium hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg">
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center z-10">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 hover:text-gray-900 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-calypso hover:bg-brand-pink/20">Home</Link>
                        <Link to="/workshops" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-calypso hover:bg-brand-pink/20">Talleres</Link>
                        <Link to="/courses" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-calypso hover:bg-brand-pink/20">Cursos Grabados</Link>
                        <Link to="/calendar" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-calypso hover:bg-brand-pink/20">Calendario</Link>
                        <Link to="/blog" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-calypso hover:bg-brand-pink/20">Blog</Link>
                        <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-calypso hover:bg-brand-pink/20">Sobre Mí</Link>

                        {isAuthenticated ? (
                            <>
                                {isAdmin && (
                                    <Link to="/admin/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-calypso hover:bg-brand-pink/20">Panel Admin</Link>
                                )}
                                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-calypso hover:bg-brand-pink/20">Mi Perfil</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-calypso hover:bg-brand-pink/20">Ingresar</Link>
                                <Link to="/register" className="block px-3 py-2 mt-4 text-center rounded-md text-base font-medium bg-brand-calypso text-white hover:bg-opacity-90">Registrarse</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
