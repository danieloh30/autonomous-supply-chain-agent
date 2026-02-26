package model;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public record Route(
        String routeId,
        String mode,      // e.g., "Barge", "Rail", "Truck"
        String eta,       // e.g., "2026-06-15T10:00:00Z"
        double baseCost   // Added for the agent to reason about budget
) {
    @Override
    public String toString() {
        return String.format("model.Route %s via %s (Arriving: %s, Cost: €%.2f)",
                routeId, mode, eta, baseCost);
    }
}