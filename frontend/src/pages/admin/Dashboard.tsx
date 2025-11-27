import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { useAdmin } from '../../context/AdminContext';

const AdminDashboard = () => {
    const { clientType } = useAdmin();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('access_token');
                const response = await axios.get(`http://localhost:8000/api/admin/dashboard/?type=${clientType}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [clientType]);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando estadísticas...</div>;

    const COLORS = ['#0D9488', '#FF9EAA', '#FFF9C4', '#F97316', '#8B5CF6'];

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold font-heading text-gray-800">
                        Dashboard {clientType === 'B2B' ? 'Empresarial' : 'General'}
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Resumen de actividad y métricas clave ({clientType})
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Link to="/admin/revenue" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer block">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Ingresos Totales</h3>
                    <p className="text-2xl font-bold text-gray-800">${stats?.total_revenue?.toLocaleString()}</p>
                </Link>

                <Link to="/admin/clients?status=CLIENTE" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer block">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">+5%</span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Alumnos Activos</h3>
                    <p className="text-2xl font-bold text-gray-800">{stats?.active_students}</p>
                </Link>

                <Link to="/admin/workshops" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer block">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Próximos 30 días</span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Talleres Próximos</h3>
                    <p className="text-2xl font-bold text-gray-800">{stats?.upcoming_workshops}</p>
                </Link>

                <Link to="/admin/clients?status=LEAD" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer block">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">+8</span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Nuevos Leads</h3>
                    <p className="text-2xl font-bold text-gray-800">{stats?.new_leads}</p>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Popular Categories Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Categorías Más Populares</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.popular_categories}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {stats?.popular_categories?.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Rated Workshops Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Talleres Mejor Calificados</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={stats?.top_rated_workshops}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" domain={[0, 5]} hide />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="rating" fill="#FF9EAA" radius={[0, 4, 4, 0]}>
                                    {stats?.top_rated_workshops?.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Ingresos Mensuales (Tendencia)</h3>
                <div className="h-64 flex items-end justify-between gap-4 px-4">
                    {stats?.revenue_chart?.map((item: any, index: number) => (
                        <div key={index} className="flex flex-col items-center gap-2 w-full cursor-pointer" onClick={() => navigate(`/admin/revenue?month=${item.month}`)}>
                            <div
                                className="w-full bg-brand-calypso/80 rounded-t-lg hover:bg-brand-calypso transition-all relative group"
                                style={{ height: `${(item.amount / (Math.max(...stats.revenue_chart.map((d: any) => d.amount)) || 1)) * 100}%` }}
                            >
                                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    ${item.amount.toLocaleString()}
                                </div>
                            </div>
                            <span className="text-sm text-gray-500 font-medium">{item.month}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
