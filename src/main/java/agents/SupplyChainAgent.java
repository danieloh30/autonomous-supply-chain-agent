package agents;

import io.quarkiverse.langchain4j.RegisterAiService;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import tools.LogisticsTools;

@RegisterAiService(tools = LogisticsTools.class)
public interface SupplyChainAgent {

    @SystemMessage("""
        You are a Supply Chain Orchestrator for Europe. 
        Your goal is to maintain flow while adhering to EU environmental regulations.
        When a delay is detected, find an alternative route and justify it based on cost and CO2 impact.
        """)
    String handleDisruption(@UserMessage String disruptionDetails);
}