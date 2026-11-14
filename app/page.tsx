import Link from "next/link";
import { Search, Gamepad2, Globe2, Users, ArrowRight, PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  let games: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("games").select("id,title,slug,platform,cover_url,summary").eq("status", "published").order("created_at", { ascending: false }).limit(6);
    games = data ?? [];
  } catch {}
  return (
    <main>
      <section style={{ background: "radial-gradient(ellipse at 50% 0%,#39206b66,transparent 58%)", padding: "92px 0 76px" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", gap: 8, alignItems: "center", border: "1px solid #51358a", color: "#c4b5fd", background: "#8b5cf61a", padding: "7px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, marginBottom: 24 }}><Globe2 size={14} /> A ENCICLOPÉDIA DEFINITIVA DOS JOGOS</div>
          <h1 style={{ fontSize: "clamp(38px,7vw,76px)", lineHeight: 1.02, letterSpacing: "-.06em", maxWidth: 850, margin: "0 auto 22px", fontWeight: 900 }}>Todo jogo tem uma <span style={{ color: "#a78bfa" }}>história.</span><br />Encontre a sua.</h1>
          <p className="muted" style={{ fontSize: 18, maxWidth: 640, margin: "0 auto 34px", lineHeight: 1.7 }}>Um wiki colaborativo para descobrir, explorar e documentar jogos de todas as plataformas e gerações.</p>
          <form action="/jogos" style={{ display: "flex", maxWidth: 620, margin: "0 auto", gap: 8, background: "#12121c", padding: 7, border: "1px solid #343449", borderRadius: 14 }}>
            <Search color="#a1a1b5" style={{ margin: "auto 5px auto 9px", flexShrink: 0 }} />
            <input name="q" placeholder="Buscar jogos, franquias ou plataformas..." aria-label="Buscar jogos" style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: 0, color: "white", padding: 10 }} />
            <button className="btn" type="submit">Buscar</button>
          </form>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
            <Link href="/jogos" className="btn btn-secondary">Explorar jogos <ArrowRight size={16} /></Link>
            <Link href="/contribuir" className="btn"><PlusCircle size={16} /> Contribuir</Link>
          </div>
        </div>
      </section>
      <section className="container" style={{ paddingTop: 35 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 22, gap: 15 }}>
          <div><div style={{ color: "#a78bfa", fontSize: 12, fontWeight: 800, letterSpacing: ".13em" }}>EXPLORE</div><h2 style={{ fontSize: 28, margin: "8px 0 0", letterSpacing: "-.04em" }}>Jogos em destaque</h2></div>
          <Link href="/jogos" className="muted" style={{ fontSize: 14 }}>Ver todos <ArrowRight size={14} style={{ display: "inline" }} /></Link>
        </div>
        {games.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 16 }}>
          {games.map(game => <Link key={game.id} href={"/jogos/" + game.slug} className="panel" style={{ overflow: "hidden" }}>
            <div style={{ height: 145, background: game.cover_url ? "center/cover url(" + game.cover_url + ")" : "linear-gradient(135deg,#282044,#151525)", display: "grid", placeItems: "center" }}>{!game.cover_url && <Gamepad2 size={42} color="#a78bfa" />}</div>
            <div style={{ padding: 17 }}><div style={{ color: "#a78bfa", fontSize: 12, marginBottom: 7 }}>{game.platform}</div><h3 style={{ margin: "0 0 8px" }}>{game.title}</h3><p className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>{game.summary}</p></div>
          </Link>)}
        </div> : <div className="panel" style={{ padding: 35, textAlign: "center" }}><Gamepad2 size={34} color="#a78bfa" /><h3 style={{ marginBottom: 8 }}>O wiki está começando</h3><p className="muted" style={{ margin: "0 auto 18px", maxWidth: 480 }}>Os primeiros jogos aparecerão aqui depois que o banco de dados for configurado e as contribuições forem aprovadas.</p><Link className="btn" href="/contribuir">Adicionar o primeiro jogo</Link></div>}
      </section>
      <section className="container" style={{ paddingTop: 65, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        {[["Todas as plataformas","Do arcade aos consoles atuais, PC e mobile.",Gamepad2],["Construído pela comunidade","Qualquer pessoa pode sugerir conteúdo.",Users],["Conteúdo revisado","Publicações passam por aprovação.",Globe2]].map(([title,desc,Icon]: any) => <div className="panel" key={title} style={{ padding: 22 }}><Icon color="#a78bfa" size={23} /><h3 style={{ margin: "15px 0 7px" }}>{title}</h3><p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{desc}</p></div>)}
      </section>
    </main>
  );
}