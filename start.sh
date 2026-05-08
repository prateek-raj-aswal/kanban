#!/usr/bin/env bash
# Start script for Kanban backend (requires Git Bash or WSL on Windows)

set -e

export JAVA_HOME="C:/Program Files/Microsoft/jdk-21.0.11.10-hotspot"
export PATH="$JAVA_HOME/bin:$PATH"
export JWT_SECRET="local-dev-secret-at-least-32-chars-long"
export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/kanbandb"
export SPRING_DATASOURCE_USERNAME="sandboxadmin"
export SPRING_DATASOURCE_PASSWORD="sandbox@2024"

echo "Java version:"
java -version

echo ""
echo "Starting Kanban backend on http://localhost:8080 ..."
cd "$(dirname "$0")/backend"
./gradlew bootRun
