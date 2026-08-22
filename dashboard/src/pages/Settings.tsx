import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthClient } from "../lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InfoBanner from "../components/InfoBanner";
import PageLayout from "../components/PageLayout";

interface UserProfile {
  name: string;
  email: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAuthClient()
      .then(async (client) => {
        const res = await client.getSession();
        if (cancelled) return;
        const u = res?.data?.user;
        if (!u) {
          navigate("/login");
          return;
        }
        const profile = { name: u.name, email: u.email };
        setUser(profile);
        setName(profile.name);
        setEmail(profile.email);
      })
      .catch(() => {
        if (!cancelled) navigate("/login");
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setNotice("");
    setError("");
    setBusy(true);
    try {
      const client = await getAuthClient();
      const res = await client.updateUser({ name });
      if (res.error) throw new Error(res.error.message ?? "Gagal memperbarui profil");
      setNotice("Profil berhasil diperbarui.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui profil.");
    } finally {
      setBusy(false);
    }
  }

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    setNotice("");
    setError("");
    setBusy(true);
    try {
      const client = await getAuthClient();
      const res = await client.changeEmail({ newEmail: email, callbackURL: window.location.origin });
      if (res.error) throw new Error(res.error.message ?? "Gagal mengubah email");
      setNotice("Email verifikasi telah dikirim ke alamat baru Anda.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah email.");
    } finally {
      setBusy(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setNotice("");
    setError("");
    setBusy(true);
    try {
      const client = await getAuthClient();
      const res = await client.changePassword({ currentPassword, newPassword });
      if (res.error) throw new Error(res.error.message ?? "Gagal mengubah password");
      setNotice("Password berhasil diubah.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah password.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!window.confirm("Hapus akun? Tindakan ini tidak dapat dibatalkan.")) return;
    setNotice("");
    setError("");
    setBusy(true);
    try {
      const client = await getAuthClient();
      const res = await client.deleteUser({ password: deletePassword });
      if (res.error) throw new Error(res.error.message ?? "Gagal menghapus akun");
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus akun.");
      setBusy(false);
    }
  }

  return (
    <PageLayout title="Pengaturan" subtitle="Kelola akun Anda">
      <InfoBanner>
        Perubahan profil memengaruhi email yang digunakan untuk masuk dan laporan. Periksa kotak masuk untuk verifikasi email baru.
      </InfoBanner>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profil</CardTitle>
            <CardDescription>Nama tampilan dan email akun Anda.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {user && (
              <p className="text-sm text-muted-foreground">
                Masuk sebagai <span className="font-medium text-foreground">{user.email}</span>
              </p>
            )}
            <form onSubmit={handleUpdateProfile} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email-settings">Email</Label>
                <Input
                  id="email-settings"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              {notice && <p className="text-sm text-emerald-600">{notice}</p>}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={busy} className="flex-1">
                  {busy ? "Menyimpan..." : "Simpan Nama"}
                </Button>
                <Button type="button" variant="outline" className="flex-1" disabled={busy} onClick={handleChangeEmail}>
                  Kirim Verifikasi Email Baru
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Password</CardTitle>
              <CardDescription>Ganti password akun Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Password Saat Ini</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter"
                  />
                </div>
                <Button type="submit" disabled={busy}>
                  {busy ? "Menyimpan..." : "Ubah Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Zona Berbahaya</CardTitle>
              <CardDescription>Hapus akun beserta semua sesi. Password saat ini diperlukan.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeleteAccount} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="delete-password">Password Saat Ini</Label>
                  <Input
                    id="delete-password"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <Button variant="destructive" type="submit" disabled={busy}>
                  Hapus Akun
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
