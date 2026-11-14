"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { reviewContribution } from "@/app/actions";

type Status = "pending" | "approved" | "rejected";
type Contribution = {
  id: string;
  type: string;
  title: string;
  platform: string | null;
  payload: { summary?: string; description?: string } | null;
  created_at: string;
  user_id: string;
  status: Status;
  moderator_note?: string | null;
  reviewed_at?: string | null;
};

const statusLabels: Record<Status, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Rejeitada",
};

export default function LiveContributions({ initialItems }: { initialItems: Contribution[] }) {
  const [items, setItems] = useState(initialItems);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-contributions-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "contributions" }, (event) => {
        const raw = (event.new && Object.keys(event.new).length ? event.new : event.old) as Partial<Contribution>;
        if (!raw?.id) return;
        if (event.eventType === "DELETE") {
          setItems((current) => current.filter((item) => item.id !== raw.id));
          return;
        }
        const row = raw as Contribution;
        setItems((current) => {
          const without = current.filter((item) => item.id !== row.id);
          return [row, ...without].sort((a, b) => {
            const aDate = a.reviewed_at || a.created_at;
            const bDate = b.reviewed_at || b.created_at;
            return new Date(bDate).getTime() - new Date(aDate).getTime();
          });
        });
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, []);

  const counts = useMemo(() => ({
    pending: items.filter((item) => item.status === "pending").length,
    approved: items.filter((item) => item.status === "approved").length,
    rejected: items.filter((item) => item.status === "rejected").length,
  }), [items]);

  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return items.filter((item) => item.status === tab && (
      !term || item.title.toLocaleLowerCase("pt-BR").includes(term) ||
      (item.platform || "").toLocaleLowerCase("pt-BR").includes(term) ||
      item.type.toLocaleLowerCase("pt-BR").includes(term)
    ));
  }, [items, search, tab]);

  async function moderate(event: FormEvent<HTMLFormElement>, item: Contribution, decision: "approve" | "reject") {
    event.preventDefault();
    const actionLabel = decision === "approve" ? "aprovar" : "rejeitar";
    if (!window.confirm(`Tem certeza de que deseja ${actionLabel} “${item.title}”?`)) return;

    const formData = new FormData(event.currentTarget);
    formData.set("id", item.id);
    formData.set("decision", decision);
    const note = String(formData.get("note") || "").trim();

    setError("");
    setBusy(item.id);
    const reviewedAt = new Date().toISOString();
    const nextStatus: Status = decision === "approve" ? "approved" : "rejected";

    // Atualização otimista: a fila muda imediatamente, sem aguardar a navegação.
    setItems((current) => current.map((entry) => entry.id === item.id
      ? { ...entry, status: nextStatus, moderator_note: note, reviewed_at: reviewedAt }
      : entry
    ));

    try {
      const result = await reviewContribution(formData);
      if (!result?.ok) {
        setItems((current) => current.map((entry) => entry.id === item.id
          ? { ...entry, status: "pending", moderator_note: null, reviewed_at: null }
          : entry
        ));
        setError(result?.error || "Não foi possível registrar a decisão.");
      }
    } catch {
      setItems((current) => current.map((entry) => entry.id === item.id
        ? { ...entry, status: "pending", moderator_note: null, reviewed_at: null }
        : entry
      ));
      setError("Falha de conexão ao registrar a decisão. Tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  return <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10 }}>
      {(["pending", "approved", "rejected"] as const).map((status) => (
        <button key={status} type="button" onClick={() => setTab(status)} className="panel"
          style={{ padding: 14, textAlign: "left", border: tab === status ? "1px solid #a78bfa" : undefined, cursor: "pointer" }}>
          <div className="muted" style={{ fontSize: 12 }}>{statusLabels[status]}</div>
          <strong style={{ display: "block", fontSize: 26, marginTop: 3 }}>{counts[status]}</strong>
        </button>
      ))}
    </div>

    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      <input className="field" value={search} onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar por jogo, plataforma ou tipo..." aria-label="Buscar contribuições" style={{ flex: "1 1 240px" }} />
      <span className="muted" style={{ fontSize: 13 }}>{visible.length} resultado(s)</span>
    </div>

    {error && <div className="panel" role="alert" style={{ padding: 14, color: "#fca5a5" }}>{error}</div>}

    {!visible.length ? (
      <div className="panel" style={{ padding: 28, textAlign: "center" }}>
        {search ? "Nenhuma contribuição corresponde à busca." : tab === "pending" ? "Nenhuma contribuição pendente." : `Nenhuma contribuição ${tab === "approved" ? "aprovada" : "rejeitada"} no histórico carregado.`}
      </div>
    ) : visible.map((item) => (
      <article className="panel" key={item.id} style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div className="muted" style={{ fontSize: 12 }}>{item.type} · {item.platform || "Plataforma não informada"} · Enviada em {new Date(item.created_at).toLocaleString("pt-BR")}</div>
          <strong style={{ fontSize: 12, color: item.status === "approved" ? "#86efac" : item.status === "rejected" ? "#fca5a5" : "#c4b5fd" }}>{statusLabels[item.status]}</strong>
        </div>
        <h3 style={{ margin: "8px 0", fontSize: 20 }}>{item.title}</h3>
        {item.payload?.summary && <p>{item.payload.summary}</p>}
        {item.payload?.description && <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{item.payload.description}</p>}

        {item.status === "pending" ? (
          <form onSubmit={(event) => event.preventDefault()} style={{ display: "grid", gap: 10, marginTop: 16 }}>
            <textarea className="field" name="note" rows={2} placeholder="Observação para o histórico (opcional)" />
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              <button className="btn" type="button" disabled={busy === item.id} onClick={(event) => {
                const form = event.currentTarget.form;
                if (form) void moderate({ preventDefault() {}, currentTarget: form } as FormEvent<HTMLFormElement>, item, "approve");
              }}>{busy === item.id ? "Salvando..." : "Aprovar"}</button>
              <button className="btn btn-secondary" type="button" disabled={busy === item.id} onClick={(event) => {
                const form = event.currentTarget.form;
                if (form) void moderate({ preventDefault() {}, currentTarget: form } as FormEvent<HTMLFormElement>, item, "reject");
              }}>{busy === item.id ? "Salvando..." : "Rejeitar"}</button>
            </div>
          </form>
        ) : (
          <div className="muted" style={{ borderTop: "1px solid var(--border, #333)", marginTop: 14, paddingTop: 12, fontSize: 13 }}>
            {item.reviewed_at && <div>Analisada em {new Date(item.reviewed_at).toLocaleString("pt-BR")}</div>}
            {item.moderator_note ? <div>Observação: {item.moderator_note}</div> : <div>Sem observação registrada.</div>}
          </div>
        )}
      </article>
    ))}
    <p className="muted" style={{ fontSize: 12 }}>O painel recebe alterações em tempo real. O histórico mostra até os registros carregados pelo servidor.</p>
  </div>;
}
