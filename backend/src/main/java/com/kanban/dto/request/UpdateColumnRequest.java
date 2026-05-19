package com.kanban.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateColumnRequest(
        @Size(min = 1, max = 100) String name,
        @Pattern(regexp = "^(yellow|green|red|blue|purple|orange|teal|gray)$") String headerColor
) {}
