import { useEffect, useState, type FormEvent } from "react";
import { LogIn, LogOut } from "lucide-react";
import { api, clearSession, hasSession } from "../services/api";
import { AdminPage } from "../pages/AdminPage";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AdminAccess() {
  const [authenticated, setAuthenticated] = useState(hasSession);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const expired = () => { setAuthenticated(false); setError("Sua sessao terminou. Entre novamente."); };
    window.addEventListener("florae:session-expired", expired);
    return () => window.removeEventListener("florae:session-expired", expired);
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      await api.login(String(data.get("email")), String(data.get("password")));
      setAuthenticated(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Nao foi possivel entrar."); }
    finally { setBusy(false); }
  }
  if (authenticated) return <>
    <div className="section-shell pt-6 flex justify-end"><Button variant="ghost" onClick={() => { clearSession(); setAuthenticated(false); }}><LogOut className="h-4 w-4" />Sair</Button></div>
    <AdminPage />
  </>;
  return <section className="section-shell py-16">
    <form className="mx-auto grid w-full max-w-sm gap-4" onSubmit={submit}>
      <h1 className="text-3xl font-semibold">Administração</h1>
      <label className="grid gap-2">E-mail<Input name="email" type="email" autoComplete="username" required /></label>
      <label className="grid gap-2">Senha<Input name="password" type="password" autoComplete="current-password" required maxLength={256} /></label>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <Button variant="dark" disabled={busy} type="submit"><LogIn className="h-4 w-4" />{busy ? "Entrando..." : "Entrar"}</Button>
    </form>
  </section>;
}
