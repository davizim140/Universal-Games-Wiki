import { createClient } from "@/lib/supabase/server";
import { reviewContribution } from "@/app/actions";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ erro?: string; sucesso?: string }> }) {
  const p = await searchParams;
  let user: any = null, profile: any = null, items: any[] = [], message = "";
  try {
    const supabase = await createClient();
    const auth = await supabase.auth.getUser(); user = auth.data.user;
    if (user) {
      const pr = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(); profile = pr.data;
      if (profile && ["moderator", "admin"].includes(profile.role)) {
        const result = await supabase.from("contributions").select("id,type,title,platform,payload,created_at,profiles(email)").eq("status", "pending").order("created_at");
        items = result.data ?? []; if (result.error) message = result.error.message;
      }
    }
  } catch { message = "Configure o Supabase para habilitar a moderação."; }
  return <main className="container" style={{ maxWidth: 900, paddingTop: 55 }}>
    <div style={{ color: "#a78bfa", fontSize: 12, fontWeight: 800, letterSpacing: ".13em" }}>EQUIPE</div><h1 style={{ fontSize: 40, letterSpacing: "-.05em", margin: "8px 0" }}>Central de moderação</h1><p className="muted">Revise as contribuições antes de publicá-las.</p>
    {p.erro && <p style={{ color: "#fca5a5" }}>{p.erro}</p>}{p.sucesso && <p style={{ color: "#86efac" }}>{p.sucesso}</p>}
    {!user ? <div className="panel" style={{ padding: 24 }}>Entre com sua conta de moderador.</div> : !profile || !["moderator", "admin"].includes(profile.role) ? <div className="panel" style={{ padding: 24 }}>Sua conta não possui permissão de moderação.</div> : <>
      {message && <p className="muted">{message}</p>}
      {!items.length ? <div className="panel" style={{ padding: 28, textAlign: "center" }}>Nenhuma contribuição pendente.</div> : <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
        {items.map(item => <article className="panel" key={item.id} style={{ padding: 22 }}>
          <div style={{ color: "#a78bfa", fontSize: 12 }}>{item.type} · {item.platform || "Plataforma não informada"} · {new Date(item.created_at).toLocaleString("pt-BR")}</div>
          <h2 style={{ margin: "8px 0" }}>{item.title}</h2><p>{item.payload?.summary}</p>{item.payload?.description && <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{item.payload.description}</p>}
          <form action={reviewContribution} style={{ display: "grid", gap: 10, marginTop: 16 }}>
            <input type="hidden" name="id" value={item.id} />
            <textarea className="field" name="note" rows={2} placeholder="Observação da moderação (opcional)" />
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}><button className="btn" name="decision" value="approve">Aprovar</button><button className="btn btn-secondary" name="decision" value="reject">Rejeitar</button></div>
          </form>
        </article>)}
      </div>}
    </>}
  </main>;
}