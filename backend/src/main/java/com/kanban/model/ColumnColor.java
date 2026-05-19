package com.kanban.model;

public enum ColumnColor {

    YELLOW("#FDE68A"),
    GREEN("#6EE7B7"),
    RED("#FCA5A5"),
    BLUE("#93C5FD"),
    PURPLE("#C4B5FD"),
    ORANGE("#FCD34D"),
    TEAL("#5EEAD4"),
    GRAY("#D1D5DB");

    private final String hex;

    ColumnColor(String hex) {
        this.hex = hex;
    }

    public String getHex() {
        return hex;
    }

    public String token() {
        return name().toLowerCase();
    }
}
