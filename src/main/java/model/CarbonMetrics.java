package model;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public record CarbonMetrics(
        double co2Tons,
        String rating     // e.g., "A+", "C", "High-Impact"
) {
    // Helper for the AI to understand the severity
    public boolean isCompliantWithEU() {
        return co2Tons < 0.5;
    }
}
