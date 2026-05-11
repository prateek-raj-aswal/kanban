# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon -q
COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# Runtime stage
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
RUN addgroup -S kanban && adduser -S kanban -G kanban
COPY --from=build /app/build/libs/*.jar app.jar
USER kanban
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
