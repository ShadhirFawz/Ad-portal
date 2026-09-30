# Stage 1: Build
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Copy Maven wrapper files and pom.xml
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build artifact
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Production JRE Runtime
FROM eclipse-temurin:25-jre-noble
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose default Spring Boot port
EXPOSE 8080

# Run Spring Boot binding dynamically to Vercel's assigned PORT with fast startup flags
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -XX:+UseSerialGC -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT:-8080} -jar app.jar"]
