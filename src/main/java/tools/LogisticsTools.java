package tools;

import apis.ShippingServiceApi;
import dev.langchain4j.agent.tool.Tool;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import model.ProposedAction;
import model.RouteOption;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import services.ActionService;

import java.util.List;

@ApplicationScoped
public class LogisticsTools {
    @Inject
    @RestClient
    ShippingServiceApi shippingApi;

    @Inject
    ActionService actions;

    @Tool("Find available routes and prices for demo shipment 402. Call this first.")
    public String findAlternativeRoutes(String currentPort, String destination) {
        return "Available alternatives: " + shippingApi.getAvailableRoutes(currentPort, destination);
    }

    @Tool("Get CO2 tons for a route. Check EVERY available route before selecting the lowest-carbon option.")
    public double getRouteCarbonImpact(String routeId) {
        return shippingApi.getCarbonMetrics(routeId).co2Tons();
    }

    @Tool("Submit the selected route and reasoning for demo shipment 402. REQUIRED final step. The server calculates extra cost from trusted prices. Above EUR 200 extra, returns ACTION_REQUIRED and waits for human approval. No real shipment is changed.")
    public String executeRouteChange(String routeId, String reasoning) {
        var action = actions.propose(routeId, reasoning);
        if (action.status() == ProposedAction.Status.PENDING) {
            return "ACTION_REQUIRED: Additional cost EUR " + action.extraCost()
                    + ". Proposal ID: " + action.id() + ". Awaiting human approval. No shipment has been changed.";
        }
        return "SIMULATED: Route " + routeId + " automatically approved. Proposal ID: " + action.id();
    }

    public List<RouteOption> evaluateRoutes() {
        return shippingApi.getAvailableRoutes("Rotterdam", "Berlin").stream()
                .map(route -> new RouteOption(route.routeId(), route.mode(), route.eta(), route.baseCost(),
                        getRouteCarbonImpact(route.routeId())))
                .toList();
    }
}
