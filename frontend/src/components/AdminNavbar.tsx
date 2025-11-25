import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, DollarSign, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminNavbar = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold font-heading text-brand-pink">TMM Admin</h1>
                <p className="text-xs text-gray-400 mt-1">Panel de Control</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <Link
                    to="/admin/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/dashboard') ? 'bg-brand-calypso text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                </Link>

                <Link
                    to="/admin/workshops"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/workshops') ? 'bg-brand-calypso text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Talleres</span>
                </Link>

                <Link
                    to="/admin/courses"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/courses') ? 'bg-brand-calypso text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Cursos</span>
                </Link>

                <Link
                    to="/admin/blog"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/blog') ? 'bg-brand-calypso text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">Blog</span>
                </Link>

                <Link
                    to="/admin/clients"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/clients') ? 'bg-brand-calypso text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Clientes</span>
                </Link>

                <Link
                    to="/admin/messages"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/messages') ? 'bg-brand-calypso text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Mensajes</span>
                </Link>

                <Link
                    to="/admin/revenue"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/revenue') ? 'bg-brand-calypso text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                    <DollarSign className="w-5 h-5" />
                    <span className="font-medium">Ingresos</span>
                </Link>
            </nav>

            <div className="p-4 border-t border-gray-800 space-y-2">
                <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                >
                    <LogOut className="w-5 h-5 rotate-180" />
                    <span className="font-medium">Volver al Sitio</span>
                </Link>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
};

export default AdminNavbar;
