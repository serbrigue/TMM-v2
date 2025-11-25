/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    pink: '#FF9EAA', // Rosa suave
                    yellow: '#FFF9C4', // Amarillo pastel
                    mint: '#B2DFDB', // Menta suave
                    calypso: '#26C6DA', // Calipso vibrante
                    fuchsia: '#F06292', // Fucsia (acento)
                    intenseYellow: '#FBC02D', // Amarillo intenso (acento)
                    black: '#1A1A1A', // Negro suave
                    white: '#FFFFFF', // Blanco
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
