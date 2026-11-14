import { notFound } from "next/navigation";
import Link from "next/link";
import { Gamepad2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let game: any = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("games").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
    game = data;
  } catch {}
  if (!game) notFound();
  return <main className="container" style={{ paddingTop: 40, maxWidth: 900 }}>
    <Link href="/jogos" className="muted" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 22 }}><ArrowLeft size={16} /> Voltar ao catálogo</Link>
    <div className="panel" style={{ overflow: "hidden" }}>
      <div style={{ height: 280, background: game.cover_url ? "center/cover url("+game.cover_url+")" : "linear-gradient(135deg,#38245f,#11111d)", display: "grid", placeItems: "center" }}>{!game.cover_url && <Gamepad2 size={70} color="#c4b5fd" />}</div>
      <div style={{ padding: "30px clamp(20px,5vw,48px)" }}>
        <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 13 }}>{game.platform}</div>
        <h1 style={{ fontSize: 42, letterSpacing: "-.05em", margin: "8px 0 18px" }}>{game.title}</h1>
        {game.summary && <p className="muted" style={{ fontSize: 17, lineHeight: 1.7 }}>{game.summary}</p>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginTop: 28 }}>
          {game.release_date && <div><small className="muted">Lançamento</small><div>{game.release_date}</div></div>}
          {game.developer && <div><small className="muted">Desenvolvedora</small><div>{game.developer}</div></div>}
          {game.publisher && <div><small className="muted">Publicadora</small><div>{game.publisher}</div></div>}
          {game.genre && <div><small className="muted">Gênero</small><div>{game.genre}</div></div>}
        </div>
        {game.description && <section style={{ borderTop: "1px solid #262638", marginTop: 30, paddingTop: 24 }}><h2>Sobre o jogo</h2><p style={{ lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{game.description}</p></section>}
      </div>
    </div>
  </main>;
}