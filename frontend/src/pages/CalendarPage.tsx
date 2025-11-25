import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const locales = {
    'es': es,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const CalendarPage = () => {
    const { isAuthenticated } = useAuth();
    const [events, setEvents] = useState([]);
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState<any>('month');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await axios.get('http://localhost:8000/api/calendar/events/', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const formattedEvents = response.data.map((event: any) => ({
                    ...event,
                    start: new Date(event.start),
                    end: new Date(event.end),
                }));

                setEvents(formattedEvents);
            } catch (error) {
                console.error("Error fetching events", error);
            }
        };

        if (isAuthenticated) {
            fetchEvents();
        }
    }, [isAuthenticated]);

    const onNavigate = (newDate: Date) => {
        setDate(newDate);
    };

    const onView = (newView: any) => {
        setView(newView);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">Calendario de Actividades</h1>
                <div className="bg-white p-6 rounded-2xl shadow-sm h-[600px]">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 500 }}
                        culture='es'
                        date={date}
                        view={view}
                        onNavigate={onNavigate}
                        onView={onView}
                        views={['month', 'week', 'day', 'agenda']}
                        messages={{
                            next: "Siguiente",
                            previous: "Anterior",
                            today: "Hoy",
                            month: "Mes",
                            week: "Semana",
                            day: "Día",
                            agenda: "Agenda",
                            date: "Fecha",
                            time: "Hora",
                            event: "Evento",
                            noEventsInRange: "No hay eventos en este rango."
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
