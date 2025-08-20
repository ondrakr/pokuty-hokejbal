-- OPRAVA PŘIHLÁŠENÍ PRO ÚČET JUNIORI
-- Kontrola stavu a reset blokování
-- Spusť v Supabase SQL editoru

-- ==================================================================
-- KROK 1: Kontrola aktuálního stavu účtu juniori
-- ==================================================================
SELECT 
    id,
    uzivatelske_jmeno,
    role,
    aktivni,
    pocet_neuspesnych_pokusu,
    zablokovano_do,
    kategorie_id,
    created_at
FROM uzivatele 
WHERE uzivatelske_jmeno = 'juniori';

-- ==================================================================
-- KROK 2: Reset blokování a neúspěšných pokusů
-- ==================================================================
UPDATE uzivatele 
SET 
    pocet_neuspesnych_pokusu = 0,
    zablokovano_do = NULL
WHERE uzivatelske_jmeno = 'juniori';

-- ==================================================================
-- KROK 3: Kontrola, zda kategorie juniori existuje
-- ==================================================================
SELECT id, nazev, slug FROM kategorie WHERE slug = 'juniori';

-- ==================================================================
-- KROK 4: Znovu vytvoření uživatele juniori (pokud neexistuje)
-- ==================================================================
DO $$
DECLARE
    juniori_id INTEGER;
BEGIN
    -- Získání ID kategorie juniori
    SELECT id INTO juniori_id FROM kategorie WHERE slug = 'juniori';
    
    -- Pokud kategorie neexistuje, vytvoř ji
    IF juniori_id IS NULL THEN
        INSERT INTO kategorie (nazev, slug, popis, poradi) VALUES 
        ('Junioři', 'juniori', 'Juniorské družstvo', 2)
        RETURNING id INTO juniori_id;
    END IF;
    
    -- Smaž existujícího uživatele juniori (pokud existuje)
    DELETE FROM uzivatele WHERE uzivatelske_jmeno = 'juniori';
    
    -- Vytvoř znovu uživatele juniori s bcrypt hashem
    INSERT INTO uzivatele (uzivatelske_jmeno, heslo_hash, role, kategorie_id, aktivni) VALUES 
    ('juniori', '$2b$12$JSyTRi9FtDhhmw/18UrNz.sB2lN0bx2GEGAjBy/fgMBIDDGsIBR6y', 'kategorie_admin', juniori_id, true);
    -- Hash pro heslo: luxikmamalyho
    
    RAISE NOTICE 'Uživatel juniori byl úspěšně vytvořen/obnoven';
END $$;

-- ==================================================================
-- KROK 5: Finální kontrola
-- ==================================================================
SELECT 
    u.id,
    u.uzivatelske_jmeno,
    u.role,
    u.aktivni,
    u.pocet_neuspesnych_pokusu,
    u.zablokovano_do,
    k.nazev as kategorie_nazev,
    k.slug as kategorie_slug
FROM uzivatele u
LEFT JOIN kategorie k ON u.kategorie_id = k.id
WHERE u.uzivatelske_jmeno = 'juniori';

-- ==================================================================
-- VÝSLEDEK:
-- Po spuštění tohoto skriptu by měl účet juniori fungovat s:
-- Uživatelské jméno: juniori
-- Heslo: luxikmamalyho
-- ==================================================================
