# Autonomous Supply Chain Agents

![Demo Scenarios](assets/demo_scenario.png)

## The Demo Testing Suite (cURL)

```
curl -X POST http://localhost:8080/disruption \
     -H "Content-Type: text/plain" \
     -d "The Port of Rotterdam is facing a 48-hour strike. Find me a green alternative for shipment 402."
```

The Expected "Agentic" Logic (Visible in Logs):

1. **Tool Call**: findAlternativeRoutes("Rotterdam", "Berlin")
2. **API Result**: Returns [Route(id=Rail-01, mode=Rail, ...), Route(id=Truck-99, mode=Truck, ...)]
3. **Tool Call:** getCarbonMetrics("Rail-01")
4. **Final Reasoning**: "Since Rotterdam is blocked, I recommend shifting to Rail-01. Although it arrives 4 hours later, it reduces CO2 by 0.3 tons, staying compliant with your EU sustainability targets."

## Why this matters for Amsterdam 2026:
By using Java Records and MicroProfile, you are showing the audience that AI doesn't require a "rip and replace" of their enterprise stack. You are simply giving your existing, high-performance Java services a "voice" and a "brain."