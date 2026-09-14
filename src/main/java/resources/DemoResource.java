package resources;

import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import model.DemoRun;
import model.RouteOption;
import services.ActionService;
import services.DemoCatalog;
import tools.LogisticsTools;

import java.util.Comparator;

@Path("/demo")
@Produces(MediaType.APPLICATION_JSON)
public class DemoResource {
    @Inject
    LogisticsTools tools;

    @Inject
    ActionService actions;

    @POST
    @Path("/disruption")
    public DemoRun run() {
        var alternatives = tools.evaluateRoutes();
        var selected = alternatives.stream().min(Comparator.comparingDouble(RouteOption::co2Tons)
                .thenComparingDouble(RouteOption::baseCost)).orElseThrow();
        var proposal = actions.propose(selected.routeId(),
                "Port of Rotterdam strike: reroute shipment 402 to Berlin via " + selected.mode()
                        + ". Lowest CO2 among all three alternatives (" + selected.co2Tons()
                        + " t). Accepts a later arrival than rail or truck to minimize emissions.");
        return new DemoRun(DemoCatalog.SHIPMENT_ID, DemoCatalog.ORIGINAL_COST, alternatives, proposal);
    }
}
