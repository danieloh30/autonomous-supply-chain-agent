package resources;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import model.CarbonMetrics;
import model.Route;

import java.util.List;

@Path("/v1/logistics")
@Produces(MediaType.APPLICATION_JSON)
public class MockShippingServiceResource {

    @GET
    @Path("/routes")
    public List<Route> getAvailableRoutes(
            @QueryParam("origin") String origin,
            @QueryParam("destination") String destination) {
        
        // Mock data for demo purposes
        return List.of(
            new Route("Rail-01", "Rail", "2026-06-15T10:00:00Z", 450.0),
            new Route("Truck-99", "Truck", "2026-06-14T18:00:00Z", 380.0),
            new Route("Barge-42", "Barge", "2026-06-16T12:00:00Z", 420.0)
        );
    }

    @GET
    @Path("/impact")
    public CarbonMetrics getCarbonMetrics(@QueryParam("routeId") String routeId) {
        // Mock carbon metrics based on route type
        return switch (routeId) {
            case "Rail-01" -> new CarbonMetrics(0.3, "A+");
            case "Truck-99" -> new CarbonMetrics(1.5, "C");
            case "Barge-42" -> new CarbonMetrics(0.2, "A++");
            default -> new CarbonMetrics(1.0, "B");
        };
    }
}