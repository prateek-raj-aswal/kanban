package com.kanban.filter;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class CorrelationIdFilterTest {

    private CorrelationIdFilter filter;

    @BeforeEach
    void setUp() {
        filter = new CorrelationIdFilter();
    }

    @Test
    void generatesCorrelationIdWhenHeaderAbsent() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse res = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(req, res, chain);

        String header = res.getHeader(CorrelationIdFilter.HEADER);
        assertThat(header).isNotBlank();
        // UUID format: 36 chars with dashes
        assertThat(header).matches("[0-9a-f\\-]{36}");
    }

    @Test
    void propagatesExistingCorrelationId() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader(CorrelationIdFilter.HEADER, "my-trace-id");
        MockHttpServletResponse res = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(req, res, chain);

        assertThat(res.getHeader(CorrelationIdFilter.HEADER)).isEqualTo("my-trace-id");
    }

    @Test
    void correlationIdIsInMdcDuringRequest() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader(CorrelationIdFilter.HEADER, "trace-123");
        MockHttpServletResponse res = new MockHttpServletResponse();

        final String[] capturedId = new String[1];
        FilterChain chain = (request, response) -> capturedId[0] = MDC.get(CorrelationIdFilter.MDC_KEY);

        filter.doFilter(req, res, chain);

        assertThat(capturedId[0]).isEqualTo("trace-123");
    }

    @Test
    void mdcIsCleanedUpAfterRequest() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse res = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(req, res, chain);

        assertThat(MDC.get(CorrelationIdFilter.MDC_KEY)).isNull();
    }
}
