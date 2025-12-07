import React from 'react';

interface ProfileInfoProps {
    user: {
        first_name: string;
        last_name: string;
        username: string;
        email: string;
    };
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
    const cliente = (user as any).cliente_perfil || {};

    return (
        <div className="max-w-2xl">
            <h3 className="text-lg font-bold mb-6 font-serif text-tmm-black">Información Personal</h3>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-tmm-pink/20 space-y-4">
                <div className="grid grid-cols-3 gap-4 border-b border-tmm-pink/10 pb-4">
                    <span className="text-tmm-black/60">Nombre Completo</span>
                    <span className="col-span-2 font-medium text-tmm-black">{user.first_name} {user.last_name}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b border-tmm-pink/10 pb-4">
                    <span className="text-tmm-black/60">Usuario</span>
                    <span className="col-span-2 font-medium text-tmm-black">{user.username}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b border-tmm-pink/10 pb-4">
                    <span className="text-tmm-black/60">Email</span>
                    <span className="col-span-2 font-medium text-tmm-black">{user.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b border-tmm-pink/10 pb-4">
                    <span className="text-tmm-black/60">Teléfono</span>
                    <span className="col-span-2 font-medium text-tmm-black">{cliente.telefono || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b border-tmm-pink/10 pb-4">
                    <span className="text-tmm-black/60">Fecha Nacimiento</span>
                    <span className="col-span-2 font-medium text-tmm-black">{cliente.fecha_nacimiento || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <span className="text-tmm-black/60">Comuna</span>
                    <span className="col-span-2 font-medium text-tmm-black">{cliente.comuna_vive || '-'}</span>
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
