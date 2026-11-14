"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/entrar?erro=" + encodeURIComponent(error.message));
  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) redirect("/cadastro?erro=" + encodeURIComponent(error.message));
  redirect("/entrar?mensagem=Confira seu e-mail para confirmar o cadastro.");
}

export async function submitContribution(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?erro=Entre%20na%20sua%20conta%20para%20contribuir.");
  const type = String(formData.get("type") || "game");
  const title = String(formData.get("title") || "").trim();
  const platform = String(formData.get("platform") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const details = String(formData.get("details") || "").trim();
  if (!title || !summary) redirect("/contribuir?erro=Preencha%20o%20título%20e%20o%20resumo.");
  const { error } = await supabase.from("contributions").insert({
    user_id: user.id, type, title, platform: platform || null,
    payload: { summary, description: details }, status: "pending"
  });
  if (error) redirect("/contribuir?erro=" + encodeURIComponent(error.message));
  redirect("/contribuir?sucesso=Sua%20contribuição%20foi%20enviada%20para%20análise.");
}

export async function reviewContribution(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const id = String(formData.get("id") || "");
  const decision = String(formData.get("decision") || "");
  const note = String(formData.get("note") || "");
  if (!id || !["approve", "reject"].includes(decision)) redirect("/admin?erro=Solicitação%20inválida.");
  const { error } = await supabase.rpc("review_contribution", {
    contribution_id: id, decision, moderator_note: note
  });
  if (error) redirect("/admin?erro=" + encodeURIComponent(error.message));
  revalidatePath("/"); revalidatePath("/jogos"); revalidatePath("/admin");
  redirect("/admin?sucesso=Análise%20registrada.");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}