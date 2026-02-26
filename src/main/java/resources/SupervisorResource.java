package resources;

import java.util.Collection;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import model.ProposedAction;
import tools.LogisticsTools;

@Path("/supervisor")
public class SupervisorResource {

    @Inject
    LogisticsTools tools;

    @GET
    @Path("/pending")
    public Collection<ProposedAction> listPending() {
        return tools.getPendingActions().values();
    }

    @POST
    @Path("/approve/{id}")
    public String approve(@PathParam("id") String id) {
        var action = tools.getPendingActions().get(id);
        if (action == null) {
            return "Action not found: " + id;
        }
        
        // Create approved action
        var approvedAction = new ProposedAction(
            action.id(),
            action.routeId(),
            action.reasoning(),
            action.extraCost(),
            ProposedAction.Status.APPROVED
        );
        
        // Update the action in the map
        tools.getPendingActions().put(id, approvedAction);
        
        // In a real app, this would trigger the actual Shipping API call
        return "Route " + action.routeId() + " has been officially confirmed by human supervisor. Status: APPROVED";
    }
    
    @POST
    @Path("/reject/{id}")
    public String reject(@PathParam("id") String id) {
        var action = tools.getPendingActions().get(id);
        if (action == null) {
            return "Action not found: " + id;
        }
        
        // Create rejected action
        var rejectedAction = new ProposedAction(
            action.id(),
            action.routeId(),
            action.reasoning(),
            action.extraCost(),
            ProposedAction.Status.REJECTED
        );
        
        // Update the action in the map
        tools.getPendingActions().put(id, rejectedAction);
        
        return "Route " + action.routeId() + " has been rejected by human supervisor. Status: REJECTED";
    }
}