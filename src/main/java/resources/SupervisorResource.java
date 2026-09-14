package resources;

import java.util.List;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import model.ProposedAction;
import services.ActionService;

@Path("/supervisor")
@Produces(MediaType.APPLICATION_JSON)
public class SupervisorResource {
    @Inject
    ActionService actions;

    @GET
    @Path("/pending")
    public List<ProposedAction> listPending() {
        return actions.pending();
    }

    @GET
    @Path("/actions")
    public List<ProposedAction> listAll() {
        return actions.all();
    }

    @POST
    @Path("/approve/{id}")
    public ProposedAction approve(@PathParam("id") String id) {
        return actions.decide(id, ProposedAction.Status.APPROVED);
    }

    @POST
    @Path("/reject/{id}")
    public ProposedAction reject(@PathParam("id") String id) {
        return actions.decide(id, ProposedAction.Status.REJECTED);
    }
}
