# 🔐 Configurare JWT și Pornire Aplicație

## ✅ Setup Complet

Cheia JWT a fost generată și configurată automat în fișierul `.env`.

### 📁 Fișiere create:

- `.env` - Variabile de mediu (incluzând JWT_SECRET)
- `start.sh` - Script de pornire pentru Linux/WSL/Mac
- `start.bat` - Script de pornire pentru Windows

---

## 🚀 Cum să pornești aplicația:

### **Opțiunea 1: Cu script automat (RECOMANDAT)**

**Linux/WSL/Mac:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

sau dublu-click pe `start.bat`

---

### **Opțiunea 2: Manual cu variabile de mediu**

**Linux/WSL/Mac:**
```bash
export $(cat .env | grep -v '^#' | xargs)
./mvnw spring-boot:run
```

**Windows PowerShell:**
```powershell
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
    }
}
./mvnw spring-boot:run
```

---

### **Opțiunea 3: IntelliJ IDEA / Eclipse**

1. Deschide proiectul în IDE
2. Mergi la **Run → Edit Configurations**
3. Adaugă Environment Variables:
   ```
   DB_URL=jdbc:postgresql://localhost:5432/springpcbe
   DB_USERNAME=postgres
   DB_PASSWORD=Teodora44
   JWT_SECRET=u9gdV2UIGPoWi82h/cNIu9dfaEyzg2AwjMMfczgylgQ=
   JWT_EXPIRATION=86400000
   SERVER_PORT=8080
   ```

---

## 🔒 Securitate

✅ Fișierul `.env` este deja adăugat în `.gitignore`
✅ Cheia JWT nu va fi commitată în Git
✅ Cheia are 256 biți (securitate HS256)

⚠️ **IMPORTANT**: Nu comita niciodată fișierul `.env` în Git!

---

## 📊 Configurații JWT:

- **JWT_SECRET**: `u9gdV2UIGPoWi82h/cNIu9dfaEyzg2AwjMMfczgylgQ=`
- **JWT_EXPIRATION**: 86400000 ms (24 ore)
- **Algoritm**: HS256

---

## 🔄 Regenerare cheie JWT:

Dacă vrei să generezi o nouă cheie JWT:

```bash
openssl rand -base64 32
```

Apoi actualizează `JWT_SECRET` în fișierul `.env`.

---

## 🧪 Test JWT:

După pornirea aplicației, poți testa JWT-ul făcând:

1. **Register/Login** la `http://localhost:8080/api/auth/login`
2. Vei primi un token JWT în răspuns
3. Folosește token-ul în header:
   ```
   Authorization: Bearer <token>
   ```

---

## ❓ Troubleshooting:

**Eroare: "JWT secret key is not set"**
- Asigură-te că ai rulat aplicația cu variabilele de mediu
- Verifică că `.env` conține `JWT_SECRET`

**Eroare: "Database connection failed"**
- Verifică că PostgreSQL rulează
- Verifică credențialele din `.env`

---

✨ **Setup completat cu succes!**
