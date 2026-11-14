import type { Metadata } from "next";
import Link from "next/link";
import { Gamepad2, BookOpen, PlusCircle, ShieldCheck } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Universal Games Wiki",
  description: "Uma enciclopédia colaborativa de jogos de todas as plataformas e gerações."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <header style={{ borderBottom: "1px solid #262638", background: "#0c0c14ee", position: "sticky", top: 0, zIndex: 20, backdropFilter: "blur(16px)" }}>
          <div className="container" style={{ height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 900, letterSpacing: "-.04em", fontSize: 18 }}>
              <span style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 12, background: "linear-gradient(135deg,#8b5cf6,#4f46e5)", boxShadow: "0 6px 22px #6d28d944" }}><Gamepad2 size={22} /></span>
              <span>UNIVERSAL <span style={{ color: "#a78bfa" }}>GAMES</span> WIKI</span>
            </Link>
            <nav style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14 }} className="muted">
              <Link href="/jogos"><BookOpen size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />Jogos</Link>
              <Link href="/contribuir"><PlusCircle size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />Contribuir</Link>
              <Link href="/admin"><ShieldCheck size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />Moderação</Link>
              <Link href="/entrar" className="btn btn-secondary" style={{ padding: "8px 13px" }}>Entrar</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer style={{ borderTop: "1px solid #262638", marginTop: 90, padding: "28px 0", color: "#85859b", fontSize: 13 }}>
          <div className="container" style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <span>© {new Date().getFullYear()} Universal Games Wiki</span>
            <span>Uma comunidade. Todas as gerações. Todos os jogos.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}