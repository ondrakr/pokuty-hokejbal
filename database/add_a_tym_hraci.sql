-- PŘIDÁNÍ HRÁČŮ DO KATEGORIE A-TÝM
-- Spusť v Supabase SQL editoru

-- ==================================================================
-- KROK 1: Získání ID kategorie A-tým
-- ==================================================================
DO $$
DECLARE
    a_tym_id INTEGER;
BEGIN
    -- Získání ID kategorie A-tým
    SELECT id INTO a_tym_id FROM kategorie WHERE slug = 'a-tym';
    
    IF a_tym_id IS NULL THEN
        RAISE EXCEPTION 'Kategorie A-tým nebyla nalezena!';
    END IF;
    
    RAISE NOTICE 'ID kategorie A-tým: %', a_tym_id;
    
    -- ==================================================================
    -- KROK 2: Přidání hráčů (pouze pokud neexistují)
    -- ==================================================================
    
    -- Hráči (role: 'hrac')
    INSERT INTO hraci (jmeno, role, kategorie_id) 
    SELECT * FROM (VALUES
        ('Miroslav Adamec', 'hrac', a_tym_id),
        ('Filip Lux', 'hrac', a_tym_id),
        ('Jan Bečka', 'hrac', a_tym_id),
        ('Lukáš Lajčiak', 'hrac', a_tym_id),
        ('Viktor Juraško', 'hrac', a_tym_id),
        ('Radim Dostál', 'hrac', a_tym_id),
        ('Marcel Nazad', 'hrac', a_tym_id),
        ('Vojtěch Bogdány', 'hrac', a_tym_id),
        ('David Halbrštát', 'hrac', a_tym_id),
        ('David Levý', 'hrac', a_tym_id),
        ('Vít Rozlílek', 'hrac', a_tym_id),
        ('Ondřej Hubálek', 'hrac', a_tym_id),
        ('Michal Macháček', 'hrac', a_tym_id),
        ('Petr Vodvárka', 'hrac', a_tym_id),
        ('Lukáš Faltejsek', 'hrac', a_tym_id),
        ('Jakub Cvejn', 'hrac', a_tym_id),
        ('Maxim Fišer', 'hrac', a_tym_id),
        ('Štěpán Švec', 'hrac', a_tym_id)
    ) AS new_hraci(jmeno, role, kategorie_id)
    WHERE NOT EXISTS (
        SELECT 1 FROM hraci 
        WHERE hraci.jmeno = new_hraci.jmeno 
        AND hraci.kategorie_id = a_tym_id
    );
    
    -- Trenéři (role: 'trener')
    INSERT INTO hraci (jmeno, role, kategorie_id) 
    SELECT * FROM (VALUES
        ('Jiří Krejsa', 'trener', a_tym_id),
        ('Tomáš Friml', 'trener', a_tym_id)
    ) AS new_treneri(jmeno, role, kategorie_id)
    WHERE NOT EXISTS (
        SELECT 1 FROM hraci 
        WHERE hraci.jmeno = new_treneri.jmeno 
        AND hraci.kategorie_id = a_tym_id
    );
    
    -- Brankáři (role: 'golman')
    INSERT INTO hraci (jmeno, role, kategorie_id) 
    SELECT * FROM (VALUES
        ('Michal Novák', 'golman', a_tym_id),
        ('David Manučarjan', 'golman', a_tym_id),
        ('Lukáš Sterenčák', 'golman', a_tym_id)
    ) AS new_golmani(jmeno, role, kategorie_id)
    WHERE NOT EXISTS (
        SELECT 1 FROM hraci 
        WHERE hraci.jmeno = new_golmani.jmeno 
        AND hraci.kategorie_id = a_tym_id
    );
    
    RAISE NOTICE 'Hráči byli úspěšně přidáni do kategorie A-tým';
    
END $$;

-- ==================================================================
-- KROK 3: Kontrola výsledků
-- ==================================================================
SELECT 
    h.jmeno,
    h.role,
    CASE 
        WHEN h.role = 'hrac' THEN 'Hráč'
        WHEN h.role = 'trener' THEN 'Trenér'
        WHEN h.role = 'golman' THEN 'Brankář'
    END as role_text,
    k.nazev as kategorie,
    h.created_at
FROM hraci h
JOIN kategorie k ON h.kategorie_id = k.id
WHERE k.slug = 'a-tym'
ORDER BY 
    CASE h.role 
        WHEN 'trener' THEN 1 
        WHEN 'golman' THEN 2 
        WHEN 'hrac' THEN 3 
    END,
    h.jmeno;

-- ==================================================================
-- STATISTIKY
-- ==================================================================
SELECT 
    k.nazev as kategorie,
    COUNT(*) as celkem_hracu,
    COUNT(CASE WHEN h.role = 'hrac' THEN 1 END) as hraci,
    COUNT(CASE WHEN h.role = 'golman' THEN 1 END) as brankari,
    COUNT(CASE WHEN h.role = 'trener' THEN 1 END) as treneri
FROM hraci h
JOIN kategorie k ON h.kategorie_id = k.id
WHERE k.slug = 'a-tym'
GROUP BY k.nazev;

-- ==================================================================
-- HOTOVO!
-- ==================================================================
-- Přidáno do kategorie A-tým:
-- - 18 hráčů (role: 'hrac')
-- - 2 trenéři (role: 'trener') 
-- - 3 brankáři (role: 'golman')
-- Celkem: 23 osob
-- ==================================================================
