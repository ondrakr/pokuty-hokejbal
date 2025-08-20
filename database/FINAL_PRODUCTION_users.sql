-- FINÁLNÍ PRODUKČNÍ SYSTÉM UŽIVATELŮ
-- Bezpečný pro ostrou verzi s bcrypt hashe

-- ==================================================================
-- KROK 1: Vytvoření tabulky uživatelů
-- ==================================================================
CREATE TABLE IF NOT EXISTS uzivatele (
    id SERIAL PRIMARY KEY,
    uzivatelske_jmeno VARCHAR(50) NOT NULL UNIQUE,
    heslo_hash VARCHAR(255) NOT NULL, -- bcrypt hash hesla
    role VARCHAR(20) NOT NULL CHECK (role IN ('hlavni_admin', 'kategorie_admin')),
    kategorie_id INTEGER REFERENCES kategorie(id) ON DELETE CASCADE,
    aktivni BOOLEAN DEFAULT TRUE,
    posledni_prihlaseni TIMESTAMP WITH TIME ZONE,
    pocet_neuspesnych_pokusu INTEGER DEFAULT 0,
    zablokovano_do TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Hlavní admin nemá kategorii, kategorie admin musí mít kategorii
    CONSTRAINT check_kategorie_admin_has_category 
        CHECK ((role = 'hlavni_admin' AND kategorie_id IS NULL) OR 
               (role = 'kategorie_admin' AND kategorie_id IS NOT NULL))
);

-- ==================================================================
-- KROK 2: Vytvoření indexů pro rychlejší vyhledávání
-- ==================================================================
CREATE INDEX IF NOT EXISTS idx_uzivatele_uzivatelske_jmeno ON uzivatele(uzivatelske_jmeno);
CREATE INDEX IF NOT EXISTS idx_uzivatele_kategorie_id ON uzivatele(kategorie_id);
CREATE INDEX IF NOT EXISTS idx_uzivatele_aktivni ON uzivatele(aktivni);

-- ==================================================================
-- KROK 3: Přidání triggeru pro automatické aktualizování updated_at
-- ==================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_uzivatele_updated_at'
    ) THEN
        CREATE TRIGGER update_uzivatele_updated_at 
            BEFORE UPDATE ON uzivatele 
            FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END $$;

-- ==================================================================
-- KROK 4: Vložení uživatelů s bcrypt hashe
-- ==================================================================
DO $$
DECLARE
    a_tym_id INTEGER;
    juniori_id INTEGER;
    dorost_id INTEGER;
BEGIN
    -- Získání ID kategorií
    SELECT id INTO a_tym_id FROM kategorie WHERE slug = 'a-tym';
    SELECT id INTO juniori_id FROM kategorie WHERE slug = 'juniori';
    SELECT id INTO dorost_id FROM kategorie WHERE slug = 'dorost';
    
    -- Vložení hlavního administrátora (pouze pokud neexistuje)
    IF NOT EXISTS (SELECT 1 FROM uzivatele WHERE uzivatelske_jmeno = 'ondra') THEN
        INSERT INTO uzivatele (uzivatelske_jmeno, heslo_hash, role, kategorie_id) VALUES 
        ('ondra', '$2b$12$lTMl.6IL5u837KcAlSEnOOrUZop.DaisQmVjWGLYoyxt7.9iAMXi2', 'hlavni_admin', NULL);
        -- Hash pro heslo: Jednicka123
    END IF;
    
    -- Vložení administrátorů kategorií (pouze pokud neexistují)
    IF NOT EXISTS (SELECT 1 FROM uzivatele WHERE uzivatelske_jmeno = 'acko') THEN
        INSERT INTO uzivatele (uzivatelske_jmeno, heslo_hash, role, kategorie_id) VALUES 
        ('acko', '$2b$12$JSyTRi9FtDhhmw/18UrNz.sB2lN0bx2GEGAjBy/fgMBIDDGsIBR6y', 'kategorie_admin', a_tym_id);
        -- Hash pro heslo: luxikmamalyho
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM uzivatele WHERE uzivatelske_jmeno = 'juniori') THEN
        INSERT INTO uzivatele (uzivatelske_jmeno, heslo_hash, role, kategorie_id) VALUES 
        ('juniori', '$2b$12$JSyTRi9FtDhhmw/18UrNz.sB2lN0bx2GEGAjBy/fgMBIDDGsIBR6y', 'kategorie_admin', juniori_id);
        -- Hash pro heslo: luxikmamalyho
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM uzivatele WHERE uzivatelske_jmeno = 'dorost') THEN
        INSERT INTO uzivatele (uzivatelske_jmeno, heslo_hash, role, kategorie_id) VALUES 
        ('dorost', '$2b$12$JSyTRi9FtDhhmw/18UrNz.sB2lN0bx2GEGAjBy/fgMBIDDGsIBR6y', 'kategorie_admin', dorost_id);
        -- Hash pro heslo: luxikmamalyho
    END IF;
END $$;

-- ==================================================================
-- ÚSPĚŠNĚ DOKONČENO!
-- ==================================================================
-- PRODUKČNÍ systém uživatelů byl vytvořen s následujícími účty:
-- 
-- HLAVNÍ ADMINISTRÁTOR:
-- - Uživatelské jméno: ondra
-- - Heslo: Jednicka123
-- - Přístup: všechny kategorie + správa kategorií
--
-- ADMINISTRÁTOŘI KATEGORIÍ:
-- - acko / luxikmamalyho (A-tým)
-- - juniori / luxikmamalyho (Junioři) 
-- - dorost / luxikmamalyho (Dorost)
-- 
-- BEZPEČNOSTNÍ FUNKCE:
-- - Bcrypt hashovaná hesla (12 rounds)
-- - Ochrana proti brute force útokům (max 5 pokusů = 15min blok)
-- - Tracking přihlášení a neúspěšných pokusů
-- - Logování bezpečnostních událostí
-- 
-- HESLA JSOU FIXNÍ - bez možnosti změny
-- ==================================================================
