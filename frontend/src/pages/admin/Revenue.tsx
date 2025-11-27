import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { DollarSign, TrendingUp, CreditCard, Download, ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdmin } from '../../context/AdminContext';

const AdminRevenue = () => {
    const { clientType } = useAdmin();
    const [revenueData, setRevenueData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [monthFilter, setMonthFilter] = useState(searchParams.get('month') || '');

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await axios.get(`http://localhost:8000/api/admin/revenue/?type=${clientType}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("Revenue Data Response:", response.data);
                if (response.data.recent_transactions) {
                    console.log("Sample Transaction Date:", response.data.recent_transactions[0]?.fecha);
                }
                setRevenueData(response.data);
            } catch (error) {
                console.error("Error fetching revenue", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRevenue();
    }, [clientType]);

    useEffect(() => {
        const month = searchParams.get('month');
        if (month) setMonthFilter(month);
    }, [searchParams]);

    const handleChartClick = (data: any) => {
        if (data && data.activePayload && data.activePayload[0]) {
            const month = data.activePayload[0].payload.month;
            setSearchParams({ month });
            setMonthFilter(month);
        }
    };

    const clearFilter = () => {
        setSearchParams({});
        setMonthFilter('');
    };

    const filteredTransactions = revenueData?.recent_transactions?.filter((t: any) => {
        if (!monthFilter) return true;
        // Assuming t.fecha is in a format where we can extract the month or it matches the chart month format.
        // Since I don't know the exact format of t.fecha and chart month, I'll attempt a loose match or assume the backend provides compatible data.
        // For now, let's assume the chart month is the full month name in Spanish (e.g. "Noviembre") and t.fecha is "YYYY-MM-DD".
        // I'll need a helper to map date to month name if needed.
        // Or, simpler: check if the transaction date string contains the month filter (if it's a substring).
        // A more robust way would be to parse the date.
        // Let's try to match loosely for now.
        return t.fecha.toLowerCase().includes(monthFilter.toLowerCase()) ||
            new Date(t.fecha).toLocaleString('es-CL', { month: 'long' }).toLowerCase() === monthFilter.toLowerCase();
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando datos financieros...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    {monthFilter && (
                        <button onClick={clearFilter} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Volver a vista general">
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                    )}
                    <div>
                        <h2 className="text-3xl font-bold font-heading text-gray-800">Ingresos y Finanzas</h2>
                        {monthFilter && <p className="text-gray-500">Filtrado por: {monthFilter}</p>}
                    </div>
                </div>
                <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
                    <Download className="w-5 h-5" />
                    Exportar Reporte
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div onClick={clearFilter} className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white cursor-pointer hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h3 className="text-green-100 text-sm font-medium">Ingresos Totales (Año)</h3>
                    <p className="text-3xl font-bold mt-1">${revenueData?.total_revenue_year?.toLocaleString('es-CL')}</p>
                </div>

                <Link to="/admin/clients?payment=PENDIENTE" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer block">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Pagos Pendientes</h3>
                    <p className="text-2xl font-bold text-gray-800">${revenueData?.pending_payments?.toLocaleString('es-CL')}</p>
                    <p className="text-xs text-gray-400 mt-2">{revenueData?.pending_count} inscripciones por confirmar</p>
                </Link>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Ticket Promedio</h3>
                    <p className="text-2xl font-bold text-gray-800">${revenueData?.average_ticket?.toLocaleString('es-CL')}</p>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Evolución de Ingresos</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData?.revenue_chart} onClick={handleChartClick}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                tickFormatter={(value) => `$${value / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [`$${value.toLocaleString('es-CL')}`, 'Ingresos']}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#0D9488"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                activeDot={{ r: 8, onClick: (_, payload) => handleChartClick({ activePayload: [payload] }) }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">
                        {monthFilter ? `Transacciones de ${monthFilter}` : 'Últimas Transacciones'}
                    </h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Concepto</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredTransactions?.length > 0 ? (
                            filteredTransactions.map((transaction: any) => (
                                <tr key={transaction.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-500">{transaction.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{transaction.cliente}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{transaction.concepto}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{transaction.fecha}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">${transaction.monto.toLocaleString('es-CL')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.estado === 'PAGADO' ? 'bg-green-100 text-green-700' :
                                            transaction.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {transaction.estado === 'PAGADO' ? 'Completado' : transaction.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No hay transacciones para este período.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminRevenue;
