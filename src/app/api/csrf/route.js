import { generateCsrfToken } from "@/shared/security/middleware/csrf.middleware";

export async function GET() {
  const token = generateCsrfToken();

  return new Response(JSON.stringify({ csrfToken: token }), {
    status: 200,
    headers: {
      "Set-Cookie": `csrfToken=${token}; Path=/; SameSite=Lax`,
      "Content-Type": "application/json",
    },
  });
}
