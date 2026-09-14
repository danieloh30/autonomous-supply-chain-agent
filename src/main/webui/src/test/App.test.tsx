import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { api, DemoRun, ProposedAction } from "../services/api";

vi.mock("../components/DemandForecasting", () => ({
  default: () => <div>Sample demand chart</div>,
}));

const proposal: ProposedAction = {
  id: "proposal-123",
  routeId: "Barge-42",
  reasoning: "Lowest CO2 alternative",
  extraCost: 320,
  status: "PENDING",
  createdAt: "2026-09-14T12:00:00Z",
};
const run: DemoRun = {
  shipmentId: "402",
  originalCost: 100,
  action: proposal,
  alternatives: [
    { routeId: "Rail-01", mode: "Rail", eta: "", baseCost: 450, co2Tons: 0.3 },
    {
      routeId: "Truck-99",
      mode: "Truck",
      eta: "",
      baseCost: 380,
      co2Tons: 1.5,
    },
    {
      routeId: "Barge-42",
      mode: "Barge",
      eta: "",
      baseCost: 420,
      co2Tons: 0.2,
    },
  ],
};

beforeEach(() => {
  vi.spyOn(api, "getActions").mockResolvedValue([]);
  vi.spyOn(api, "reportDisruption").mockResolvedValue(
    "Awaiting human approval",
  );
  vi.spyOn(api, "runDemo").mockResolvedValue(run);
  vi.spyOn(api, "decideAction").mockResolvedValue({
    ...proposal,
    status: "APPROVED",
  });
});

describe("disruption workflow", () => {
  it("keeps typed details local until an explicit submission", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "AI agent" }));
    const input = screen.getByRole("textbox", { name: "Disruption details" });
    await user.clear(input);
    await user.type(input, "  Port strike in Rotterdam  ");
    expect(api.reportDisruption).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Analyze with AI →" }));
    expect(api.reportDisruption).toHaveBeenCalledExactlyOnceWith(
      "Port strike in Rotterdam",
    );
    expect(await screen.findByText("Awaiting human approval")).toBeTruthy();
  });

  it("disables blank AI submissions", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "AI agent" }));
    await user.clear(
      screen.getByRole("textbox", { name: "Disruption details" }),
    );
    await user.type(
      screen.getByRole("textbox", { name: "Disruption details" }),
      "   ",
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Analyze with AI →",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(api.reportDisruption).not.toHaveBeenCalled();
  });

  it("runs the deterministic demo without calling AI and shows all alternatives", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Run demo →" }));
    expect(api.runDemo).toHaveBeenCalledTimes(1);
    expect(api.reportDisruption).not.toHaveBeenCalled();
    const table = await screen.findByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(4);
    expect(within(table).getByText("Barge-42 · Lowest CO₂")).toBeTruthy();
    expect(within(table).getByText("+€320.00")).toBeTruthy();
  });

  it("prevents repeated submissions while a request is in flight", async () => {
    let finish!: (value: DemoRun) => void;
    vi.mocked(api.runDemo).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<App />);
    await user.dblClick(screen.getByRole("button", { name: "Run demo →" }));
    expect(api.runDemo).toHaveBeenCalledTimes(1);
    expect(
      (
        screen.getByRole("button", {
          name: "Analyzing routes…",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    await act(async () => finish(run));
  });

  it("shows failed analysis and still refreshes proposals created before the failure", async () => {
    vi.mocked(api.reportDisruption).mockImplementation(async () => {
      vi.mocked(api.getActions).mockResolvedValue([proposal]);
      throw new Error("AI service unavailable");
    });
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "AI agent" }));
    await user.click(screen.getByRole("button", { name: "Analyze with AI →" }));
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "AI service unavailable",
    );
    expect(
      await screen.findByRole("button", { name: /Approve Barge-42/ }),
    ).toBeTruthy();
  });
});

describe("supervisor queue", () => {
  it("disables both decisions during saving, then moves the proposal into history", async () => {
    vi.mocked(api.getActions).mockResolvedValue([proposal]);
    let finish!: (value: ProposedAction) => void;
    vi.mocked(api.decideAction).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      await screen.findByRole("button", { name: /Approve Barge-42/ }),
    );
    expect(
      (
        screen.getByRole("button", {
          name: /Reject Barge-42/,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(api.decideAction).toHaveBeenCalledExactlyOnceWith(
      proposal.id,
      "approve",
    );
    vi.mocked(api.getActions).mockResolvedValue([
      { ...proposal, status: "APPROVED" },
    ]);
    await act(async () => finish({ ...proposal, status: "APPROVED" }));
    expect(await screen.findByText("Approved")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /Approve Barge-42/ }),
    ).toBeNull();
    expect(screen.getByText("No decisions waiting")).toBeTruthy();
  });

  it("surfaces a conflicting decision and refreshes the current state", async () => {
    vi.mocked(api.getActions).mockResolvedValue([proposal]);
    vi.mocked(api.decideAction).mockImplementation(async () => {
      vi.mocked(api.getActions).mockResolvedValue([
        { ...proposal, status: "REJECTED" },
      ]);
      throw new Error("This proposal already has a different decision.");
    });
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      await screen.findByRole("button", { name: /Approve Barge-42/ }),
    );
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "This proposal already has a different decision.",
    );
    expect(await screen.findByText("Rejected")).toBeTruthy();
  });

  it("reports an offline backend and supports retrying the connection", async () => {
    vi.mocked(api.getActions).mockRejectedValue(new Error("offline"));
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      expect.stringContaining("Approval data is unavailable"),
    );
    vi.mocked(api.getActions).mockResolvedValue([]);
    await user.click(screen.getByRole("button", { name: "Retry connection" }));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(
      screen.getByText("Backend connected", { exact: false }),
    ).toBeTruthy();
  });

  it("cancels outstanding polling when the screen unmounts", async () => {
    const { unmount } = render(<App />);
    await waitFor(() => expect(api.getActions).toHaveBeenCalled());
    const signal = vi.mocked(api.getActions).mock.calls[0][0];
    unmount();
    expect(signal?.aborted).toBe(true);
  });
});
