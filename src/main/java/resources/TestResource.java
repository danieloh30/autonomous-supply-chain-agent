package resources;

import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import tools.LogisticsTools;

@Path("/test")
public class TestResource {

    @Inject
    LogisticsTools tools;

    @POST
    @Path("/create-pending-action")
    public String createTestPendingAction() {
        // Manually call executeRouteChange with a high cost to trigger approval workflow
        String result = tools.executeRouteChange(
            "Rail-01", 
            "Test route change due to Port of Rotterdam strike - requires approval", 
            550.0  // Over €500 threshold
        );
        return result;
    }
}
