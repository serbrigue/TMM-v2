import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Search, CheckCircle } from 'lucide-react';

const AdminMessages = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('http://localhost:8000/api/admin/mensajes/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching messages", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const filteredMessages = messages.filter(msg =>
        msg.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Mensajes de Contacto</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por asunto, email o nombre..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-calypso/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {filteredMessages.map((msg) => (
                        <div key={msg.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-brand-pink/20 flex items-center justify-center text-brand-fuchsia">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{msg.asunto}</h3>
                                        <p className="text-sm text-gray-500">{msg.nombre} {msg.apellido} &lt;{msg.email}&gt;</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(msg.fecha_envio).toLocaleString()}
                                </span>
                            </div>
                            <div className="pl-13 ml-13 mt-4">
                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    {msg.mensaje}
                                </p>
                            </div>
                        </div>
                    ))}

                    {filteredMessages.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            No hay mensajes para mostrar.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessages;
