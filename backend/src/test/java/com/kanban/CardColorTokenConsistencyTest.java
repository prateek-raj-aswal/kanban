package com.kanban;

import com.kanban.model.ColumnColor;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Verifies that:
 * 1. ColumnColor enum has exactly the expected 8 tokens in declaration order.
 * 2. Each token maps to its correct hex value.
 * 3. When UpdateColumnRequest exists (created in US-003), the @Pattern on
 *    headerColor stays in sync with ColumnColor.values(). Until US-003 is
 *    merged, the reflection block is skipped gracefully.
 */
class CardColorTokenConsistencyTest {

    private static final List<String> EXPECTED_TOKENS = List.of(
            "yellow", "green", "red", "blue", "purple", "orange", "teal", "gray"
    );

    @Test
    void columnColor_hasExactlyEightTokensInOrder() {
        List<String> actual = Arrays.stream(ColumnColor.values())
                .map(ColumnColor::token)
                .collect(Collectors.toList());

        assertEquals(8, actual.size(), "ColumnColor must have exactly 8 values");
        assertEquals(EXPECTED_TOKENS, actual, "Token order must match enum declaration order");
    }

    @Test
    void columnColor_hexMapIsCorrect() {
        var hexMap = java.util.Map.of(
                "yellow", "#FDE68A",
                "green",  "#6EE7B7",
                "red",    "#FCA5A5",
                "blue",   "#93C5FD",
                "purple", "#C4B5FD",
                "orange", "#FCD34D",
                "teal",   "#5EEAD4",
                "gray",   "#D1D5DB"
        );

        for (ColumnColor color : ColumnColor.values()) {
            assertEquals(
                    hexMap.get(color.token()),
                    color.getHex(),
                    "Hex mismatch for token: " + color.token()
            );
        }
    }

    /**
     * Full assertion activates once US-003 is complete and
     * UpdateColumnRequest exists with @Pattern on headerColor.
     *
     * The expected regex pattern is built dynamically from ColumnColor.values()
     * so that adding a 9th color without updating @Pattern causes this test to fail.
     */
    @Test
    void updateColumnRequest_patternMatchesColumnColorValues() {
        Class<?> requestClass;
        try {
            requestClass = Class.forName("com.kanban.dto.request.UpdateColumnRequest");
        } catch (ClassNotFoundException e) {
            // US-003 not yet merged — skip gracefully
            System.out.println("[SKIP] UpdateColumnRequest not found; test will activate after US-003 is merged.");
            return;
        }

        // Build expected pattern from ColumnColor.values()
        String expectedPattern = Arrays.stream(ColumnColor.values())
                .map(ColumnColor::token)
                .collect(Collectors.joining("|", "^(", ")$"));

        // Find @Pattern on the headerColor field
        try {
            Field headerColorField = requestClass.getDeclaredField("headerColor");
            jakarta.validation.constraints.Pattern patternAnnotation =
                    headerColorField.getAnnotation(jakarta.validation.constraints.Pattern.class);

            assertNotNull(patternAnnotation,
                    "headerColor field in UpdateColumnRequest must have @Pattern annotation");

            assertEquals(expectedPattern, patternAnnotation.regexp(),
                    "The @Pattern regexp on UpdateColumnRequest.headerColor must match all ColumnColor tokens. " +
                    "Did you add a new color to ColumnColor without updating @Pattern?");

        } catch (NoSuchFieldException e) {
            fail("UpdateColumnRequest does not have a 'headerColor' field. US-003 contract requires it.");
        }
    }
}
