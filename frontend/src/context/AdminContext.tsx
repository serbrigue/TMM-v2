import React, { createContext, useContext, useState, type ReactNode } from 'react';

type ClientType = 'B2C' | 'B2B' | null;

interface AdminContextType {
    clientType: ClientType;
    setClientType: (type: ClientType) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [clientType, setClientType] = useState<ClientType>('B2C'); // Default to B2C

    return (
        <AdminContext.Provider value={{ clientType, setClientType }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
