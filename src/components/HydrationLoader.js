"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function HydrationLoader() {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Roda APENAS no initial load / refresh completo
    setLoading(true);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1200); // tempo suficiente para NextJs carregar CSS

    return () => clearTimeout(timeout);
  }, []); // <-- Array vazio garante que só roda uma vez!

  if (!loading) return null;

  return (
    <div className="global-loader-overlay" style={{ zIndex: 999999 }}>
      <div className="loader-content">
        <img src="/icone.png" alt="Carregando..." className="loader-logo" />
        <div className="dots-container">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  );
}
