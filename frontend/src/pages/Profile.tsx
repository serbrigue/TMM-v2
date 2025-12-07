import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import PaymentModal from '../components/PaymentModal';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import ProfileInfo from '../components/profile/ProfileInfo';
import ProfileEnrollments from '../components/profile/ProfileEnrollments';
import ProfileCalendar from '../components/profile/ProfileCalendar';
import ProfilePayments from '../components/profile/ProfilePayments';
import ProfileOrders from '../components/profile/ProfileOrders';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import { PencilSimple } from '@phosphor-icons/react';
import { Button } from '../components/ui/Button';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'workshops' | 'calendar' | 'payments' | 'orders'>('profile');
    const [enrollments, setEnrollments] = useState<{ cursos: any[], talleres: any[] }>({ cursos: [], talleres: [] });
    const [orders, setOrders] = useState<any[]>([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['profile', 'courses', 'workshops', 'calendar', 'payments', 'orders'].includes(tab)) {
            setActiveTab(tab as any);
        }
    }, [location]);

    const fetchEnrollments = async () => {
        try {
            const [enrollmentsRes, ordersRes] = await Promise.all([
                client.get('/my-enrollments/'),
                client.get('/my-orders/')
            ]);

            setEnrollments(enrollmentsRes.data);
            setOrders(ordersRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, []);

    if (!user) return <div className="min-h-screen flex items-center justify-center text-tmm-black">Cargando perfil...</div>;

    const handleUploadReceipt = (enrollment: any) => {
        setSelectedEnrollment(enrollment);
        setIsPaymentModalOpen(true);
    };

    const tabs = [
        { id: 'profile', label: 'Mis Datos' },
        { id: 'courses', label: `Mis Cursos (${enrollments.cursos.length})` },
        { id: 'workshops', label: `Mis Talleres (${enrollments.talleres.length})` },
        { id: 'orders', label: `Mis Pedidos (${orders.length})` },
        { id: 'calendar', label: 'Calendario' },
        { id: 'payments', label: 'Pagos Pendientes' }
    ];

    const getCalendarEvents = () => {
        return [
            ...enrollments.talleres.map(t => ({
                date: new Date(t.taller_fecha),
                title: t.taller_nombre,
                type: 'Taller',
                time: t.taller_hora
            }))
        ].sort((a, b) => a.date.getTime() - b.date.getTime());
    };

    return (
        <div className="min-h-screen bg-tmm-white py-12 px-4 sm:px-6 lg:px-8 pt-24">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-tmm-pink/20">

                    <ProfileHeader user={user} onLogout={logout} />

                    <ProfileTabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={(id) => setActiveTab(id as any)}
                    />

                    <div className="p-8 bg-tmm-white/50 min-h-[400px]">
                        {activeTab === 'profile' && (
                            <div className="max-w-3xl mx-auto">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-serif font-bold text-tmm-black">Información Personal</h2>
                                    {!isEditing && (
                                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                                            <PencilSimple className="w-4 h-4 mr-2" />
                                            Editar Perfil
                                        </Button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <ProfileEditForm
                                        user={user}
                                        onCancel={() => setIsEditing(false)}
                                        onSuccess={() => {
                                            setIsEditing(false);
                                            // Ideally trigger a user refresh here
                                            window.location.reload(); // Simple reload to fetch fresh user data
                                        }}
                                    />
                                ) : (
                                    <ProfileInfo user={user} />
                                )}
                            </div>
                        )}

                        {activeTab === 'courses' && (
                            <ProfileEnrollments
                                items={enrollments.cursos}
                                type="courses"
                                onNavigate={navigate}
                                onUploadReceipt={handleUploadReceipt}
                            />
                        )}

                        {activeTab === 'workshops' && (
                            <ProfileEnrollments
                                items={enrollments.talleres}
                                type="workshops"
                                onNavigate={navigate}
                                onUploadReceipt={handleUploadReceipt}
                            />
                        )}

                        {activeTab === 'orders' && (
                            <ProfileOrders
                                orders={orders}
                                onPayOrder={(order) => {
                                    handleUploadReceipt({
                                        ...order,
                                        orden_id: order.id,
                                        id: order.id,
                                    });
                                }}
                            />
                        )}

                        {activeTab === 'calendar' && (
                            <ProfileCalendar events={getCalendarEvents()} />
                        )}

                        {activeTab === 'payments' && (
                            <ProfilePayments
                                items={[...enrollments.cursos, ...enrollments.talleres, ...orders.map(o => ({ ...o, orden_id: o.id }))]}
                                onUploadReceipt={handleUploadReceipt}
                            />
                        )}
                    </div>
                </div>
            </div>

            {selectedEnrollment && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onConfirm={async () => { }}
                    amount={selectedEnrollment.monto_total || 0}
                    itemName={selectedEnrollment.curso_titulo || selectedEnrollment.taller_nombre || `Orden #${selectedEnrollment.orden_id}`}
                    enrollmentId={selectedEnrollment.orden_id ? null : selectedEnrollment.id}
                    orderId={selectedEnrollment.orden_id}
                    itemType={selectedEnrollment.orden_id ? 'order' : (selectedEnrollment.curso_titulo ? 'curso' : 'taller')}
                    onSuccess={fetchEnrollments}
                />
            )}
        </div>
    );
};

export default Profile;
