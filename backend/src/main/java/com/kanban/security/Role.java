package com.kanban.security;

/**
 * Ordered least-privilege first: VIEWER < MEMBER < ADMIN < OWNER.
 * Ordinal is used for "at least" comparisons — do NOT reorder.
 */
public enum Role {
    VIEWER,
    MEMBER,
    ADMIN,
    OWNER
}
