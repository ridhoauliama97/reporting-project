import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CircleUserRoundIcon,
  LogInIcon,
  LogOutIcon,
  PackageSearchIcon,
  SettingsIcon,
  CircleHelpIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAuthClient } from "@/lib/auth-client";

interface SessionUser {
  name: string;
  email: string;
}

export function UserMenu() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const client = await getAuthClient();
      const res = await client.getSession();
      setUser(res?.data?.user ?? null);
      setReady(true);
    } catch {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (open) void refreshSession();
  }, [open, refreshSession]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const client = await getAuthClient();
      await client.signOut();
      setUser(null);
      setOpen(false);
      navigate("/login");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Profil"
        >
          <CircleUserRoundIcon className="size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user ? (
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </DropdownMenuLabel>
        ) : (
          <DropdownMenuLabel className="font-normal">
            <span className="text-sm text-muted-foreground">
              {ready ? "Belum masuk" : "Memuat..."}
            </span>
          </DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {user ? (
            <>
              <DropdownMenuItem>
                <PackageSearchIcon />
                Data Pembelian
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <SettingsIcon />
                  Pengaturan
                </Link>
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem asChild>
              <Link to="/login">
                <LogInIcon />
                Masuk
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <CircleHelpIcon />
            Bantuan
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {user && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={signingOut}
              onClick={handleSignOut}
            >
              <LogOutIcon />
              {signingOut ? "Keluar..." : "Keluar"}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
