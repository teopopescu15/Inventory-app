#!/bin/bash

# Script pentru pornirea aplicației Spring Boot cu variabile de mediu

# Citește variabilele din .env
export $(cat .env | grep -v '^#' | xargs)

echo "🚀 Starting Spring Boot application..."
echo "📊 Database: $DB_URL"
echo "🔐 JWT Secret: [HIDDEN]"
echo "⏱️  JWT Expiration: $JWT_EXPIRATION ms ($(($JWT_EXPIRATION / 1000 / 60 / 60)) hours)"
echo "🌐 Server Port: $SERVER_PORT"
echo ""

# Pornește aplicația
./mvnw spring-boot:run
