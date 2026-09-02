import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAuthClient } from "../lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);
    try {
      const client = await getAuthClient();
      const res = await client.requestPasswordReset({ email });
      if (res.error) throw new Error(res.error.message ?? "Gagal mengirim email");
      setMessage("Tautan reset password telah dikirim ke email Anda.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim email.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);
    try {
      const client = await getAuthClient();
      const res = await client.resetPassword({ newPassword: password, token: token ?? "" });
      if (res.error) throw new Error(res.error.message ?? "Token tidak valid");
      setMessage("Password baru tersimpan. Silakan masuk.");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Token tidak valid atau sudah kedaluwarsa.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Reset Password</CardTitle>
          <CardDescription>
            {token
              ? "Masukkan password baru Anda."
              : "Masukkan email untuk menerima tautan reset."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {token ? (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="new-password">Password Baru</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                />
              </div>
              {message && <p className="text-sm text-emerald-600">{message}</p>}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={submitting}>
                {submitting ? "Menproses..." : "Simpan Password"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRequest} className="flex flex-col gap-4">
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
              {message && <p className="text-sm text-emerald-600">{message}</p>}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={submitting}>
                {submitting ? "Mengirim..." : "Kirim Tautan Reset"}
              </Button>
            </form>
          )}
          <p className="mt-4 text-center">
            <Link
              to="/login"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Kembali ke halaman masuk
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
