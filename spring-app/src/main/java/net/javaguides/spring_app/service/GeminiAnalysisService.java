package net.javaguides.spring_app.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.ImmutableList;
import com.google.genai.Client;
import com.google.genai.types.*;
import net.javaguides.spring_app.dto.InventoryAnalysisResponse;
import net.javaguides.spring_app.entity.Product;
import net.javaguides.spring_app.entity.ProductCountHistory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GeminiAnalysisService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-3-flash-preview}")
    private String geminiModel;

    @Value("${gemini.thinking.level:HIGH}")
    private String thinkingLevel;

    @Autowired
    private ObjectMapper objectMapper;

    private Client client;

    @PostConstruct
    public void init() {
        // Initialize the Gemini client with API key
        client = Client.builder().apiKey(geminiApiKey).build();
    }

    /**
     * Analyze inventory using Gemini 3 Flash AI
     * @param products list of products to analyze
     * @param history list of count history entries (last 6 months)
     * @return AI-generated analysis response
     */
    public InventoryAnalysisResponse analyzeInventory(List<Product> products,
                                                       List<ProductCountHistory> history) {
        try {
            // Build the prompt with product and history data
            String prompt = buildAnalysisPrompt(products, history);

            // Call Gemini 3 API
            String apiResponse = callGemini3Api(prompt);

            // Parse response into DTO
            return parseGeminiResponse(apiResponse);
        } catch (Exception e) {
            System.err.println("Gemini API error: " + e.getMessage());
            e.printStackTrace();
            // Return a fallback response with basic stats on error
            return buildFallbackResponse(products, history);
        }
    }

    /**
     * Build the prompt for Gemini AI
     */
    private String buildAnalysisPrompt(List<Product> products,
                                       List<ProductCountHistory> history) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are an inventory management AI assistant. Analyze the following inventory data and provide insights.\n\n");

        // Add products data
        prompt.append("## Current Inventory\n");
        for (Product p : products) {
            prompt.append(String.format("- Product ID %d: '%s' | Price: $%.2f | Current Stock: %d\n",
                    p.getId(), p.getTitle(), p.getPrice(), p.getCount()));
        }

        // Add history data
        prompt.append("\n## Stock Movement History (Last 6 Months)\n");
        Map<Long, List<ProductCountHistory>> historyByProduct = history.stream()
                .collect(Collectors.groupingBy(ProductCountHistory::getProductId));

        for (Map.Entry<Long, List<ProductCountHistory>> entry : historyByProduct.entrySet()) {
            Long productId = entry.getKey();
            List<ProductCountHistory> changes = entry.getValue();

            int totalSold = changes.stream()
                    .filter(h -> h.getChangeType() == ProductCountHistory.ChangeType.SALE)
                    .mapToInt(h -> Math.abs(h.getChangeAmount()))
                    .sum();

            int totalRestocked = changes.stream()
                    .filter(h -> h.getChangeType() == ProductCountHistory.ChangeType.RESTOCK)
                    .mapToInt(ProductCountHistory::getChangeAmount)
                    .sum();

            prompt.append(String.format("- Product ID %d: Sold %d units, Restocked %d units, %d transactions\n",
                    productId, totalSold, totalRestocked, changes.size()));
        }

        // Request structured output
        prompt.append("\n## Required Output Format (JSON)\n");
        prompt.append("Provide your analysis in the following JSON structure. Return ONLY valid JSON, no markdown or additional text:\n");
        prompt.append("{\n");
        prompt.append("  \"summary\": {\n");
        prompt.append("    \"totalProducts\": <number>,\n");
        prompt.append("    \"totalUnitsSold\": <number>,\n");
        prompt.append("    \"healthStatus\": \"Excellent|Good|Warning|Critical\",\n");
        prompt.append("    \"description\": \"<brief summary>\"\n");
        prompt.append("  },\n");
        prompt.append("  \"topSellingProducts\": [\n");
        prompt.append("    {\"productId\": <id>, \"productTitle\": \"<name>\", \"unitsSold\": <number>, \"revenue\": <number>}\n");
        prompt.append("  ],\n");
        prompt.append("  \"recommendations\": [\n");
        prompt.append("    {\"productId\": <id>, \"productTitle\": \"<name>\", \"currentStock\": <number>, \"recommendedRestock\": <number>, \"urgency\": \"High|Medium|Low\", \"reason\": \"<explanation>\"}\n");
        prompt.append("  ],\n");
        prompt.append("  \"insights\": [\n");
        prompt.append("    {\"category\": \"Sales|Inventory|Seasonal\", \"title\": \"<insight title>\", \"description\": \"<detailed insight>\", \"actionable\": true|false}\n");
        prompt.append("  ]\n");
        prompt.append("}\n");

        return prompt.toString();
    }

    /**
     * Call Gemini 3 Flash API using Google GenAI SDK
     */
    private String callGemini3Api(String prompt) {
        try {
            // Build content with user prompt
            List<Content> contents = ImmutableList.of(
                Content.builder()
                    .role("user")
                    .parts(ImmutableList.of(
                        Part.fromText(prompt)
                    ))
                    .build()
            );

            // Configure thinking level for Gemini 3
            GenerateContentConfig config = GenerateContentConfig.builder()
                .thinkingConfig(
                    ThinkingConfig.builder()
                        .thinkingLevel(thinkingLevel)
                        .build()
                )
                .responseMimeType("application/json")
                .build();

            // Generate content using Gemini 3 Flash
            GenerateContentResponse response = client.models.generateContent(
                geminiModel,
                contents,
                config
            );

            // Extract text from response
            if (response.candidates().isPresent() && !response.candidates().get().isEmpty()) {
                Candidate firstCandidate = response.candidates().get().get(0);
                if (firstCandidate.content().isPresent() &&
                    firstCandidate.content().get().parts().isPresent() &&
                    !firstCandidate.content().get().parts().get().isEmpty()) {

                    List<Part> parts = firstCandidate.content().get().parts().get();
                    StringBuilder result = new StringBuilder();

                    for (Part part : parts) {
                        // Skip thought parts, only get text output
                        if (part.thought().isEmpty() || !part.thought().get()) {
                            if (part.text().isPresent()) {
                                result.append(part.text().get());
                            }
                        }
                    }

                    String jsonResponse = result.toString().trim();

                    // Clean up any markdown code blocks if present
                    if (jsonResponse.startsWith("```json")) {
                        jsonResponse = jsonResponse.substring(7);
                    }
                    if (jsonResponse.startsWith("```")) {
                        jsonResponse = jsonResponse.substring(3);
                    }
                    if (jsonResponse.endsWith("```")) {
                        jsonResponse = jsonResponse.substring(0, jsonResponse.length() - 3);
                    }

                    return jsonResponse.trim();
                }
            }

            throw new RuntimeException("Invalid response structure from Gemini 3 API");
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Gemini 3 API: " + e.getMessage(), e);
        }
    }

    /**
     * Parse Gemini response into DTO
     */
    private InventoryAnalysisResponse parseGeminiResponse(String jsonResponse) {
        try {
            return objectMapper.readValue(jsonResponse, InventoryAnalysisResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response: " + e.getMessage(), e);
        }
    }

    /**
     * Build fallback response when AI analysis fails
     */
    private InventoryAnalysisResponse buildFallbackResponse(List<Product> products,
                                                             List<ProductCountHistory> history) {
        InventoryAnalysisResponse response = new InventoryAnalysisResponse();

        // Calculate basic stats
        int totalProducts = products.size();
        int totalSold = history.stream()
                .filter(h -> h.getChangeType() == ProductCountHistory.ChangeType.SALE)
                .mapToInt(h -> Math.abs(h.getChangeAmount()))
                .sum();

        // Summary
        InventoryAnalysisResponse.OverallSummary summary =
                new InventoryAnalysisResponse.OverallSummary(
                        totalProducts, totalSold, "Good",
                        "Analysis service temporarily unavailable. Showing basic statistics.");
        response.setSummary(summary);

        // Empty lists for other sections
        response.setTopSellingProducts(new ArrayList<>());
        response.setRecommendations(new ArrayList<>());
        response.setInsights(new ArrayList<>());

        return response;
    }
}
