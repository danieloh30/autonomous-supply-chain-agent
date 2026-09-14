package services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.WebApplicationException;
import model.ProposedAction;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class ActionService {
    public static final double APPROVAL_THRESHOLD = 200.0;
    private final ConcurrentHashMap<String, ProposedAction> actions = new ConcurrentHashMap<>();
    private final DemoCatalog catalog;

    @Inject
    public ActionService(DemoCatalog catalog) {
        this.catalog = catalog;
    }

    public ProposedAction propose(String routeId, String reasoning) {
        if (reasoning == null || reasoning.isBlank() || reasoning.length() > 4000) {
            throw new BadRequestException("Reasoning must contain 1 to 4000 characters");
        }
        // The model cannot supply the price used for the approval decision.
        double extraCost = catalog.route(routeId).baseCost() - DemoCatalog.ORIGINAL_COST;
        if (!Double.isFinite(extraCost)) {
            throw new BadRequestException("Invalid route price");
        }
        var status = extraCost > APPROVAL_THRESHOLD
                ? ProposedAction.Status.PENDING : ProposedAction.Status.AUTO_APPROVED;
        var action = ProposedAction.create(routeId, reasoning.trim(), extraCost, status);
        actions.put(action.id(), action);
        return action;
    }

    public List<ProposedAction> all() {
        return actions.values().stream()
                .sorted(Comparator.comparing(ProposedAction::createdAt).reversed()
                        .thenComparing(ProposedAction::id))
                .toList();
    }

    public List<ProposedAction> pending() {
        return all().stream().filter(action -> action.status() == ProposedAction.Status.PENDING).toList();
    }

    public ProposedAction decide(String id, ProposedAction.Status decision) {
        if (decision != ProposedAction.Status.APPROVED && decision != ProposedAction.Status.REJECTED) {
            throw new BadRequestException("Expected an approval or rejection");
        }
        // Atomic per proposal: retries are safe, conflicting decisions cannot overwrite one another.
        return actions.compute(id, (key, action) -> {
            if (action == null) throw new NotFoundException("Proposal not found");
            if (action.status() == decision) return action;
            if (action.status() != ProposedAction.Status.PENDING) {
                throw new WebApplicationException("Proposal already has a final decision", 409);
            }
            return action.withStatus(decision);
        });
    }
}
