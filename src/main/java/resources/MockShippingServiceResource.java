package resources;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import model.CarbonMetrics;
import model.Route;
import services.DemoCatalog;

import java.util.List;

@Path("/v1/logistics")
@Produces(MediaType.APPLICATION_JSON)
public class MockShippingServiceResource {
    @Inject
    DemoCatalog catalog;

    @GET
    @Path("/routes")
    public List<Route> getAvailableRoutes() {
        return catalog.routes();
    }

    @GET
    @Path("/impact")
    public CarbonMetrics getCarbonMetrics(@QueryParam("routeId") String routeId) {
        return catalog.carbon(routeId);
    }
}
