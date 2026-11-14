import { submitContribution, signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export default async function ContribuirPage({ searchParams }: { searchParams: Promise<{ erro?: string; sucesso?: string }> }) {
  const p = await searchParams;
  let user = null;
  let username = "";
  try {
    const supabase = await createClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
      username = profile?.username || user.user_metadata?.username || user.email?.split("@")[0] || "Minha conta";
    }
  } catch {}
  return <main className="container" style={{ maxWidth: 760, paddingTop: 55 }}>
    <div style={{ color: "#a78bfa", fontSize: 12, fontWeight: 800, letterSpacing: ".13em" }}>COMUNIDADE</div><h1 style={{ fontSize: 40, letterSpacing: "-.05em", margin: "8px 0" }}>Contribuir com o wiki</h1><p className="muted" style={{ lineHeight: 1.7 }}>Envie um novo jogo ou informações para a enciclopédia. Tudo passa por revisão antes de aparecer publicamente.</p>
    {p.erro && <p style={{ color: "#fca5a5" }}>{p.erro}</p>}{p.sucesso && <p style={{ color: "#86efac" }}>{p.sucesso}</p>}
    {!user ? <div className="panel" style={{ padding: 25, marginTop: 22 }}><p>Entre ou crie uma conta para enviar contribuições.</p><a className="btn" href="/entrar">Entrar</a></div> :
    <form action={submitContribution} className="panel" style={{ padding: 25, display: "grid", gap: 16, marginTop: 22 }}>
      <div className="muted" style={{ fontSize: 13 }}>Conectado como <strong style={{ color: "#c4b5fd" }}>@{username}</strong></div>
      <label>Tipo de contribuição<select className="field" name="type"><option value="game">Adicionar um jogo</option><option value="article">Enviar um artigo</option><option value="edit">Sugerir uma correção</option></select></label>
      <label>Nome ou título<input className="field" name="title" required maxLength={120} placeholder="Ex.: The Legend of Zelda: Breath of the Wild" /></label>
      <label>Plataforma<input className="field" name="platform" maxLength={100} placeholder="Ex.: Nintendo Switch, PC, PlayStation 5..." /></label>
      <label>Resumo<textarea className="field" name="summary" required rows={3} maxLength={500} placeholder="Uma descrição curta..." /></label>
      <label>Informações adicionais<textarea className="field" name="details" rows={7} placeholder="Desenvolvedora, lançamento, gênero, história e fontes..." /></label>
      <button className="btn" type="submit">Enviar para aprovação</button>
    </form>}
  </main>;
}