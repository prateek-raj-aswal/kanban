package com.kanban.controller;

import com.kanban.model.ColumnColor;
import com.kanban.security.AuthenticatedUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ColumnColorController {

    @GetMapping("/api/v1/column-colors")
    public ResponseEntity<Map<String, Object>> getColumnColors(
            @AuthenticationPrincipal AuthenticatedUser user) {
        ColumnColor[] values = ColumnColor.values();

        List<String> tokens = Arrays.stream(values)
                .map(ColumnColor::token)
                .toList();

        Map<String, String> colorMap = new LinkedHashMap<>();
        for (ColumnColor color : values) {
            colorMap.put(color.token(), color.getHex());
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("tokens", tokens);
        response.put("colorMap", colorMap);

        return ResponseEntity.ok(response);
    }
}
