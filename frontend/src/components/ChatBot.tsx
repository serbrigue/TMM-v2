import { useEffect, useRef } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';
import { useAuth } from '../context/AuthContext';

const ChatBot = () => {
    const { user, isAuthenticated, loading } = useAuth();
    const chatInstance = useRef<any>(null);

    useEffect(() => {
        // Wait for auth to finish loading so we have the correct user data
        if (loading) return;

        // Cleanup existing chat before creating a new one (important for re-initialization on login)
        const container = document.getElementById('n8n-chat-container');
        if (container) {
            container.innerHTML = '';
        }

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

        // Cleanup function when component unmounts or dependencies change
        return () => {
            if (container) {
                container.innerHTML = '';
            }
        };
    }, [user, isAuthenticated, loading]);

    // Inject custom CSS for brand styling using CSS Variables (Standard for n8n chat)
    useEffect(() => {
        const style = document.createElement('style');
        style.id = 'n8n-custom-styles';
        style.innerHTML = `
            :root {
                /* Brand Colors */
                --chat--color--primary: #F2D0DD; /* TMM Pink */
                --chat--color--primary-shade-50: #eec0d0;
                --chat--color--primary--shade-100: #eab0c3;
                --chat--color--secondary: #C9F2DF; /* TMM Green */
                --chat--color-secondary-shade-50: #b0e6cd;
                
                /* UI Colors */
                --chat--color-white: #F2F2F2; /* TMM White */
                --chat--color-light: #fdf5f8; /* TMM Pink Light */
                --chat--color-dark: #0D0D0D; /* TMM Black */
                --chat--color-disabled: #d1d1d1;
                --chat--color-typing: #0D0D0D;

                /* Message Colors */
                --chat--message--user--color: #0D0D0D;
                --chat--message--user--text-color: #0D0D0D;
                --chat--message--bot--color: #0D0D0D;

                /* Layout & Spacing */
                --chat--spacing: 1rem;
                --chat--border-radius: 1rem;
                --chat--window--width: 400px;
                --chat--window--height: 600px;
                
                /* Header */
                --chat--header--background: linear-gradient(135deg, #F2D0DD 0%, #C9F2DF 100%);
                --chat--header--color: #0D0D0D;
                
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
            
            /* Clean Text Colors */
            .chat-message-text {
                color: #0D0D0D !important;
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
                className="fixed bottom-6 right-6 z-[9999] w-16 h-16 rounded-full shadow-xl hover:scale-110 transition-transform duration-300 focus:outline-none group bg-tmm-white"
                aria-label="Abrir chat con Carito"
            >
                <div className="absolute inset-0 rounded-full border-2 border-tmm-pink animate-pulse"></div>
                <img
                    src="/carito_avatar.jpg"
                    alt="Carito"
                    className="w-full h-full rounded-full object-cover border-2 border-tmm-white p-0.5"
                />
                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-tmm-white text-tmm-black text-sm rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-tmm-pink/20">
                    ¡Habla con Carito!
                </div>
            </button>
        </>
    );
};

export default ChatBot;
