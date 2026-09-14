package resources;

import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import tools.LogisticsTools;

/** Compatibility endpoint for the original command-line demo. */
@Path("/test")
public class TestResource {
    @Inject
    LogisticsTools tools;

    @POST
    @Path("/create-pending-action")
    @Produces(MediaType.TEXT_PLAIN)
    public String createTestPendingAction() {
        return tools.executeRouteChange("Rail-01", "Port of Rotterdam strike: propose rail for shipment 402.");
    }
}
