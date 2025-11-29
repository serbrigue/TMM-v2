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

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'workshops' | 'calendar' | 'payments'>('profile');
    const [enrollments, setEnrollments] = useState<{ cursos: any[], talleres: any[] }>({ cursos: [], talleres: [] });
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['profile', 'courses', 'workshops', 'calendar', 'payments'].includes(tab)) {
            setActiveTab(tab as any);
        }
    }, [location]);

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const response = await client.get('/my-enrollments/');
                setEnrollments(response.data);
            } catch (error) {
                console.error("Error fetching enrollments", error);
            }
        };
        fetchEnrollments();
    }, []);

    if (!user) return <div className="p-10 text-center">Cargando perfil...</div>;

    const handleUploadReceipt = (enrollment: any) => {
        setSelectedEnrollment(enrollment);
        setIsPaymentModalOpen(true);
    };

    const tabs = [
        { id: 'profile', label: 'Mis Datos' },
        { id: 'courses', label: `Mis Cursos (${enrollments.cursos.length})` },
        { id: 'workshops', label: `Mis Talleres (${enrollments.talleres.length})` },
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
        <div className="min-h-screen bg-cloud-pink py-12 px-4 sm:px-6 lg:px-8 pt-24">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-silver-gray">

                    <ProfileHeader user={user} onLogout={logout} />

                    <ProfileTabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={(id) => setActiveTab(id as any)}
                    />

                    <div className="p-8 bg-gray-50/50 min-h-[400px]">
                        {activeTab === 'profile' && <ProfileInfo user={user} />}

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

                        {activeTab === 'calendar' && (
                            <ProfileCalendar events={getCalendarEvents()} />
                        )}

                        {activeTab === 'payments' && (
                            <ProfilePayments
                                items={[...enrollments.cursos, ...enrollments.talleres]}
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
                    amount={0}
                    itemName={selectedEnrollment.curso_titulo || selectedEnrollment.taller_nombre}
                    enrollmentId={selectedEnrollment.id}
                    itemType={selectedEnrollment.curso_titulo ? 'curso' : 'taller'}
                />
            )}
        </div>
    );
};

export default Profile;
