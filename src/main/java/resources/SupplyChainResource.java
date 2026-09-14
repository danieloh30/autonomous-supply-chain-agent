package resources;

import agents.SupplyChainAgent;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.ServiceUnavailableException;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@Path("/disruption")
public class SupplyChainResource {
    @Inject
    SupplyChainAgent agent;

    @ConfigProperty(name = "quarkus.langchain4j.openai.api-key")
    String apiKey;

    @POST
    @Consumes(MediaType.TEXT_PLAIN)
    @Produces(MediaType.TEXT_PLAIN)
    public String resolve(String issue) {
        if (issue == null || issue.isBlank() || issue.length() > 4000) {
            throw new BadRequestException("Disruption details must contain 1 to 4000 characters");
        }
        if (apiKey.isBlank() || "demo-not-configured".equals(apiKey)) {
            throw new ServiceUnavailableException("Configure OPENAI_API_KEY or use POST /demo/disruption");
        }
        return agent.handleDisruption(issue.trim());
    }
}
