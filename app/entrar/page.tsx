import Link from "next/link";
import { signIn } from "@/app/actions";

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ erro?: string; mensagem?: string }> }) {
  const p = await searchParams;
  return <main className="container" style={{ maxWidth: 470, paddingTop: 65 }}>
    <div className="panel" style={{ padding: 28 }}>
      <h1 style={{ fontSize: 30, marginTop: 0 }}>Entrar</h1><p className="muted">Acesse sua conta para contribuir com o wiki.</p>
      {p.erro && <p style={{ color: "#fca5a5" }}>{p.erro}</p>}{p.mensagem && <p style={{ color: "#86efac" }}>{p.mensagem}</p>}
      <form action={signIn} style={{ display: "grid", gap: 14 }}>
        <label>E-mail<input className="field" type="email" name="email" required autoComplete="email" /></label>
        <label>Senha<input className="field" type="password" name="password" required autoComplete="current-password" /></label>
        <button className="btn" type="submit">Entrar</button>
      </form>
      <p className="muted" style={{ fontSize: 14 }}>Ainda não tem conta? <Link href="/cadastro" style={{ color: "#c4b5fd" }}>Criar cadastro</Link></p>
    </div>
  </main>;
}