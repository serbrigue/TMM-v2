import React from 'react';

interface Event {
    date: Date;
    title: string;
    type: string;
    time: string;
}

interface ProfileCalendarProps {
    events: Event[];
}

const ProfileCalendar: React.FC<ProfileCalendarProps> = ({ events }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4 font-serif text-sage-gray">Próximos Eventos</h3>
            {events.length === 0 ? (
                <p className="text-gray-500">No tienes eventos próximos.</p>
            ) : (
                events.map((event, idx) => (
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

export default ProfileCalendar;
