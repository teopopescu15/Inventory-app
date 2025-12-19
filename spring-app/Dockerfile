FROM maven:3.9-eclipse-temurin-21

WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code (will be overridden by volume mount for dev)
COPY src ./src
COPY .env ./.env

# Expose port
EXPOSE 4201

# Start with spring-boot:run for hot reload
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.jvmArguments=-Dserver.port=4201"]
