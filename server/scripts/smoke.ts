const BASE = process.env.BASE_URL ?? "http://localhost:4000";

let passed = 0;
let failed = 0;

async function step(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS: ${name}`);
  } catch (err) {
    failed += 1;
    console.log(`FAIL: ${name} -> ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function post(path: string, body: unknown, cookie?: string) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:5173",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const setCookie = res.headers.get("set-cookie");
  return { status: res.status, json, setCookie };
}

async function main() {
  const email = `smoke${Date.now()}@example.com`;
  const password = "password123";
  let cookie = "";

  await step("health", async () => {
    const res = await fetch(`${BASE}/api/health`);
    if (!res.ok) throw new Error(`status ${res.status}`);
  });

  await step("sign-up (email verification sent)", async () => {
    const r = await post("/api/auth/sign-up/email", { name: "Smoke Test", email, password });
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    cookie = r.setCookie ?? "";
    if (!cookie) throw new Error("no set-cookie");
  });

  await step("get-session with cookie", async () => {
    const res = await fetch(`${BASE}/api/auth/get-session`, {
      headers: { Cookie: cookie },
    });
    const json = (await res.json()) as { user?: { email: string } } | null;
    if (!json?.user || json.user.email !== email) throw new Error("session mismatch");
  });

  await step("sign-in after logout", async () => {
    await post("/api/auth/sign-out", {}, cookie);
    const r = await post("/api/auth/sign-in/email", { email, password });
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    cookie = r.setCookie ?? cookie;
  });

  await step("me with session", async () => {
    const res = await fetch(`${BASE}/api/me`, { headers: { Cookie: cookie } });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const json = (await res.json()) as { user?: { email: string } };
    if (json.user?.email !== email) throw new Error("me mismatch");
  });

  await step("me without session 401", async () => {
    const res = await fetch(`${BASE}/api/me`);
    if (res.status !== 401) throw new Error(`status ${res.status}`);
  });

  await step("change password + re-login", async () => {
    const newPassword = "newpassword123";
    const r = await post("/api/auth/change-password", { currentPassword: password, newPassword }, cookie);
    const changed = r.json as { user?: { email?: string } };
    if (changed.user?.email !== email) throw new Error(`unexpected: ${JSON.stringify(r.json)}`);
    await post("/api/auth/sign-out", {}, cookie);
    const login = await post("/api/auth/sign-in/email", { email, password: newPassword });
    if (login.status !== 200) throw new Error("re-login failed");
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
