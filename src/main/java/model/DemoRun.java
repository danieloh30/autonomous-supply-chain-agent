package model;

import java.util.List;

public record DemoRun(String shipmentId, double originalCost, List<RouteOption> alternatives, ProposedAction action) {
}
