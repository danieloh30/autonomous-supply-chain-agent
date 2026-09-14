package services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.NotFoundException;
import model.CarbonMetrics;
import model.Route;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/** Trusted, fictional pricing for shipment 402. No real shipping operations occur. */
@ApplicationScoped
public class DemoCatalog {
    public static final String SHIPMENT_ID = "402";
    public static final double ORIGINAL_COST = 100.0;

    public List<Route> routes() {
        var today = Instant.now().truncatedTo(ChronoUnit.DAYS);
        return List.of(
                new Route("Rail-01", "Rail", today.plus(2, ChronoUnit.DAYS).toString(), 450.0),
                new Route("Truck-99", "Truck", today.plus(1, ChronoUnit.DAYS).toString(), 380.0),
                new Route("Barge-42", "Barge", today.plus(3, ChronoUnit.DAYS).toString(), 420.0));
    }

    public Route route(String routeId) {
        return routes().stream().filter(route -> route.routeId().equals(routeId)).findFirst()
                .orElseThrow(() -> new NotFoundException("Unknown demo route"));
    }

    public CarbonMetrics carbon(String routeId) {
        route(routeId);
        return switch (routeId) {
            case "Rail-01" -> new CarbonMetrics(0.3, "A+");
            case "Truck-99" -> new CarbonMetrics(1.5, "C");
            default -> new CarbonMetrics(0.2, "A++");
        };
    }
}
