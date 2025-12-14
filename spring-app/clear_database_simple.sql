-- Script alternativ simplu - Șterge datele în ordinea corectă (respectând foreign keys)

-- Șterge produsele primele (nu au dependențe)
DELETE FROM products;

-- Șterge categoriile (după produse)
DELETE FROM categories;

-- Șterge utilizatorii (ultimii, după ce toate categoriile sunt șterse)
DELETE FROM users;

-- Resetează secvențele pentru auto-increment la 1
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- Verifică că tabelele sunt goale
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'products' as table_name, COUNT(*) as count FROM products;
