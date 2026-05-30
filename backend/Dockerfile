# Stage 1: Build
FROM gradle:8-jdk21 AS build
WORKDIR /app

# Copy dependency descriptors first for layer cache efficiency
COPY build.gradle settings.gradle ./
COPY gradle gradle
COPY gradlew ./
RUN sed -i 's/\r$//' gradlew

# Pre-fetch dependencies before copying source (cache layer)
RUN ./gradlew dependencies --no-daemon -q

COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Create non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled artifact
COPY --from=build /app/build/libs/*.jar app.jar

# Mount point for upload volume (stateless image — no local state)
RUN mkdir -p /app/uploads && chown appuser:appgroup /app/uploads
VOLUME ["/app/uploads"]

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/v1/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
