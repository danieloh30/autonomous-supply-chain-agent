import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "../services/api";

afterEach(() => vi.unstubAllGlobals());

describe("API requests", () => {
  it("encodes proposal identifiers and sends a single explicit decision", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);
    await api.decideAction("id/with spaces", "reject");
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      "/supervisor/reject/id%2Fwith%20spaces",
      { method: "POST" },
    );
  });

  it.each([404, 409, 503])(
    "surfaces a useful message for HTTP %s",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("", { status })),
      );
      const message =
        status === 404
          ? "no longer exists"
          : status === 409
            ? "different decision"
            : "guided demo";
      await expect(api.reportDisruption("Port strike")).rejects.toThrow(
        message,
      );
    },
  );
});
