import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X, User, ShoppingBag } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/Button';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, user, isAdmin } = useAuth();
    const { openCart, cartCount } = useCart();
    const location = useLocation();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Talleres', path: '/talleres' },
        { name: 'Cursos', path: '/cursos' },
        { name: 'Calendario', path: '/calendario' },
        { name: 'Blog', path: '/blog' },
        { name: 'Fundadora', path: '/nosotros' },
        { name: 'Productos', path: '/tienda' },
    ];

    const isActive = (path: string) => location.pathname === path;

    if (location.pathname.startsWith('/admin')) return null;

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-tmm-pink/20 bg-tmm-white/80 backdrop-blur-md transition-all">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img src="/logo.png" alt="TMM Logo" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
                            <span className="font-serif text-xl font-bold text-tmm-black">TMM Bienestar</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="relative px-2 py-1 text-sm font-medium transition-colors hover:text-tmm-black hover:font-bold"
                            >
                                {isActive(link.path) && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute inset-0 rounded-full bg-tmm-pink/30 -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className={isActive(link.path) ? 'text-tmm-black font-bold' : 'text-tmm-black/80'}>
                                    {link.name}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* User Menu & CTA */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {/* Cart Button */}
                        <button
                            onClick={openCart}
                            className="relative p-2 text-tmm-black hover:text-tmm-pink transition-colors"
                        >
                            <ShoppingBag size={24} />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-tmm-pink text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {isAuthenticated ? (
                            <>
                                {isAdmin && (
                                    <Link to="/admin/dashboard" className="text-sm font-medium text-tmm-black hover:text-tmm-black/70">
                                        Panel Admin
                                    </Link>
                                )}
                                <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-tmm-black hover:text-tmm-black/70">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tmm-pink/30">
                                        <User weight="light" className="h-4 w-4" />
                                    </div>
                                    <span>{user?.first_name || 'Perfil'}</span>
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-medium text-tmm-black hover:text-tmm-black/70">
                                    Ingresar
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary" size="sm" className="rounded-full shadow-sm hover:shadow-md bg-tmm-pink text-tmm-black hover:bg-tmm-pink/80 border-none">
                                        Registrarse
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-4">
                        <button
                            onClick={openCart}
                            className="relative p-2 text-tmm-black hover:text-tmm-pink transition-colors"
                        >
                            <ShoppingBag size={24} />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-tmm-pink text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-tmm-black hover:text-tmm-black/70 focus:outline-none"
                        >
                            {isOpen ? <X weight="light" className="h-6 w-6" /> : <List weight="light" className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-tmm-pink/20 bg-tmm-white md:hidden overflow-hidden"
                    >
                        <div className="space-y-1 px-4 pb-3 pt-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`block rounded-md px-3 py-2 text-base font-medium hover:bg-tmm-pink/20 ${isActive(link.path) ? 'text-tmm-pink font-bold' : 'text-tmm-black'
                                        }`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="mt-4 border-t border-tmm-pink/20 pt-4">
                                {isAuthenticated ? (
                                    <>
                                        {isAdmin && (
                                            <Link
                                                to="/admin/dashboard"
                                                className="block rounded-md px-3 py-2 text-base font-medium text-tmm-black hover:bg-tmm-pink/20"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Panel Admin
                                            </Link>
                                        )}
                                        <Link
                                            to="/profile"
                                            className="block rounded-md px-3 py-2 text-base font-medium text-tmm-black hover:bg-tmm-pink/20"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Mi Perfil
                                        </Link>
                                    </>
                                ) : (
                                    <div className="space-y-2 px-3">
                                        <Link
                                            to="/login"
                                            className="block text-base font-medium text-tmm-black hover:text-tmm-black/70"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Ingresar
                                        </Link>
                                        <Link to="/register" onClick={() => setIsOpen(false)}>
                                            <Button variant="primary" className="w-full rounded-full bg-tmm-pink text-tmm-black hover:bg-tmm-pink/80 border-none">
                                                Registrarse
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
