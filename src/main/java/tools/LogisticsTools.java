package tools;

import apis.ShippingServiceApi;
import dev.langchain4j.agent.tool.Tool;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import model.ProposedAction;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.eclipse.microprofile.rest.client.inject.RestClient;

@ApplicationScoped
public class LogisticsTools {

    // Simple in-memory store for the demo; use Redis/DB for production
    private final Map<String, ProposedAction> pendingActions = new ConcurrentHashMap<>();

    @Inject
    @RestClient
    ShippingServiceApi shippingApi; // Standard MicroProfile Rest Client

    @Tool("Find alternative shipping routes. Returns list of available routes with their costs. You MUST call this first.")
    public String findAlternativeRoutes(String currentPort, String destination) {
        // This calls your existing enterprise REST API
        var routes = shippingApi.getAvailableRoutes(currentPort, destination);
        return "Available alternatives: " + routes.toString();
    }

    @Tool("Get carbon impact for a route. Returns CO2 tons as a number. Call this after findAlternativeRoutes.")
    public double getRouteCarbonImpact(String routeId) {
        return shippingApi.getCarbonMetrics(routeId).co2Tons();
    }

    @Tool("EXECUTE the route change NOW. This is the final REQUIRED step. Parameters: routeId (string like 'Rail-01'), reasoning (string), extraCost (number only, no currency). If extraCost > 200, returns ACTION_REQUIRED message. You MUST call this tool to complete the task.")
    public String executeRouteChange(String routeId, String reasoning, double extraCost) {
        if (extraCost > 200.0) {
            ProposedAction action = ProposedAction.create(routeId, reasoning, extraCost);
            pendingActions.put(action.id(), action);
            
            return "ACTION_REQUIRED: This change costs €" + extraCost + 
                   ". Proposal ID: " + action.id() + ". Waiting for human supervisor.";
        }
        
        // If low cost, proceed immediately
        return "SUCCESS: Route " + routeId + " updated automatically.";
    }
    
    public Map<String, ProposedAction> getPendingActions() {
        return pendingActions;
    }

}