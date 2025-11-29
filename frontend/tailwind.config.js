/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'cloud-pink': '#efe5e6',
                'sage-gray': '#8b9490',
                'butter-yellow': '#fbfb83',
                'silver-gray': '#bec0bf',
                'charcoal-gray': '#5e6360',
                // Semantic aliases
                primary: '#efe5e6',
                accent: '#fbfb83',
                contrast: '#8b9490',
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
