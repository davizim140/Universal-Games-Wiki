import type { Metadata } from "next";
import Link from "next/link";
import { Gamepad2, BookOpen, PlusCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import "./globals.css";

export const metadata: Metadata = {
  title: "Universal Games Wiki",
  description: "Uma enciclopédia colaborativa de jogos de todas as plataformas e gerações."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null = null;
  let username = "";
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
      const metadataName = typeof user.user_metadata?.username === "string" ? user.user_metadata.username : "";
      username = profile?.username || metadataName || user.email?.split("@")[0] || "Minha conta";
    }
  } catch {}

  return (
    <html lang="pt-BR">
      <body>
        <header style={{ borderBottom: "1px solid #262638", background: "#0c0c14ee", position: "sticky", top: 0, zIndex: 20, backdropFilter: "blur(16px)" }}>
          <div className="container" style={{ minHeight: 72, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 900, letterSpacing: "-.04em", fontSize: 18 }}>
              <span style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 12, background: "linear-gradient(135deg,#8b5cf6,#4f46e5)", boxShadow: "0 6px 22px #6d28d944" }}><Gamepad2 size={22} /></span>
              <span>UNIVERSAL <span style={{ color: "#a78bfa" }}>GAMES</span> WIKI</span>
            </Link>
            <nav style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14, flexWrap: "wrap", justifyContent: "flex-end" }} className="muted">
              <Link href="/jogos"><BookOpen size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />Jogos</Link>
              <Link href="/contribuir"><PlusCircle size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />Contribuir</Link>
              <Link href="/admin"><ShieldCheck size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />Moderação</Link>
              {user ? (
                <>
                  <span style={{ color: "#c4b5fd", fontWeight: 700 }}>Olá, {username}</span>
                  <form action={signOut}><button className="btn btn-secondary" type="submit" style={{ padding: "8px 13px" }}>Sair</button></form>
                </>
              ) : <Link href="/entrar" className="btn btn-secondary" style={{ padding: "8px 13px" }}>Entrar</Link>}
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