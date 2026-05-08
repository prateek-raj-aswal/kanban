package com.kanban.dto.response;

import java.util.List;

public record ErrorResponse(
        String error,
        String code,
        List<FieldError> fields
) {
    public record FieldError(String field, String message) {}

    public static ErrorResponse simple(String code, String message) {
        return new ErrorResponse(message, code, null);
    }
}
