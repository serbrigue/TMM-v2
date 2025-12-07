import React from 'react';
import { LogOut } from 'lucide-react';

interface ProfileHeaderProps {
    user: {
        first_name: string;
        last_name: string;
        email: string;
    };
    onLogout: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onLogout }) => {
    return (
        <div className="bg-tmm-pink/30 p-8 text-tmm-black flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-tmm-yellow rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-tmm-green rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2"></div>

            <div className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 bg-white text-tmm-black rounded-full flex items-center justify-center text-3xl font-bold shadow-md border-2 border-white">
                    {user.first_name[0]}
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-serif font-bold text-tmm-black">{user.first_name} {user.last_name}</h1>
                    <p className="text-tmm-black/70 font-medium">{user.email}</p>
                </div>
            </div>
            <button
                onClick={onLogout}
                className="relative z-10 flex items-center gap-2 px-4 py-2 bg-white/50 text-tmm-black rounded-lg hover:bg-white/80 transition-colors backdrop-blur-sm shadow-sm border border-white/20"
            >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
            </button>
        </div>
    );
};

export default ProfileHeader;
