import { createClient } from "@/lib/supabase/server";
import { createGame } from "@/app/actions";
import LiveContributions from "@/app/admin/contributions-live";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ erro?: string; sucesso?: string }> }) {
  const p = await searchParams;
  let user: any = null, profile: any = null, items: any[] = [], message = "";
  try {
    const supabase = await createClient();
    const auth = await supabase.auth.getUser(); user = auth.data.user;
    if (user) {
      const pr = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(); profile = pr.data;
      if (profile && ["moderator", "admin"].includes(profile.role)) {
        const result = await supabase.from("contributions").select("id,type,title,platform,payload,created_at,user_id").eq("status", "pending").order("created_at");
        items = result.data ?? []; if (result.error) message = result.error.message;
      }
    }
  } catch { message = "Configure o Supabase para habilitar a moderação."; }
  const isAdmin = profile?.role === "admin";
  return <main className="container" style={{ maxWidth: 900, paddingTop: 55 }}>
    <div style={{ color: "#a78bfa", fontSize: 12, fontWeight: 800, letterSpacing: ".13em" }}>EQUIPE</div><h1 style={{ fontSize: 40, letterSpacing: "-.05em", margin: "8px 0" }}>Central de moderação</h1><p className="muted">Revise contribuições antes de publicá-las e gerencie o catálogo.</p>
    {p.erro && <p style={{ color: "#fca5a5" }}>{p.erro}</p>}{p.sucesso && <p style={{ color: "#86efac" }}>{p.sucesso}</p>}
    {!user ? <div className="panel" style={{ padding: 24 }}>Entre com sua conta de moderador.</div> : !profile || !["moderator", "admin"].includes(profile.role) ? <div className="panel" style={{ padding: 24 }}>Sua conta não possui permissão de moderação.</div> : <>
      {isAdmin && <section className="panel" style={{ padding: 24, marginTop: 24 }}>
        <div style={{ color: "#a78bfa", fontSize: 12, fontWeight: 800, letterSpacing: ".12em" }}>ADMINISTRADOR</div>
        <h2 style={{ fontSize: 25, margin: "7px 0" }}>Adicionar jogo ao catálogo</h2>
        <p className="muted" style={{ marginBottom: 18 }}>O jogo será cadastrado diretamente, sem passar pela fila de contribuições.</p>
        <form action={createGame} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 13 }}>
          <label style={{ display: "grid", gap: 6 }}>Nome do jogo *<input className="field" name="title" required maxLength={120} placeholder="Ex.: Red Dead Redemption" /></label>
          <label style={{ display: "grid", gap: 6 }}>Plataforma *<input className="field" name="platform" required maxLength={100} placeholder="Ex.: Xbox 360, PC, PS5" /></label>
          <label style={{ display: "grid", gap: 6 }}>Desenvolvedora<input className="field" name="developer" maxLength={120} /></label>
          <label style={{ display: "grid", gap: 6 }}>Distribuidora<input className="field" name="publisher" maxLength={120} /></label>
          <label style={{ display: "grid", gap: 6 }}>Gênero<input className="field" name="genre" maxLength={100} placeholder="Ex.: Ação e aventura" /></label>
          <label style={{ display: "grid", gap: 6 }}>Data de lançamento<input className="field" name="release_date" maxLength={40} placeholder="Ex.: 18/05/2010" /></label>
          <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>URL da capa<input className="field" name="cover_url" type="url" placeholder="https://..." /></label>
          <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>Resumo *<textarea className="field" name="summary" required rows={3} maxLength={500} placeholder="Descrição curta que aparece no catálogo." /></label>
          <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>Descrição completa<textarea className="field" name="description" rows={6} placeholder="História, modos, recursos e outras informações..." /></label>
          <label style={{ display: "grid", gap: 6 }}>Visibilidade<select className="field" name="status" defaultValue="published"><option value="published">Publicar imediatamente</option><option value="draft">Salvar como rascunho</option></select></label>
          <div style={{ display: "flex", alignItems: "end" }}><button className="btn" type="submit">Adicionar ao catálogo</button></div>
        </form>
      </section>}
      <section style={{ marginTop: 30 }}>
        <h2 style={{ fontSize: 24, marginBottom: 6 }}>Contribuições pendentes</h2>
        {message && <p className="muted">{message}</p>}
        <LiveContributions initialItems={items} />
      </section>
    </>}
  </main>;
}
