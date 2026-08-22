import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthClient } from "../lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAuthClient()
      .then(() => {})
      .catch(() => {
        setError("Server autentikasi tidak dapat dijangkau.");
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const client = await getAuthClient();
      if (mode === "register") {
        if (!name.trim()) throw new Error("Nama wajib diisi");
        const res = await client.signUp.email({
          name: name.trim(),
          email,
          password,
        });
        if (res.error) throw new Error(res.error.message ?? "Gagal daftar");
      } else {
        const res = await client.signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message ?? "Gagal masuk");
      }
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message.replace(/^[a-z-]+:/i, "")
          : "Gagal masuk. Periksa kembali data Anda.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Database Report</CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Masuk untuk melanjutkan"
              : "Buat akun untuk melanjutkan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <div className="grid gap-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                  autoComplete="name"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@contoh.com"
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Memproses..."
                : mode === "login"
                  ? "Masuk"
                  : "Daftar"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Belum punya akun?{" "}
                <button
                  type="button"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                >
                  Daftar
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <button
                  type="button"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                >
                  Masuk
                </button>
              </>
            )}
          </p>
          <p className="mt-2 text-center">
            <Link
              to="/dashboard"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Kembali ke dashboard
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
