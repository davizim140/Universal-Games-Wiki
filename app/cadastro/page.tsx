import Link from "next/link";
import { resendSignupConfirmation, signUp } from "@/app/actions";

export default async function CadastroPage({ searchParams }: { searchParams: Promise<{ erro?: string; mensagem?: string }> }) {
  const p = await searchParams;
  return <main className="container" style={{ maxWidth: 470, paddingTop: 65 }}>
    <div className="panel" style={{ padding: 28 }}>
      <h1 style={{ fontSize: 30, marginTop: 0 }}>Criar conta</h1><p className="muted">Participe da construção da enciclopédia.</p>
      {p.erro && <p role="alert" style={{ color: "#fca5a5" }}>{p.erro}</p>}
      {p.mensagem && <p role="status" style={{ color: "#86efac" }}>{p.mensagem}</p>}
      <form action={signUp} style={{ display: "grid", gap: 14 }}>
        <label>E-mail<input className="field" type="email" name="email" required autoComplete="email" /></label>
        <label>Senha (mínimo de 8 caracteres)<input className="field" type="password" name="password" minLength={8} required autoComplete="new-password" /></label>
        <button className="btn" type="submit">Criar conta</button>
      </form>
      <div style={{ borderTop: "1px solid #333", marginTop: 22, paddingTop: 18 }}>
        <p className="muted" style={{ marginTop: 0 }}>Já criou sua conta, mas não recebeu o e-mail ou o link expirou?</p>
        <form action={resendSignupConfirmation} style={{ display: "grid", gap: 12 }}>
          <label>E-mail cadastrado<input className="field" type="email" name="email" required autoComplete="email" /></label>
          <button className="btn" type="submit">Reenviar confirmação</button>
        </form>
      </div>
      <p className="muted" style={{ fontSize: 14 }}>Já tem conta? <Link href="/entrar" style={{ color: "#c4b5fd" }}>Entrar</Link></p>
    </div>
  </main>;
}