import { useState } from 'react';
import { Link } from 'react-router-dom';
import { List, X, User, HeartStraight } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, user, isAdmin } = useAuth();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Talleres', path: '/workshops' },
        { name: 'Cursos', path: '/courses' },
        { name: 'Calendario', path: '/calendar' },
        { name: 'Blog', path: '/blog' },
        { name: 'Fundadora', path: '/about' },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-silver-gray bg-cloud-pink/80 backdrop-blur-md transition-all">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 shadow-sm transition-transform group-hover:scale-105">
                                <HeartStraight weight="light" className="h-6 w-6 text-sage-gray" />
                            </div>
                            <span className="font-serif text-xl font-bold text-sage-gray">TMM Bienestar</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-sm font-medium text-charcoal-gray transition-colors hover:text-sage-gray"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* User Menu & CTA */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {isAuthenticated ? (
                            <>
                                {isAdmin && (
                                    <Link to="/admin/dashboard" className="text-sm font-medium text-charcoal-gray hover:text-sage-gray">
                                        Panel Admin
                                    </Link>
                                )}
                                <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-charcoal-gray hover:text-sage-gray">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-silver-gray/30">
                                        <User weight="light" className="h-4 w-4" />
                                    </div>
                                    <span>{user?.first_name || 'Perfil'}</span>
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-medium text-charcoal-gray hover:text-sage-gray">
                                    Ingresar
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary" size="sm" className="rounded-full shadow-sm hover:shadow-md">
                                        Registrarse
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-charcoal-gray hover:text-sage-gray focus:outline-none"
                        >
                            {isOpen ? <X weight="light" className="h-6 w-6" /> : <List weight="light" className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="border-t border-silver-gray bg-cloud-pink md:hidden">
                    <div className="space-y-1 px-4 pb-3 pt-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="block rounded-md px-3 py-2 text-base font-medium text-charcoal-gray hover:bg-white/50 hover:text-sage-gray"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="mt-4 border-t border-silver-gray pt-4">
                            {isAuthenticated ? (
                                <>
                                    {isAdmin && (
                                        <Link
                                            to="/admin/dashboard"
                                            className="block rounded-md px-3 py-2 text-base font-medium text-charcoal-gray hover:bg-white/50"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Panel Admin
                                        </Link>
                                    )}
                                    <Link
                                        to="/profile"
                                        className="block rounded-md px-3 py-2 text-base font-medium text-charcoal-gray hover:bg-white/50"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Mi Perfil
                                    </Link>
                                </>
                            ) : (
                                <div className="space-y-2 px-3">
                                    <Link
                                        to="/login"
                                        className="block text-base font-medium text-charcoal-gray hover:text-sage-gray"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Ingresar
                                    </Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)}>
                                        <Button variant="primary" className="w-full rounded-full">
                                            Registrarse
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
