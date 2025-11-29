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
        <div className="bg-sage-gray p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-butter-yellow text-sage-gray rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
                    {user.first_name[0]}
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-serif font-bold">{user.first_name} {user.last_name}</h1>
                    <p className="text-white/60">{user.email}</p>
                </div>
            </div>
            <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
            </button>
        </div>
    );
};

export default ProfileHeader;
