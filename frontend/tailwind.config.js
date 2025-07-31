/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class", // ✅ ダークモードは .dark クラスで切り替え
    content: [
      "./index.html",            // Vite のルート HTML
      "./src/**/*.{js,ts,jsx,tsx}", // ソース内のすべてのJS/TS/JSX/TSXファイル
    ],
    theme: {
      extend: {
        // カスタムテーマ（必要に応じて追加）
        colors: {
          primary: {
            light: "#c7d2fe",
            DEFAULT: "#6366f1",
            dark: "#4f46e5",
          },
        },
      },
    },
    plugins: [],
  };
  