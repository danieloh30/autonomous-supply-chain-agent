package resources;

import agents.SupplyChainAgent;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

@Path("/disruption")
public class SupplyChainResource {

    @Inject
    SupplyChainAgent agent;

    @POST
    @Consumes(MediaType.TEXT_PLAIN)
    @Produces(MediaType.TEXT_PLAIN)
    public String resolve(String issue) {
        // The LLM will receive the issue, decide to call findAlternativeRoutes(), 
        // then call getRouteCarbonImpact(), and finally formulate a response.
        return agent.handleDisruption(issue);
    }
}