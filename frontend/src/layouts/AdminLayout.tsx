import React from 'react';
import AdminNavbar from '../components/AdminNavbar';
import { AdminProvider } from '../context/AdminContext';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <AdminProvider>
            <div className="min-h-screen bg-gray-100 flex">
                <AdminNavbar />
                <main className="flex-1 ml-64 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </AdminProvider>
    );
};

export default AdminLayout;
