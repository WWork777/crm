"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          // Глубокий темный фон с прозрачностью для эффекта стекла
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(12px)",
          color: "#fff",
          // Увеличиваем скругление до 1.5rem для мягкости
          borderRadius: "1.5rem",
          // Тонкая граница, как у карточек на дашборде
          border: "1px solid rgba(255, 255, 255, 0.05)",
          fontSize: "13px",
          fontWeight: "800",
          letterSpacing: "0.025em",
          padding: "12px 20px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
        },
        success: {
          iconTheme: {
            primary: "#818cf8", // Индиго под основной стиль
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#f43f5e", // Яркий розовый для контраста
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
