/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'tmm-pink': '#F2D0DD',
                'tmm-green': '#C9F2DF',
                'tmm-yellow': '#EEF27E',
                'tmm-white': '#F2F2F2',
                'tmm-black': '#0D0D0D',
                // Glassmorphism
                'glass-white': 'rgba(255, 255, 255, 0.7)',
                'glass-dark': 'rgba(13, 13, 13, 0.7)',
                // Semantic aliases
                primary: '#F2D0DD',
                secondary: '#C9F2DF',
                accent: '#EEF27E',
                background: '#F2F2F2',
                text: '#0D0D0D',
            },
            fontFamily: {
                serif: ['"Cormorant Garamond"', '"Playfair Display"', 'serif'],
                sans: ['"Plus Jakarta Sans"', 'Lato', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '12px',
                'lg': '12px',
                'md': '8px',
                'sm': '4px',
            },
            keyframes: {
                blob: {
                    "0%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                    "33%": {
                        transform: "translate(30px, -50px) scale(1.1)",
                    },
                    "66%": {
                        transform: "translate(-20px, 20px) scale(0.9)",
                    },
                    "100%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                },
                "fade-in-up": {
                    "0%": {
                        opacity: "0",
                        transform: "translateY(20px)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateY(0)",
                    },
                },
            },
            animation: {
                blob: "blob 7s infinite",
                "fade-in-up": "fade-in-up 0.5s ease-out forwards",
            },
        },
    },
    plugins: [],
}
