import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? "http://localhost:54321";

type RequestLogEntry = {
  method: string;
  url: string;
  body?: unknown;
};

export const requestLog: RequestLogEntry[] = [];

export const server = setupServer(
  http.post(`${supabaseUrl}/rest/v1/interview_sessions`, async ({ request }) => {
    const body = await request.json().catch(() => null);
    requestLog.push({ method: "POST", url: request.url, body });

    const payload = typeof body === "object" && body ? (body as Record<string, unknown>) : {};

    return HttpResponse.json(
      {
        id: "session-1",
        code: payload.code ?? "// Start coding here\n",
        language: payload.language ?? "javascript",
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
      },
      { status: 201 }
    );
  }),
  http.get(`${supabaseUrl}/rest/v1/interview_sessions`, ({ request }) => {
    requestLog.push({ method: "GET", url: request.url });

    const url = new URL(request.url);
    const filter = url.searchParams.get("id");
    const id = filter?.replace("eq.", "") ?? "session-1";

    return HttpResponse.json(
      {
        id,
        code: "server-code",
        language: "javascript",
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
      },
      { status: 200 }
    );
  }),
  http.patch(`${supabaseUrl}/rest/v1/interview_sessions`, async ({ request }) => {
    const body = await request.json().catch(() => null);
    requestLog.push({ method: "PATCH", url: request.url, body });

    return new HttpResponse(null, { status: 204 });
  })
);
