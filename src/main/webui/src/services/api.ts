export interface Shipment {
  id: string;
  name: string;
  status: string;
  mode: string;
  alert?: string;
}

export interface ProposedAction {
  id: string;
  routeId: string;
  reasoning: string;
  extraCost: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface DemandData {
  month: string;
  predicted: number;
  actual: number;
}

export interface RiskEvent {
  region: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

const API_BASE = '';

export const api = {
  // Get pending supervisor actions
  async getPendingActions(): Promise<ProposedAction[]> {
    const response = await fetch(`${API_BASE}/supervisor/pending`);
    if (!response.ok) throw new Error('Failed to fetch pending actions');
    return response.json();
  },

  // Approve an action
  async approveAction(id: string): Promise<string> {
    const response = await fetch(`${API_BASE}/supervisor/approve/${id}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to approve action');
    return response.text();
  },

  // Reject an action
  async rejectAction(id: string): Promise<string> {
    const response = await fetch(`${API_BASE}/supervisor/reject/${id}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to reject action');
    return response.text();
  },

  // Report a disruption
  async reportDisruption(issue: string): Promise<string> {
    const response = await fetch(`${API_BASE}/disruption`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: issue,
    });
    if (!response.ok) throw new Error('Failed to report disruption');
    return response.text();
  },

  // Mock data for demo purposes
  getMockShipments(): Shipment[] {
    return [
      { id: '1', name: 'Shipment 1', status: 'Container', mode: 'Mob' },
      { id: '2', name: 'Shipment 2', status: 'Privay', mode: '' },
      { id: '3', name: 'Shipment 3', status: 'Container', mode: 'Mob', alert: 'Delay Detected: Port Congestion' },
      { id: '4', name: 'Shipment 4', status: 'Container', mode: 'Mob' },
    ];
  },

  getMockDemandData(): DemandData[] {
    return [
      { month: 'Jan', predicted: 120, actual: 115 },
      { month: 'Feb', predicted: 135, actual: 140 },
      { month: 'Mar', predicted: 145, actual: 142 },
      { month: 'Apr', predicted: 155, actual: 158 },
      { month: 'May', predicted: 165, actual: 160 },
      { month: 'Jun', predicted: 170, actual: 175 },
    ];
  },

  getMockRiskEvents(): RiskEvent[] {
    return [
      { region: 'Region B', severity: 'high', description: 'Activating Backup Supplier in Region B to mitigate disruption' },
    ];
  },
};

// Made with Bob
