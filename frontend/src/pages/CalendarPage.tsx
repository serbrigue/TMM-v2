import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, type View, type ToolbarProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeft, CaretRight, X, Clock, MapPin } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

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

// Custom Toolbar
const CustomToolbar = (toolbar: ToolbarProps) => {
    const goToBack = () => {
        toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
        toolbar.onNavigate('NEXT');
    };

    const label = () => {
        const date = toolbar.date;
        return (
            <span className="font-serif text-2xl font-bold text-sage-gray capitalize">
                {format(date, 'MMMM yyyy', { locale: es })}
            </span>
        );
    };

    return (
        <div className="mb-8 flex items-center justify-between">
            <div className="flex gap-2">
                <button onClick={goToBack} className="rounded-full p-2 hover:bg-white/50 text-sage-gray transition-colors">
                    <CaretLeft size={24} />
                </button>
                <button onClick={goToNext} className="rounded-full p-2 hover:bg-white/50 text-sage-gray transition-colors">
                    <CaretRight size={24} />
                </button>
            </div>
            <div>{label()}</div>
            <div className="w-[88px]"></div> {/* Spacer for alignment */}
        </div>
    );
};

const CalendarPage = () => {
    const { isAuthenticated } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState<View>('month');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEvents, setSelectedEvents] = useState<any[]>([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Mocking public events if not authenticated or using public endpoint
                // Assuming there's a public endpoint or we use the authenticated one
                // const endpoint = isAuthenticated 
                //     ? 'http://localhost:8000/api/calendar/events/' 
                //     : 'http://localhost:8000/api/public/talleres/'; // Fallback to workshops for demo if not logged in

                // For now, let's assume we fetch workshops and map them to events
                const response = await axios.get('http://localhost:8000/api/public/talleres/');

                const formattedEvents = response.data.map((workshop: any) => {
                    // Parse date and time "2023-11-20" "10:00"
                    const start = new Date(`${workshop.fecha_taller}T${workshop.hora_taller}`);
                    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // Assume 2 hours

                    return {
                        id: workshop.id,
                        title: workshop.nombre,
                        start,
                        end,
                        resource: workshop
                    };
                });

                setEvents(formattedEvents);
            } catch (error) {
                console.error("Error fetching events", error);
            }
        };

        fetchEvents();
    }, [isAuthenticated]);

    const handleSelectSlot = (slotInfo: { start: Date }) => {
        const dateEvents = events.filter(event => isSameDay(event.start, slotInfo.start));
        setSelectedDate(slotInfo.start);
        setSelectedEvents(dateEvents);
        setIsPanelOpen(true);
    };

    const handleSelectEvent = (event: any) => {
        setSelectedDate(event.start);
        setSelectedEvents([event]);
        setIsPanelOpen(true);
    };

    // Custom Event Component for Month View (Dots)
    const CustomEvent = ({ event }: any) => {
        return (
            <div className="flex justify-center">
                <div className="h-2 w-2 rounded-full bg-butter-yellow" title={event.title}></div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-cloud-pink py-12 relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-3xl bg-white/40 p-8 shadow-sm backdrop-blur-sm border border-silver-gray">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 600 }}
                        culture='es'
                        date={date}
                        view={view}
                        onNavigate={setDate}
                        onView={setView}
                        views={['month']}
                        components={{
                            toolbar: CustomToolbar,
                            month: {
                                event: CustomEvent,
                            }
                        }}
                        selectable
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        dayPropGetter={(date) => {
                            const isSelected = selectedDate && isSameDay(date, selectedDate);
                            return {
                                className: isSelected ? '!bg-sage-gray !text-white rounded-full transition-colors' : 'hover:bg-white/50 transition-colors',
                                style: isSelected ? { backgroundColor: '#8b9490', color: 'white', borderRadius: '50%' } : {}
                            };
                        }}
                        eventPropGetter={() => ({
                            style: { backgroundColor: 'transparent', padding: 0 }
                        })}
                    />
                </div>
            </div>

            {/* Off-canvas Panel */}
            <AnimatePresence>
                {isPanelOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPanelOpen(false)}
                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-cloud-pink shadow-2xl border-l border-silver-gray p-8 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="font-serif text-2xl font-bold text-sage-gray">
                                    {selectedDate && format(selectedDate, "d 'de' MMMM", { locale: es })}
                                </h2>
                                <button
                                    onClick={() => setIsPanelOpen(false)}
                                    className="rounded-full p-2 hover:bg-white/50 text-sage-gray transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {selectedEvents.length > 0 ? (
                                <div className="space-y-6">
                                    {selectedEvents.map((event) => (
                                        <div key={event.id} className="rounded-xl bg-white/60 p-6 border border-silver-gray">
                                            <h3 className="mb-2 font-serif text-xl font-bold text-charcoal-gray">{event.title}</h3>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center text-sm text-charcoal-gray/80">
                                                    <Clock className="mr-2 h-4 w-4 text-sage-gray" />
                                                    {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                                                </div>
                                                <div className="flex items-center text-sm text-charcoal-gray/80">
                                                    <MapPin className="mr-2 h-4 w-4 text-sage-gray" />
                                                    {event.resource.modalidad}
                                                </div>
                                            </div>
                                            <p className="text-sm text-charcoal-gray/70 mb-4">{event.resource.descripcion}</p>
                                            <Button size="sm" className="w-full">Inscribirse</Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-sage-gray">No hay actividades programadas para este día.</p>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Global Styles override for Calendar */}
            <style>{`
                .rbc-calendar { font-family: var(--font-sans); }
                .rbc-header { padding: 12px 0; font-weight: 500; color: #acacac; border-bottom: none; }
                .rbc-month-view { border: none; }
                .rbc-day-bg { border-left: none; }
                .rbc-off-range-bg { background: transparent; opacity: 0.3; }
                .rbc-date-cell { text-align: center; padding: 8px; font-weight: 500; }
                .rbc-today { background-color: transparent; }
                .rbc-event { background-color: transparent; }
                .rbc-row-segment { padding: 0 4px; }
            `}</style>
        </div>
    );
};

export default CalendarPage;
