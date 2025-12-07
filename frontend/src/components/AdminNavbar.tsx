import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, DollarSign, LogOut, Briefcase, User, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';

const AdminNavbar = () => {
    const { logout } = useAuth();
    const { clientType, setClientType } = useAdmin();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="bg-tmm-black text-tmm-white w-64 min-h-screen flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-tmm-white/10">
                <h1 className="text-2xl font-bold font-serif text-tmm-pink">TMM Admin</h1>
                <p className="text-xs text-tmm-white/60 mt-1">Panel de Control</p>

                {/* Global Client Type Toggle */}
                <div className="mt-4 bg-tmm-white/5 p-1 rounded-lg flex">
                    <button
                        onClick={() => setClientType('B2C')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${clientType === 'B2C'
                            ? 'bg-tmm-pink text-tmm-black shadow-sm'
                            : 'text-tmm-white/60 hover:text-tmm-white'
                            }`}
                    >
                        <User className="w-3 h-3" />
                        B2C
                    </button>
                    <button
                        onClick={() => setClientType('B2B')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${clientType === 'B2B'
                            ? 'bg-tmm-green text-tmm-black shadow-sm'
                            : 'text-tmm-white/60 hover:text-tmm-white'
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/dashboard') ? 'bg-tmm-pink text-tmm-black' : 'text-tmm-white/60 hover:bg-tmm-white/10 hover:text-tmm-white'}`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                </Link>

                <Link
                    to="/admin/products"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/products') ? 'bg-tmm-pink text-tmm-black' : 'text-tmm-white/60 hover:bg-tmm-white/10 hover:text-tmm-white'}`}
                >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="font-medium">Productos</span>
                </Link>

                <Link
                    to="/admin/workshops"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/workshops') ? 'bg-tmm-pink text-tmm-black' : 'text-tmm-white/60 hover:bg-tmm-white/10 hover:text-tmm-white'}`}
                >
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Talleres</span>
                </Link>

                <Link
                    to="/admin/courses"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/courses') ? 'bg-tmm-pink text-tmm-black' : 'text-tmm-white/60 hover:bg-tmm-white/10 hover:text-tmm-white'}`}
                >
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Cursos</span>
                </Link>

                <Link
                    to="/admin/blog"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/blog') ? 'bg-tmm-pink text-tmm-black' : 'text-tmm-white/60 hover:bg-tmm-white/10 hover:text-tmm-white'}`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">Blog</span>
                </Link>

                <Link
                    to="/admin/clients"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/clients') ? 'bg-tmm-pink text-tmm-black' : 'text-tmm-white/60 hover:bg-tmm-white/10 hover:text-tmm-white'}`}
                >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Clientes</span>
                </Link>

                <Link
                    to="/admin/messages"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/messages') ? 'bg-tmm-pink text-tmm-black' : 'text-tmm-white/60 hover:bg-tmm-white/10 hover:text-tmm-white'}`}
                >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Mensajes</span>
                </Link>

                <Link
                    to="/admin/revenue"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/revenue') ? 'bg-tmm-pink text-tmm-black' : 'text-tmm-white/60 hover:bg-tmm-white/10 hover:text-tmm-white'}`}
                >
                    <DollarSign className="w-5 h-5" />
                    <span className="font-medium">Ingresos</span>
                </Link>

                <Link
                    to="/admin/payments"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/payments') ? 'bg-tmm-pink text-tmm-black' : 'text-tmm-white/60 hover:bg-tmm-white/10 hover:text-tmm-white'}`}
                >
                    <DollarSign className="w-5 h-5" />
                    <span className="font-medium">Verificador Pagos</span>
                </Link>
            </nav>

            <div className="p-4 border-t border-tmm-white/10 space-y-2">
                <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-tmm-white/60 hover:bg-tmm-white/10 hover:text-tmm-white transition-colors"
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
