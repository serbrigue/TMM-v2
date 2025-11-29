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
    return (
        <div className="max-w-2xl">
            <h3 className="text-lg font-bold mb-6 font-serif text-sage-gray">Información Personal</h3>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="grid grid-cols-3 gap-4 border-b border-gray-50 pb-4">
                    <span className="text-gray-500">Nombre Completo</span>
                    <span className="col-span-2 font-medium text-charcoal-gray">{user.first_name} {user.last_name}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b border-gray-50 pb-4">
                    <span className="text-gray-500">Usuario</span>
                    <span className="col-span-2 font-medium text-charcoal-gray">{user.username}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <span className="text-gray-500">Email</span>
                    <span className="col-span-2 font-medium text-charcoal-gray">{user.email}</span>
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
