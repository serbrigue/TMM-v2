import { useEffect, useRef } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';
import { useAuth } from '../context/AuthContext';

const ChatBot = () => {
    const { user, isAuthenticated } = useAuth();
    const chatInitialized = useRef(false);
    const chatInstance = useRef<any>(null);

    useEffect(() => {
        // Prevent double initialization
        if (chatInitialized.current) return;

        // Create chat widget
        chatInstance.current = createChat({
            webhookUrl: '/webhook/9b03cb13-3329-4218-931f-62ed2b207313/chat',
            target: '#n8n-chat-container',
            mode: 'window',
            chatInputKey: 'chatInput',
            chatSessionKey: 'sessionId',
            loadPreviousSession: true,
            metadata: {
                isAuthenticated: isAuthenticated.toString(),
                userEmail: user?.email || '',
                userName: user?.first_name || 'Visitante',
                userToken: localStorage.getItem('access_token') || '',
            },
            showWelcomeScreen: false,
            defaultLanguage: 'es' as any,
            initialMessages: [
                'Hola, Soy Carito, tu asistente virtual de TMM. ¿En qué puedo ayudarte hoy?',
            ],
            i18n: {
                es: {
                    title: 'Carito - TMM',
                    subtitle: 'Bienestar y Conexión 💕',
                    footer: 'Conversa con Carito',
                    getStarted: 'Hola, ¿en qué te ayudo hoy?',
                    inputPlaceholder: 'Escribe aquí, querida...',
                    closeButtonTooltip: 'Cerrar chat',
                },
            },
            // Add avatar configuration (if supported by package, otherwise handled by CSS)
            // Note: @n8n/chat might not support avatarUrl directly in root, but we try standard props
            // We will also enforce it via CSS
            enableStreaming: false,
        });

        chatInitialized.current = true;
    }, [user, isAuthenticated]);

    // Inject custom CSS for brand styling using CSS Variables (Standard for n8n chat)
    useEffect(() => {
        const style = document.createElement('style');
        style.id = 'n8n-custom-styles';
        style.innerHTML = `
            :root {
                /* Brand Colors */
                --chat--color--primary: #8b9490; /* Sage Gray */
                --chat--color--primary-shade-50: #7a837f;
                --chat--color--primary--shade-100: #69726e;
                --chat--color--secondary: #fbfb83; /* Butter Yellow */
                --chat--color-secondary-shade-50: #e6e675;
                
                /* UI Colors */
                --chat--color-white: #ffffff;
                --chat--color-light: #efe5e6; /* Cloud Pink Light */
                --chat--color-dark: #333333;
                --chat--color-disabled: #bec0bf; /* Silver Gray */
                --chat--color-typing: #5e6360; /* Charcoal Gray */

                /* Layout & Spacing */
                --chat--spacing: 1rem;
                --chat--border-radius: 1rem;
                --chat--window--width: 400px;
                --chat--window--height: 600px;
                
                /* Header */
                --chat--header--background: linear-gradient(135deg, #8b9490 0%, #bec0bf 100%);
                --chat--header--color: #ffffff;
                
                /* Messages */
                background-position: center;
                border-radius: 50%;
                margin-right: 8px;
                vertical-align: bottom;
            }

            /* Hide default launcher */
            .n8n-chat-widget-launcher-button {
                display: none !important;
            }
            /* Also hide via generic attribute selector just in case */
            button[class*="launcher"] {
                display: none !important;
            }
        `;

        document.head.appendChild(style);

        return () => {
            const existingStyle = document.getElementById('n8n-custom-styles');
            if (existingStyle) {
                existingStyle.remove();
            }
        };
    }, []);

    const toggleChat = () => {
        if (chatInstance.current) {
            // Try using the instance methods if available
            if (typeof chatInstance.current.toggle === 'function') {
                chatInstance.current.toggle();
                return;
            }
            if (typeof chatInstance.current.open === 'function') {
                chatInstance.current.open();
                return;
            }
        }

        // Fallback: DOM manipulation
        const container = document.getElementById('n8n-chat-container');
        let launcherButton: HTMLElement | null = null;

        if (container) {
            // Check for shadow root on container
            if (container.shadowRoot) {
                launcherButton = container.shadowRoot.querySelector('.n8n-chat-widget-launcher-button');
            } else {
                // Check for widget host element
                const host = container.querySelector('.n8n-chat-widget');
                if (host && host.shadowRoot) {
                    launcherButton = host.shadowRoot.querySelector('.n8n-chat-widget-launcher-button');
                } else {
                    // Try finding the button directly in the container or document
                    // The class might be different or it might be an attribute
                    launcherButton =
                        container.querySelector('.n8n-chat-widget-launcher-button') ||
                        container.querySelector('.chat-window-toggle') ||
                        document.querySelector('.n8n-chat-widget-launcher-button') ||
                        document.querySelector('.chat-window-toggle') ||
                        document.querySelector('button[class*="launcher"]');
                }
            }
        }

        if (launcherButton) {
            launcherButton.click();
        } else {
            // Fallback: Manually toggle display if button not found
            const chatWindow = container?.querySelector('.chat-window') as HTMLElement;
            if (chatWindow) {
                if (chatWindow.style.display === 'none') {
                    chatWindow.style.display = 'flex';
                } else {
                    chatWindow.style.display = 'none';
                }
            } else {
                console.warn('Chat launcher button AND chat window not found. Attempting to force show via CSS/Class.');
                console.log('Container innerHTML:', container?.innerHTML);
            }
        }
    };

    return (
        <>
            <div id="n8n-chat-container" />
            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 z-[9999] w-16 h-16 rounded-full shadow-xl hover:scale-110 transition-transform duration-300 focus:outline-none group bg-white"
                aria-label="Abrir chat con Carito"
            >
                <div className="absolute inset-0 rounded-full border-2 border-[#8b9490] animate-pulse"></div>
                <img
                    src="/carito_avatar.jpg"
                    alt="Carito"
                    className="w-full h-full rounded-full object-cover border-2 border-white p-0.5"
                />
                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-white text-gray-800 text-sm rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    ¡Habla con Carito!
                </div>
            </button>
        </>
    );
};

export default ChatBot;
