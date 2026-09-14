package resources;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.test.common.http.TestHTTPResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class DemoWorkflowTest {
    @TestHTTPResource
    URI baseUri;

    @Inject
    ObjectMapper mapper;

    private final HttpClient client = HttpClient.newHttpClient();

    @Test
    void guidedDemoComparesAllRoutesAndCompletesApprovalLifecycle() throws Exception {
        var response = post("/demo/disruption", "");
        assertEquals(200, response.statusCode(), response.body());
        var run = mapper.readTree(response.body());
        assertEquals(3, run.path("alternatives").size());
        assertEquals("402", run.path("shipmentId").asText());
        assertEquals(100, run.path("originalCost").asDouble());
        var proposal = run.path("action");
        assertEquals("Barge-42", proposal.path("routeId").asText());
        assertEquals(320, proposal.path("extraCost").asDouble());
        assertEquals("PENDING", proposal.path("status").asText());
        var id = proposal.path("id").asText();
        assertTrue(contains(getJson("/supervisor/pending"), id));
        var approval = post("/supervisor/approve/" + id, "");
        assertEquals(200, approval.statusCode());
        assertEquals("APPROVED", mapper.readTree(approval.body()).path("status").asText());
        assertEquals(200, post("/supervisor/approve/" + id, "").statusCode());
        assertEquals(409, post("/supervisor/reject/" + id, "").statusCode());
        assertFalse(contains(getJson("/supervisor/pending"), id));
        assertTrue(contains(getJson("/supervisor/actions"), id));
    }

    @Test
    void rejectsProposalsAndReturnsRealErrorStatuses() throws Exception {
        var proposal = mapper.readTree(post("/demo/disruption", "").body()).path("action");
        var id = proposal.path("id").asText();
        assertEquals(200, post("/supervisor/reject/" + id, "").statusCode());
        assertEquals(200, post("/supervisor/reject/" + id, "").statusCode());
        assertEquals(409, post("/supervisor/approve/" + id, "").statusCode());
        assertEquals(404, post("/supervisor/approve/missing", "").statusCode());
        assertEquals(400, post("/disruption", "  ").statusCode());
        assertEquals(400, post("/disruption", "a".repeat(4001)).statusCode());
        assertEquals(503, post("/disruption", "Port strike").statusCode());
    }

    private boolean contains(JsonNode actions, String id) {
        for (var action : actions) if (action.path("id").asText().equals(id)) return true;
        return false;
    }

    private JsonNode getJson(String path) throws Exception {
        var response = client.send(HttpRequest.newBuilder(baseUri.resolve(path)).GET().build(), HttpResponse.BodyHandlers.ofString());
        assertEquals(200, response.statusCode(), response.body());
        return mapper.readTree(response.body());
    }

    private HttpResponse<String> post(String path, String body) throws Exception {
        return client.send(HttpRequest.newBuilder(baseUri.resolve(path)).header("Content-Type", "text/plain")
                .timeout(java.time.Duration.ofSeconds(30)).POST(HttpRequest.BodyPublishers.ofString(body)).build(),
                HttpResponse.BodyHandlers.ofString());
    }
}
