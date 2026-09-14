package services;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.WebApplicationException;
import model.ProposedAction;
import model.Route;
import org.junit.jupiter.api.Test;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;

import static org.junit.jupiter.api.Assertions.*;

class ActionServiceTest {
    @Test
    void usesCatalogPricesAndReturnsOnlyPendingProposals() {
        var service = new ActionService(new DemoCatalog());
        var proposal = service.propose("Barge-42", "Lowest carbon route");
        assertEquals(320.0, proposal.extraCost());
        assertEquals(ProposedAction.Status.PENDING, proposal.status());
        assertEquals(1, service.pending().size());
        var approved = service.decide(proposal.id(), ProposedAction.Status.APPROVED);
        assertEquals(proposal.createdAt(), approved.createdAt());
        assertTrue(service.pending().isEmpty());
        assertEquals(approved, service.all().getFirst());
        assertThrows(UnsupportedOperationException.class, () -> service.all().clear());
    }

    @Test
    void thresholdIsStrictlyGreaterThanTwoHundred() {
        for (double extraCost : new double[] { -20, 0, 199.99, 200, 200.01 }) {
            var catalog = new DemoCatalog() {
                @Override
                public Route route(String id) {
                    return new Route(id, "Rail", "2026-09-20T00:00:00Z", ORIGINAL_COST + extraCost);
                }
            };
            var proposal = new ActionService(catalog).propose("test", "Threshold check");
            assertEquals(extraCost > 200 ? ProposedAction.Status.PENDING : ProposedAction.Status.AUTO_APPROVED,
                    proposal.status());
        }
    }

    @Test
    void finalDecisionsAreIdempotentAndCannotBeOverwritten() {
        var service = new ActionService(new DemoCatalog());
        var proposal = service.propose("Rail-01", "Rail alternative");
        var rejected = service.decide(proposal.id(), ProposedAction.Status.REJECTED);
        assertEquals(rejected, service.decide(proposal.id(), ProposedAction.Status.REJECTED));
        var error = assertThrows(WebApplicationException.class,
                () -> service.decide(proposal.id(), ProposedAction.Status.APPROVED));
        assertEquals(409, error.getResponse().getStatus());
        assertEquals(rejected, service.all().getFirst());
    }

    @Test
    void validatesProposalInputs() {
        var service = new ActionService(new DemoCatalog());
        assertThrows(NotFoundException.class, () -> service.propose("invented", "Unknown route"));
        assertThrows(NotFoundException.class, () -> service.propose(null, "Unknown route"));
        assertThrows(BadRequestException.class, () -> service.propose("Rail-01", "  "));
        assertThrows(BadRequestException.class, () -> service.propose("Rail-01", null));
        assertThrows(BadRequestException.class, () -> service.propose("Rail-01", "a".repeat(4001)));
        assertThrows(NotFoundException.class, () -> service.decide("missing", ProposedAction.Status.APPROVED));
        assertThrows(BadRequestException.class, () -> service.decide("missing", ProposedAction.Status.PENDING));
        assertThrows(NotFoundException.class, () -> new DemoCatalog().carbon(null));
        assertTrue(service.all().isEmpty());
    }

    @Test
    void concurrentOppositeDecisionsHaveExactlyOneWinner() throws Exception {
        var service = new ActionService(new DemoCatalog());
        var proposal = service.propose("Rail-01", "Concurrent review");
        var ready = new CountDownLatch(2);
        var start = new CountDownLatch(1);
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            var approve = executor.submit(() -> decideAfterBarrier(service, proposal.id(), ProposedAction.Status.APPROVED, ready, start));
            var reject = executor.submit(() -> decideAfterBarrier(service, proposal.id(), ProposedAction.Status.REJECTED, ready, start));
            boolean bothReady;
            try {
                bothReady = ready.await(5, java.util.concurrent.TimeUnit.SECONDS);
            } finally {
                start.countDown();
            }
            assertTrue(bothReady);
            assertEquals(1, approve.get() + reject.get());
            assertTrue(service.pending().isEmpty());
            assertEquals(1, service.all().size());
        }
    }

    private int decideAfterBarrier(ActionService service, String id, ProposedAction.Status status,
                                   CountDownLatch ready, CountDownLatch start) throws InterruptedException {
        ready.countDown();
        start.await();
        try {
            service.decide(id, status);
            return 1;
        } catch (WebApplicationException error) {
            assertEquals(409, error.getResponse().getStatus());
            return 0;
        }
    }
}
