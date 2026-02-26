package tools;

import apis.ShippingServiceApi;
import dev.langchain4j.agent.tool.Tool;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@ApplicationScoped
public class LogisticsTools {

    @Inject
    @RestClient
    ShippingServiceApi shippingApi; // Standard MicroProfile Rest Client

    @Tool("Find alternative shipping routes when a port is delayed")
    public String findAlternativeRoutes(String currentPort, String destination) {
        // This calls your existing enterprise REST API
        var routes = shippingApi.getAvailableRoutes(currentPort, destination);
        return "Available alternatives: " + routes.toString();
    }

    @Tool("Calculate the carbon footprint impact for a specific route")
    public double getRouteCarbonImpact(String routeId) {
        return shippingApi.getCarbonMetrics(routeId).co2Tons();
    }
}