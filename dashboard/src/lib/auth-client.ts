export type AuthClient = ReturnType<
  typeof import("better-auth/react")["createAuthClient"]
>;

const getBaseURL = () =>
  import.meta.env.VITE_AUTH_URL ?? "http://localhost:4000";

let clientPromise: Promise<AuthClient> | null = null;

export function getAuthClient(): Promise<AuthClient> {
  if (!clientPromise) {
    clientPromise = import("better-auth/react").then(({ createAuthClient }) =>
      createAuthClient({ baseURL: getBaseURL() }),
    );
  }
  return clientPromise;
}
