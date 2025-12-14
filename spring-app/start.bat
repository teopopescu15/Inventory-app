@echo off
REM Script pentru pornirea aplicației Spring Boot cu variabile de mediu (Windows)

echo 🚀 Starting Spring Boot application...

REM Setează variabilele de mediu
set DB_URL=jdbc:postgresql://localhost:5432/springpcbe
set DB_USERNAME=postgres
set DB_PASSWORD=Teodora44
set JWT_SECRET=u9gdV2UIGPoWi82h/cNIu9dfaEyzg2AwjMMfczgylgQ=
set JWT_EXPIRATION=86400000
set SERVER_PORT=8080

echo 📊 Database: %DB_URL%
echo 🔐 JWT Secret: [HIDDEN]
echo ⏱️  JWT Expiration: 24 hours
echo 🌐 Server Port: %SERVER_PORT%
echo.

REM Pornește aplicația
mvnw.cmd spring-boot:run
