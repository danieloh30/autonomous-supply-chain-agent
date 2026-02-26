package apis;

import model.CarbonMetrics;
import model.Route;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import java.util.List;

@RegisterRestClient(configKey = "shipping-api")
@Path("/v1/logistics")
public interface ShippingServiceApi {

    @GET
    @Path("/routes")
    List<Route> getAvailableRoutes(
            @QueryParam("origin") String origin,
            @QueryParam("destination") String destination
    );

    @GET
    @Path("/impact")
    CarbonMetrics getCarbonMetrics(@QueryParam("routeId") String routeId);
}