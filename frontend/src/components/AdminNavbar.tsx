import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, DollarSign, LogOut, Briefcase, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';

const AdminNavbar = () => {
    const { logout } = useAuth();
    const { clientType, setClientType } = useAdmin();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold font-heading text-brand-pink">TMM Admin</h1>
                <p className="text-xs text-gray-400 mt-1">Panel de Control</p>

                {/* Global Client Type Toggle */}
                <div className="mt-4 bg-gray-800 p-1 rounded-lg flex">
                    <button
                        onClick={() => setClientType('B2C')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${clientType === 'B2C'
                                ? 'bg-brand-calypso text-white shadow-sm'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <User className="w-3 h-3" />
                        B2C
                    </button>
                    <button
                        onClick={() => setClientType('B2B')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${clientType === 'B2B'
                                ? 'bg-brand-pink text-white shadow-sm'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Briefcase className="w-3 h-3" />
                        B2B
                    </button>
                </div>
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

                <Link
                    to="/admin/payments"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/payments') ? 'bg-brand-calypso text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                    <DollarSign className="w-5 h-5" />
                    <span className="font-medium">Verificador Pagos</span>
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
