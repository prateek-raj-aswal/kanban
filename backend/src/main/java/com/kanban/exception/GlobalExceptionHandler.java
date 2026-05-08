package com.kanban.exception;

import com.kanban.dto.response.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    ResponseEntity<ErrorResponse> handleApi(ApiException ex) {
        return ResponseEntity.status(ex.getStatus())
                .body(ErrorResponse.simple(ex.getCode(), ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<ErrorResponse.FieldError> fields = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ErrorResponse.FieldError(fe.getField(), fe.getDefaultMessage()))
                .toList();
        return ResponseEntity.unprocessableEntity()
                .body(new ErrorResponse("Validation failed", "VALIDATION_FAILED", fields));
    }
}
