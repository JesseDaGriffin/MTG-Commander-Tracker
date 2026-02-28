/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
    ],
    theme: {
        extend: {
            backgroundColor: {
                primary: "#090e17",
                secondary: "#111b2d",
                tertiary: "#1a2a47",
            },
            textColor: {
                primary: "#f0f8ff",
                secondary: "#94a3b8",
                muted: "#64748b",
            },
            borderColor: {
                DEFAULT: "#1e2e4f",
                color: "#1e2e4f",
            },
            colors: {
                accent: {
                    primary: "#0ea5e9",
                    hover: "#0284c7",
                },
                mtg: {
                    white: "#f0e6d2",
                    blue: "#0ea5e9",
                    black: "#cac5c0",
                    red: "#fabea6",
                    green: "#c4d3ca",
                },
            },
            boxShadow: {
                glow: "0 0 15px -3px rgba(14, 165, 233, 0.4)",
            },
            borderRadius: {
                sm: "0.375rem",
                md: "0.5rem",
                lg: "0.75rem",
                xl: "1rem",
            },
        },
    },
    plugins: [],
};
