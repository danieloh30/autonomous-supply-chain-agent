package model;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.util.UUID;

@RegisterForReflection
public record ProposedAction(
    String id,
    String routeId,
    String reasoning,
    double extraCost,
    Status status
) {
    public enum Status { PENDING, APPROVED, REJECTED }

    public static ProposedAction create(String routeId, String reasoning, double extraCost) {
        return new ProposedAction(UUID.randomUUID().toString(), routeId, reasoning, extraCost, Status.PENDING);
    }
}