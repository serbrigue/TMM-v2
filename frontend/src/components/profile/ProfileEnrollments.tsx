import React from 'react';
import { PlayCircle, Calendar as CalendarIcon, MapPin, CheckCircle, Clock, XCircle, Upload } from 'lucide-react';
import { Button } from '../ui/Button';

interface Enrollment {
    id: number;
    // Common fields
    estado_pago: string;
    // Course fields
    curso?: { id: number };
    curso_titulo?: string;
    curso_imagen?: string;
    curso_duracion?: string;
    progreso?: number;
    // Workshop fields
    taller_nombre?: string;
    taller_fecha?: string;
    taller_hora?: string;
}

interface ProfileEnrollmentsProps {
    items: Enrollment[];
    type: 'courses' | 'workshops';
    onNavigate: (path: string) => void;
    onUploadReceipt: (item: Enrollment) => void;
}

const ProfileEnrollments: React.FC<ProfileEnrollmentsProps> = ({ items, type, onNavigate, onUploadReceipt }) => {
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'PAGADO':
            case 'APROBADO':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Activo</span>;
            case 'PENDIENTE':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3" /> Pendiente Pago</span>;
            case 'RECHAZADO':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Rechazado</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Desconocido</span>;
        }
    };

    if (items.length === 0) {
        return (
            <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                {type === 'courses' ? (
                    <>
                        <PlayCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No estás inscrito en ningún curso aún.</p>
                        <Button onClick={() => onNavigate('/courses')}>Explorar Cursos</Button>
                    </>
                ) : (
                    <>
                        <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No estás inscrito en ningún taller aún.</p>
                        <Button onClick={() => onNavigate('/workshops')}>Ver Talleres</Button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {items.map((item) => (
                <div
                    key={item.id}
                    className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow group ${type === 'workshops' ? 'border-l-4 border-l-brand-calypso' : ''}`}
                >
                    {type === 'courses' && (
                        <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                            {item.curso_imagen && <img src={item.curso_imagen} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                        </div>
                    )}

                    <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-sage-gray line-clamp-1">
                                {type === 'courses' ? item.curso_titulo : item.taller_nombre}
                            </h4>
                            {renderStatusBadge(item.estado_pago)}
                        </div>

                        {type === 'courses' ? (
                            <>
                                <p className="text-sm text-gray-500 mb-auto">{item.curso_duracion}</p>
                                {(item.estado_pago === 'PAGADO' || item.estado_pago === 'APROBADO') ? (
                                    <div className="mt-3">
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                                            <div className="bg-brand-calypso h-1.5 rounded-full" style={{ width: `${item.progreso}%` }}></div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500">{item.progreso}% completado</span>
                                            <button
                                                onClick={() => item.curso && onNavigate(`/courses/${item.curso.id}/view`)}
                                                className="text-sm font-bold text-brand-calypso hover:underline flex items-center gap-1"
                                            >
                                                <PlayCircle className="w-4 h-4" /> Continuar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-3">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => onUploadReceipt(item)}
                                        >
                                            Subir Comprobante
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-brand-calypso" />
                                        {item.taller_fecha} • {item.taller_hora}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-brand-calypso" />
                                        Presencial
                                    </div>
                                </div>
                                {item.estado_pago === 'PENDIENTE' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => onUploadReceipt(item)}
                                    >
                                        Subir Comprobante
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProfileEnrollments;
