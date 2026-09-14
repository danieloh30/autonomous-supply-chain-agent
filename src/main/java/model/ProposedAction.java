package model;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.time.Instant;
import java.util.UUID;

@RegisterForReflection
public record ProposedAction(
        String id,
        String routeId,
        String reasoning,
        double extraCost,
        Status status,
        Instant createdAt) {
    public enum Status { PENDING, APPROVED, REJECTED, AUTO_APPROVED }

    public static ProposedAction create(String routeId, String reasoning, double extraCost, Status status) {
        return new ProposedAction(UUID.randomUUID().toString(), routeId, reasoning, extraCost, status, Instant.now());
    }

    public ProposedAction withStatus(Status nextStatus) {
        return new ProposedAction(id, routeId, reasoning, extraCost, nextStatus, createdAt);
    }
}
