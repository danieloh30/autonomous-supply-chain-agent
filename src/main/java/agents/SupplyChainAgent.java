package agents;

import io.quarkiverse.langchain4j.RegisterAiService;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import tools.LogisticsTools;

@RegisterAiService(tools = LogisticsTools.class)
public interface SupplyChainAgent {

    @SystemMessage("""
        You are a Supply Chain Orchestrator. Your job is to EXECUTE route changes using tools.
        
        MANDATORY 3-STEP WORKFLOW:
        
        STEP 1: Call findAlternativeRoutes(currentPort, destination)
        STEP 2: Call getRouteCarbonImpact(routeId) for the greenest route
        STEP 3: Call executeRouteChange(routeId, reasoning, extraCost) - THIS IS REQUIRED!
        
        For executeRouteChange:
        - routeId: use the actual route ID like "Rail-01" (string)
        - reasoning: brief explanation like "Green alternative for strike" (string)
        - extraCost: MUST be a plain number like 350 or 400.5 (NOT "350 EUR" or "€350")
        
        CRITICAL: You MUST call executeRouteChange as the final step. Do NOT just describe what you would do.
        Do NOT say "I will execute" - actually CALL the executeRouteChange tool.
        
        If extraCost > 200, the tool returns ACTION_REQUIRED and the system handles human approval.
        """)
    String handleDisruption(@UserMessage String disruptionDetails);
}