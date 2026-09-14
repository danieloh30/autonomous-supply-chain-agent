export interface ProposedAction {
  id: string;
  routeId: string;
  reasoning: string;
  extraCost: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "AUTO_APPROVED";
  createdAt: string;
}

export interface RouteOption {
  routeId: string;
  mode: string;
  eta: string;
  baseCost: number;
  co2Tons: number;
}

export interface DemoRun {
  shipmentId: string;
  originalCost: number;
  alternatives: RouteOption[];
  action: ProposedAction;
}

export interface Shipment {
  id: string;
  name: string;
  status: string;
  mode: string;
  alert?: string;
}

export interface DemandData {
  month: string;
  predicted: number;
  actual: number;
}

export interface RiskEvent {
  region: string;
  severity: "high" | "medium" | "low";
  description: string;
}

async function request(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const response = await fetch(path, options);
  if (!response.ok) {
    const messages: Record<number, string> = {
      400: "Check the disruption details and try again.",
      404: "This proposal no longer exists. The approval queue has been refreshed.",
      409: "This proposal already has a different decision. The approval queue has been refreshed.",
      503: "AI analysis is unavailable. Configure OPENAI_API_KEY on the backend, or use the guided demo.",
    };
    throw new Error(
      messages[response.status] ??
        "The request failed. Check the backend connection before trying again.",
    );
  }
  return response;
}

export const api = {
  async getActions(signal?: AbortSignal): Promise<ProposedAction[]> {
    return (await request("/supervisor/actions", { signal })).json();
  },
  async decideAction(
    id: string,
    decision: "approve" | "reject",
  ): Promise<ProposedAction> {
    return (
      await request(`/supervisor/${decision}/${encodeURIComponent(id)}`, {
        method: "POST",
      })
    ).json();
  },
  async runDemo(): Promise<DemoRun> {
    return (await request("/demo/disruption", { method: "POST" })).json();
  },
  async reportDisruption(issue: string): Promise<string> {
    return (
      await request("/disruption", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: issue,
      })
    ).text();
  },
  getMockShipments(): Shipment[] {
    return [
      {
        id: "402",
        name: "Shipment 402 · Rotterdam → Berlin",
        status: "Disrupted",
        mode: "Sea",
        alert: "Port strike · alternative route needed",
      },
      {
        id: "403",
        name: "Shipment 403 · New York → Antwerp",
        status: "In transit",
        mode: "Sea",
      },
      {
        id: "404",
        name: "Shipment 404 · Shanghai → Sydney",
        status: "On schedule",
        mode: "Sea",
      },
    ];
  },
  getMockDemandData(): DemandData[] {
    return [
      { month: "Jan", predicted: 120, actual: 115 },
      { month: "Feb", predicted: 135, actual: 140 },
      { month: "Mar", predicted: 145, actual: 142 },
      { month: "Apr", predicted: 155, actual: 158 },
      { month: "May", predicted: 165, actual: 160 },
      { month: "Jun", predicted: 170, actual: 175 },
    ];
  },
  getMockRiskEvents(): RiskEvent[] {
    return [
      {
        region: "Port of Rotterdam",
        severity: "high",
        description:
          "Compare inland alternatives for shipment 402. Extra cost above €200 requires supervisor approval.",
      },
    ];
  },
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
