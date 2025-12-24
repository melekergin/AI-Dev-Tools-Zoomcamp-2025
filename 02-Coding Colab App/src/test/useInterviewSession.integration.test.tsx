import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { supabase } from "@/integrations/supabase/client";
import { useInterviewSession } from "@/hooks/useInterviewSession";
import { requestLog } from "./mswServer";

const mockChannel = {
  on: () => mockChannel,
  subscribe: () => mockChannel,
};

describe("useInterviewSession integration", () => {
  beforeAll(() => {
    vi.spyOn(supabase, "channel").mockImplementation(() => mockChannel as never);
    vi.spyOn(supabase, "removeChannel").mockImplementation(() => {});
  });

  beforeEach(() => {
    requestLog.length = 0;
  });

  it("creates a new session through the Supabase REST API", async () => {
    const { result } = renderHook(() => useInterviewSession(null));

    let createdSession: Awaited<ReturnType<typeof result.current.createSession>> | null = null;
    await act(async () => {
      createdSession = await result.current.createSession("console.log('hi');", "javascript");
    });

    expect(createdSession?.id).toBe("session-1");
    expect(requestLog.some((entry) => entry.method === "POST")).toBe(true);
  });

  it("fetches session data from the server on mount", async () => {
    const { result } = renderHook(() => useInterviewSession("session-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.session?.id).toBe("session-123");
    expect(requestLog.some((entry) => entry.method === "GET")).toBe(true);
  });

  it("updates code optimistically and sends a PATCH request", async () => {
    const { result } = renderHook(() => useInterviewSession("session-456"));

    await waitFor(() => {
      expect(result.current.session).not.toBeNull();
    });

    await act(async () => {
      await result.current.updateCode("updated-code");
    });

    expect(result.current.session?.code).toBe("updated-code");

    const patchRequest = requestLog.find((entry) => entry.method === "PATCH");
    expect(patchRequest).toBeDefined();
    expect(patchRequest?.body).toMatchObject({ code: "updated-code" });
  });
});
