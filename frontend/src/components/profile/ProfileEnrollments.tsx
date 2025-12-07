import React from 'react';
import { PlayCircle, Calendar as CalendarIcon, MapPin, CheckCircle, Clock, XCircle } from 'lucide-react';
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
    transacciones?: any[];
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
            case 'ABONADO':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-tmm-green/20 text-tmm-black"><CheckCircle className="w-3 h-3" /> Activo</span>;
            case 'PENDIENTE':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-tmm-yellow/20 text-tmm-black"><Clock className="w-3 h-3" /> Pendiente Pago</span>;
            case 'RECHAZADO':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Rechazado</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-tmm-black/5 text-tmm-black">Desconocido</span>;
        }
    };

    if (items.length === 0) {
        return (
            <div className="col-span-2 text-center py-16 bg-tmm-white rounded-2xl border border-dashed border-tmm-pink/20">
                {type === 'courses' ? (
                    <>
                        <PlayCircle className="w-12 h-12 text-tmm-black/20 mx-auto mb-4" />
                        <p className="text-tmm-black/60 mb-4">No estás inscrito en ningún curso aún.</p>
                        <Button onClick={() => onNavigate('/cursos')}>Explorar Cursos</Button>
                    </>
                ) : (
                    <>
                        <CalendarIcon className="w-12 h-12 text-tmm-black/20 mx-auto mb-4" />
                        <p className="text-tmm-black/60 mb-4">No estás inscrito en ningún taller aún.</p>
                        <Button onClick={() => onNavigate('/workshops')}>Ver Talleres</Button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {items.map((item) => {
                // Check if there is a pending transaction
                const hasPendingReceipt = item.transacciones?.some((t: any) => t.estado === 'PENDIENTE');

                return (
                    <div
                        key={item.id}
                        className={`bg-tmm-white p-4 rounded-2xl shadow-sm border border-tmm-pink/20 flex gap-4 hover:shadow-md transition-shadow group ${type === 'workshops' ? 'border-l-4 border-l-tmm-green' : ''}`}
                    >
                        {type === 'courses' && (
                            <div className="w-24 h-24 bg-tmm-black/5 rounded-xl flex-shrink-0 overflow-hidden">
                                {item.curso_imagen && <img src={item.curso_imagen} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                            </div>
                        )}

                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-tmm-black line-clamp-1">
                                    {type === 'courses' ? item.curso_titulo : item.taller_nombre}
                                </h4>
                                {renderStatusBadge(item.estado_pago)}
                            </div>

                            {type === 'courses' ? (
                                <>
                                    <p className="text-sm text-tmm-black/60 mb-auto">{item.curso_duracion}</p>
                                    {(item.estado_pago === 'PAGADO' || item.estado_pago === 'APROBADO' || item.estado_pago === 'ABONADO') ? (
                                        <div className="mt-3">
                                            <div className="w-full bg-tmm-black/5 rounded-full h-1.5 mb-2">
                                                <div className="bg-tmm-green h-1.5 rounded-full" style={{ width: `${item.progreso}%` }}></div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-tmm-black/60">{item.progreso}% completado</span>
                                                <button
                                                    onClick={() => item.curso && onNavigate(`/cursos/${item.curso.id}/view`)}
                                                    className="text-sm font-bold text-tmm-pink hover:underline flex items-center gap-1"
                                                >
                                                    <PlayCircle className="w-4 h-4" /> Continuar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-3">
                                            <Button
                                                size="sm"
                                                variant={hasPendingReceipt ? "ghost" : "outline"}
                                                className={`w-full ${hasPendingReceipt ? 'cursor-not-allowed opacity-70' : ''}`}
                                                onClick={() => !hasPendingReceipt && onUploadReceipt(item)}
                                                disabled={hasPendingReceipt}
                                            >
                                                {hasPendingReceipt ? (
                                                    <>
                                                        <Clock className="w-4 h-4 mr-2" />
                                                        Comprobante Enviado
                                                    </>
                                                ) : (
                                                    "Subir Comprobante"
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2 text-sm text-tmm-black/60 mb-4">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-tmm-pink" />
                                            {item.taller_fecha} • {item.taller_hora}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-tmm-pink" />
                                            Presencial
                                        </div>
                                    </div>
                                    {item.estado_pago === 'PENDIENTE' && (
                                        <Button
                                            size="sm"
                                            variant={hasPendingReceipt ? "ghost" : "outline"}
                                            className={`w-full ${hasPendingReceipt ? 'cursor-not-allowed opacity-70' : ''}`}
                                            onClick={() => !hasPendingReceipt && onUploadReceipt(item)}
                                            disabled={hasPendingReceipt}
                                        >
                                            {hasPendingReceipt ? (
                                                <>
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    Comprobante Enviado
                                                </>
                                            ) : (
                                                "Subir Comprobante"
                                            )}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ProfileEnrollments;
