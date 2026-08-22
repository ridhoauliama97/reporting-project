import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getAuthClient } from "../lib/auth-client";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAuthClient()
      .then((client) => client.getSession())
      .then((res) => {
        if (cancelled) return;
        setAuthed(Boolean(res?.data?.user));
        setChecked(true);
      })
      .catch(() => {
        if (cancelled) return;
        setAuthed(false);
        setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!checked) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  if (!authed) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
