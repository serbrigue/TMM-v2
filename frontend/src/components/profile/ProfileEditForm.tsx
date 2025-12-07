import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Envelope, Phone, Calendar, MapPin, FloppyDisk, X } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import client from '../../api/client';

interface ProfileEditFormProps {
    user: any;
    onCancel: () => void;
    onSuccess: () => void;
}

interface ProfileFormData {
    first_name: string;
    last_name: string;
    telefono: string;
    fecha_nacimiento: string;
    comuna_vive: string;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user, onCancel, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
        defaultValues: {
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            telefono: user.cliente_perfil?.telefono || '',
            fecha_nacimiento: user.cliente_perfil?.fecha_nacimiento || '',
            comuna_vive: user.cliente_perfil?.comuna_vive || ''
        }
    });

    const onSubmit = async (data: ProfileFormData) => {
        setIsLoading(true);
        try {
            await client.put('/profile/', data);
            // Refresh user context if needed, or just trigger success
            // Ideally we should update the auth context with new user data
            // But for now, let's just trigger success which might reload the page or parent state
            onSuccess();
        } catch (error) {
            console.error("Error updating profile", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-tmm-black/70 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nombre
                    </label>
                    <input
                        {...register('first_name', { required: 'El nombre es requerido' })}
                        className="w-full px-4 py-2 rounded-xl border border-tmm-pink/20 focus:border-tmm-pink focus:ring-2 focus:ring-tmm-pink/20 outline-none transition-all bg-white/50"
                        placeholder="Tu nombre"
                    />
                    {errors.first_name && <span className="text-xs text-red-500">{errors.first_name.message}</span>}
                </div>

                {/* Apellido */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-tmm-black/70 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Apellido
                    </label>
                    <input
                        {...register('last_name', { required: 'El apellido es requerido' })}
                        className="w-full px-4 py-2 rounded-xl border border-tmm-pink/20 focus:border-tmm-pink focus:ring-2 focus:ring-tmm-pink/20 outline-none transition-all bg-white/50"
                        placeholder="Tu apellido"
                    />
                    {errors.last_name && <span className="text-xs text-red-500">{errors.last_name.message}</span>}
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-tmm-black/70 flex items-center gap-2">
                        <Envelope className="w-4 h-4" />
                        Email
                    </label>
                    <input
                        value={user.email}
                        disabled
                        className="w-full px-4 py-2 rounded-xl border border-tmm-black/10 bg-tmm-black/5 text-tmm-black/50 cursor-not-allowed"
                    />
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-tmm-black/70 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Teléfono
                    </label>
                    <input
                        {...register('telefono')}
                        className="w-full px-4 py-2 rounded-xl border border-tmm-pink/20 focus:border-tmm-pink focus:ring-2 focus:ring-tmm-pink/20 outline-none transition-all bg-white/50"
                        placeholder="+56 9 1234 5678"
                    />
                </div>

                {/* Fecha de Nacimiento */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-tmm-black/70 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Fecha de Nacimiento
                    </label>
                    <input
                        type="date"
                        {...register('fecha_nacimiento')}
                        className="w-full px-4 py-2 rounded-xl border border-tmm-pink/20 focus:border-tmm-pink focus:ring-2 focus:ring-tmm-pink/20 outline-none transition-all bg-white/50"
                    />
                </div>

                {/* Comuna */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-tmm-black/70 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Comuna
                    </label>
                    <input
                        {...register('comuna_vive')}
                        className="w-full px-4 py-2 rounded-xl border border-tmm-pink/20 focus:border-tmm-pink focus:ring-2 focus:ring-tmm-pink/20 outline-none transition-all bg-white/50"
                        placeholder="Ej: Providencia"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-tmm-pink/10">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    <FloppyDisk className="w-4 h-4 mr-2" />
                    Guardar Cambios
                </Button>
            </div>
        </form>
    );
};

export default ProfileEditForm;
