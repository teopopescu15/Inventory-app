-- Script pentru ștergerea tuturor datelor din baza de date
-- Păstrează structura tabelelor dar șterge toate înregistrările
-- Resetează și secvențele pentru auto-increment

-- Dezactivează temporar verificările de foreign key pentru a evita erori
SET session_replication_role = 'replica';

-- Șterge toate datele din tabele în ordinea corectă (respectând foreign keys)
-- TRUNCATE CASCADE va șterge automat și datele dependente
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE products CASCADE;

-- Resetează secvențele pentru auto-increment la 1
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- Reactivează verificările de foreign key
SET session_replication_role = 'origin';

-- Verifică că tabelele sunt goale
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'products' as table_name, COUNT(*) as count FROM products;
