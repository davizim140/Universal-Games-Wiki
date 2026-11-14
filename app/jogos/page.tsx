import Link from "next/link";
import { Search, Gamepad2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function JogosPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  let games: any[] = [];
  let error = "";
  try {
    const supabase = await createClient();
    let query = supabase.from("games").select("id,title,slug,platform,cover_url,summary").eq("status", "published").order("title");
    if (q.trim()) query = query.or("title.ilike.%"+q.trim()+"%,platform.ilike.%"+q.trim()+"%");
    const result = await query;
    games = result.data ?? [];
    if (result.error) error = result.error.message;
  } catch { error = "Configure o Supabase para carregar o catálogo."; }
  return <main className="container" style={{ paddingTop: 55 }}>
    <div style={{ marginBottom: 28 }}><div style={{ color: "#a78bfa", fontSize: 12, fontWeight: 800, letterSpacing: ".13em" }}>CATÁLOGO</div><h1 style={{ fontSize: 40, letterSpacing: "-.05em", margin: "8px 0" }}>Todos os jogos</h1><p className="muted">Explore títulos de todas as plataformas e épocas.</p></div>
    <form style={{ display: "flex", gap: 9, maxWidth: 600, marginBottom: 28 }}><input className="field" name="q" defaultValue={q} placeholder="Nome do jogo ou plataforma..." /><button className="btn"><Search size={17} /> Buscar</button></form>
    {error && <p className="muted">{error}</p>}
    {games.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
      {games.map(g => <Link key={g.id} href={"/jogos/"+g.slug} className="panel" style={{ overflow: "hidden" }}><div style={{ height: 135, background: g.cover_url ? "center/cover url("+g.cover_url+")" : "linear-gradient(135deg,#30224d,#151525)", display: "grid", placeItems: "center" }}>{!g.cover_url && <Gamepad2 size={38} color="#a78bfa" />}</div><div style={{ padding: 16 }}><small style={{ color: "#a78bfa" }}>{g.platform}</small><h3 style={{ margin: "7px 0" }}>{g.title}</h3><p className="muted" style={{ fontSize: 13 }}>{g.summary}</p></div></Link>)}
    </div> : <div className="panel" style={{ padding: 32, textAlign: "center" }}><Gamepad2 color="#a78bfa" size={35} /><h3>Nenhum jogo publicado ainda</h3><p className="muted">Tente outra busca ou envie a primeira contribuição.</p><Link href="/contribuir" className="btn">Sugerir um jogo</Link></div>}
  </main>;
}