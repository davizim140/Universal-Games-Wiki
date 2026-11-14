import Link from "next/link";
import { signUp } from "@/app/actions";

export default async function CadastroPage({ searchParams }: { searchParams: Promise<{ erro?: string; mensagem?: string }> }) {
  const p = await searchParams;
  return <main className="container" style={{ maxWidth: 470, paddingTop: 65 }}>
    <div className="panel" style={{ padding: 28 }}>
      <h1 style={{ fontSize: 30, marginTop: 0 }}>Criar conta</h1><p className="muted">Participe da construção da enciclopédia.</p>
      {p.erro && <p role="alert" style={{ color: "#fca5a5" }}>{p.erro}</p>}
      {p.mensagem && <p role="status" style={{ color: "#86efac" }}>{p.mensagem}</p>}
      <form action={signUp} style={{ display: "grid", gap: 14 }}>
        <label>Nome de usuário<input className="field" type="text" name="username" required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" title="Use de 3 a 20 letras, números ou _." autoComplete="username" placeholder="Ex.: gamer123" /></label>
        <label>E-mail<input className="field" type="email" name="email" required autoComplete="email" /></label>
        <label>Senha (mínimo de 8 caracteres)<input className="field" type="password" name="password" minLength={8} required autoComplete="new-password" /></label>
        <button className="btn" type="submit">Criar conta</button>
      </form>
      <p className="muted" style={{ fontSize: 14, marginTop: 22 }}>Já tem conta? <Link href="/entrar" style={{ color: "#c4b5fd" }}>Entrar</Link></p>
    </div>
  </main>;
}