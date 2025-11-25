import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatBot from './ChatBot';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <ChatBot />
        </div>
    );
};

export default Layout;
