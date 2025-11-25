import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LogOut, Calendar as CalendarIcon, MapPin, PlayCircle } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'workshops' | 'calendar'>('profile');
    const [enrollments, setEnrollments] = useState<{ cursos: any[], talleres: any[] }>({ cursos: [], talleres: [] });

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await axios.get('http://localhost:8000/api/my-enrollments/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEnrollments(response.data);
            } catch (error) {
                console.error("Error fetching enrollments", error);
            }
        };
        fetchEnrollments();
    }, []);

    if (!user) return <div className="p-10 text-center">Cargando perfil...</div>;

    const renderCalendar = () => {
        // Simple list view for now, can be enhanced to a grid calendar
        const allEvents = [
            ...enrollments.talleres.map(t => ({
                date: new Date(t.taller_fecha),
                title: t.taller_nombre,
                type: 'Taller',
                time: t.taller_hora
            }))
        ].sort((a, b) => a.date.getTime() - b.date.getTime());

        return (
            <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">Próximos Eventos</h3>
                {allEvents.length === 0 ? (
                    <p className="text-gray-500">No tienes eventos próximos.</p>
                ) : (
                    allEvents.map((event, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <div className="bg-brand-calypso/10 text-brand-calypso p-3 rounded-lg text-center min-w-[60px]">
                                <div className="text-xs font-bold uppercase">{event.date.toLocaleString('es-CL', { month: 'short' })}</div>
                                <div className="text-xl font-bold">{event.date.getDate()}</div>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{event.title}</h4>
                                <p className="text-sm text-gray-500">{event.type} • {event.time}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-brand-calypso rounded-full flex items-center justify-center text-2xl font-bold">
                                {user.first_name[0]}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{user.first_name} {user.last_name}</h1>
                                <p className="text-gray-400">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'profile' ? 'border-b-2 border-brand-calypso text-brand-calypso' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Mis Datos
                        </button>
                        <button
                            onClick={() => setActiveTab('courses')}
                            className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'courses' ? 'border-b-2 border-brand-calypso text-brand-calypso' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Mis Cursos ({enrollments.cursos.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('workshops')}
                            className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'workshops' ? 'border-b-2 border-brand-calypso text-brand-calypso' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Mis Talleres ({enrollments.talleres.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'calendar' ? 'border-b-2 border-brand-calypso text-brand-calypso' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Calendario
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 bg-gray-50 min-h-[400px]">
                        {activeTab === 'profile' && (
                            <div className="max-w-2xl">
                                <h3 className="text-lg font-bold mb-6">Información Personal</h3>
                                <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                                    <div className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                                        <span className="text-gray-500">Nombre Completo</span>
                                        <span className="col-span-2 font-medium">{user.first_name} {user.last_name}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                                        <span className="text-gray-500">Usuario</span>
                                        <span className="col-span-2 font-medium">{user.username}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <span className="text-gray-500">Email</span>
                                        <span className="col-span-2 font-medium">{user.email}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'courses' && (
                            <div className="grid md:grid-cols-2 gap-6">
                                {enrollments.cursos.length === 0 ? (
                                    <p className="text-gray-500 col-span-2 text-center py-10">No estás inscrito en ningún curso aún.</p>
                                ) : (
                                    enrollments.cursos.map((enrollment: any) => (
                                        <div
                                            key={enrollment.id}
                                            onClick={() => navigate(`/courses/${enrollment.curso.id}/view`)}
                                            className="bg-white p-4 rounded-xl shadow-sm flex gap-4 cursor-pointer hover:shadow-md transition-shadow"
                                        >
                                            <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                                {enrollment.curso_imagen && <img src={enrollment.curso_imagen} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 mb-1">{enrollment.curso_titulo}</h4>
                                                <p className="text-sm text-gray-500 mb-3">{enrollment.curso_duracion}</p>
                                                <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                                                    <div className="bg-brand-calypso h-2 rounded-full" style={{ width: `${enrollment.progreso}%` }}></div>
                                                </div>
                                                <span className="text-xs text-gray-500">{enrollment.progreso}% completado</span>
                                            </div>
                                            <div className="flex items-center">
                                                <PlayCircle className="w-8 h-8 text-brand-calypso" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'workshops' && (
                            <div className="grid md:grid-cols-2 gap-6">
                                {enrollments.talleres.length === 0 ? (
                                    <p className="text-gray-500 col-span-2 text-center py-10">No estás inscrito en ningún taller aún.</p>
                                ) : (
                                    enrollments.talleres.map((enrollment: any) => (
                                        <div key={enrollment.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-brand-calypso">
                                            <h4 className="font-bold text-gray-900 mb-2">{enrollment.taller_nombre}</h4>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    {enrollment.taller_fecha} • {enrollment.taller_hora}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    Presencial
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'calendar' && renderCalendar()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
