"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { reviewContribution } from "@/app/actions";

type Contribution = {
  id: string;
  type: string;
  title: string;
  platform: string | null;
  payload: { summary?: string; description?: string } | null;
  created_at: string;
  user_id: string;
};

export default function LiveContributions({ initialItems }: { initialItems: Contribution[] }) {
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-contributions-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "contributions" }, (event) => {
        const row = (event.new && Object.keys(event.new).length ? event.new : event.old) as Contribution & { status?: string };
        if (!row?.id) return;
        if (event.eventType === "DELETE" || row.status !== "pending") {
          setItems((current) => current.filter((item) => item.id !== row.id));
        } else if (event.eventType === "INSERT") {
          setItems((current) => current.some((item) => item.id === row.id) ? current : [row, ...current]);
        } else if (event.eventType === "UPDATE") {
          setItems((current) => current.map((item) => item.id === row.id ? { ...item, ...row } : item));
        }
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, []);

  function moderate(formData: FormData, id: string) {
    setBusy(id);
    setItems((current) => current.filter((item) => item.id !== id));
    startTransition(() => {
      void reviewContribution(formData);
    });
  }

  if (!items.length) {
    return <div className="panel" style={{ padding: 28, textAlign: "center" }}>Nenhuma contribuição pendente.</div>;
  }

  return <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
    {items.map((item) => <article className="panel" key={item.id} style={{ padding: 22 }}>
      <div style={{ color: "#a78bfa", fontSize: 12 }}>{item.type} · {item.platform || "Plataforma não informada"} · {new Date(item.created_at).toLocaleString("pt-BR")}</div>
      <h2 style={{ margin: "8px 0" }}>{item.title}</h2>
      <p>{item.payload?.summary}</p>
      {item.payload?.description && <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{item.payload.description}</p>}
      <form action={(formData) => moderate(formData, item.id)} style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <input type="hidden" name="id" value={item.id} />
        <textarea className="field" name="note" rows={2} placeholder="Observação da moderação (opcional)" />
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button className="btn" name="decision" value="approve" disabled={busy === item.id || isPending}>Aprovar</button>
          <button className="btn btn-secondary" name="decision" value="reject" disabled={busy === item.id || isPending}>Rejeitar</button>
        </div>
      </form>
    </article>)}
  </div>;
}
