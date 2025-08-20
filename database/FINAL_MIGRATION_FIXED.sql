-- OPRAVENÁ KOMPLETNÍ MIGRACE PRO PODPORU KATEGORIÍ
-- Spusť tento SQL v Supabase SQL editoru

-- ==================================================================
-- KROK 1: Vytvoření tabulky kategorií
-- ==================================================================
CREATE TABLE IF NOT EXISTS kategorie (
    id SERIAL PRIMARY KEY,
    nazev VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    popis TEXT,
    aktivni BOOLEAN DEFAULT TRUE,
    poradi INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================================
-- KROK 2: Vložení základních kategorií (pouze pokud neexistují)
-- ==================================================================
DO $$
BEGIN
    -- Vložení kategorií pouze pokud neexistují
    IF NOT EXISTS (SELECT 1 FROM kategorie WHERE slug = 'a-tym') THEN
        INSERT INTO kategorie (nazev, slug, popis, poradi) VALUES 
        ('A-tým', 'a-tym', 'Hlavní tým dospělých hráčů', 1);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM kategorie WHERE slug = 'juniori') THEN
        INSERT INTO kategorie (nazev, slug, popis, poradi) VALUES 
        ('Junioři', 'juniori', 'Juniorské družstvo', 2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM kategorie WHERE slug = 'dorost') THEN
        INSERT INTO kategorie (nazev, slug, popis, poradi) VALUES 
        ('Dorost', 'dorost', 'Dorostenci', 3);
    END IF;
END $$;

-- ==================================================================
-- KROK 3: Přidání triggerů pro kategorii (musí být před pokuty_typy)
-- ==================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_kategorie_updated_at'
    ) THEN
        CREATE TRIGGER update_kategorie_updated_at 
            BEFORE UPDATE ON kategorie 
            FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END $$;

-- ==================================================================
-- KROK 4: Kontrola a úprava tabulky pokuty_typy
-- ==================================================================
DO $$
BEGIN
    -- Nejdříve zkontrolujeme, zda tabulka pokuty_typy existuje
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pokuty_typy') THEN
        -- Tabulka existuje, přidáme kategorie_id pokud neexistuje
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'pokuty_typy' AND column_name = 'kategorie_id'
        ) THEN
            -- Přidáme sloupec nejdříve jako nullable
            ALTER TABLE pokuty_typy ADD COLUMN kategorie_id INTEGER;
            
            -- Nastavíme výchozí hodnotu (Junioři) pro existující záznamy
            UPDATE pokuty_typy 
            SET kategorie_id = (SELECT id FROM kategorie WHERE slug = 'juniori') 
            WHERE kategorie_id IS NULL;
            
            -- Nyní nastavíme NOT NULL a foreign key
            ALTER TABLE pokuty_typy ALTER COLUMN kategorie_id SET NOT NULL;
            ALTER TABLE pokuty_typy ADD CONSTRAINT fk_pokuty_typy_kategorie 
            FOREIGN KEY (kategorie_id) REFERENCES kategorie(id) ON DELETE CASCADE;
        END IF;
    ELSE
        -- Tabulka neexistuje, vytvoříme ji kompletně
        CREATE TABLE pokuty_typy (
            id SERIAL PRIMARY KEY,
            nazev VARCHAR(255) NOT NULL,
            cena INTEGER NOT NULL,
            popis TEXT,
            aktivni BOOLEAN DEFAULT TRUE,
            has_quantity BOOLEAN DEFAULT FALSE,
            unit VARCHAR(50),
            kategorie_id INTEGER NOT NULL REFERENCES kategorie(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- ==================================================================
-- KROK 5: Přidání sloupce kategorie_id do existujících tabulek
-- ==================================================================
DO $$
BEGIN
    -- Přidání kategorie_id do hraci pokud neexistuje
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'hraci' AND column_name = 'kategorie_id'
    ) THEN
        ALTER TABLE hraci ADD COLUMN kategorie_id INTEGER;
    END IF;
    
    -- Přidání kategorie_id do pokuty pokud neexistuje
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pokuty' AND column_name = 'kategorie_id'
    ) THEN
        ALTER TABLE pokuty ADD COLUMN kategorie_id INTEGER;
    END IF;
    
    -- Přidání kategorie_id do platby pokud neexistuje
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'platby' AND column_name = 'kategorie_id'
    ) THEN
        ALTER TABLE platby ADD COLUMN kategorie_id INTEGER;
    END IF;
END $$;

-- ==================================================================
-- KROK 6: Nastavení výchozí kategorie (Junioři) pro existující data
-- ==================================================================
UPDATE hraci 
SET kategorie_id = (SELECT id FROM kategorie WHERE slug = 'juniori') 
WHERE kategorie_id IS NULL;

UPDATE pokuty 
SET kategorie_id = (SELECT id FROM kategorie WHERE slug = 'juniori') 
WHERE kategorie_id IS NULL;

UPDATE platby 
SET kategorie_id = (SELECT id FROM kategorie WHERE slug = 'juniori') 
WHERE kategorie_id IS NULL;

-- ==================================================================
-- KROK 7: Přidání NOT NULL constraints po nastavení hodnot
-- ==================================================================
ALTER TABLE hraci ALTER COLUMN kategorie_id SET NOT NULL;
ALTER TABLE pokuty ALTER COLUMN kategorie_id SET NOT NULL;
ALTER TABLE platby ALTER COLUMN kategorie_id SET NOT NULL;

-- ==================================================================
-- KROK 8: Přidání foreign key constraints (pokud neexistují)
-- ==================================================================
DO $$
BEGIN
    -- Foreign key pro hraci
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_hraci_kategorie'
    ) THEN
        ALTER TABLE hraci ADD CONSTRAINT fk_hraci_kategorie 
        FOREIGN KEY (kategorie_id) REFERENCES kategorie(id) ON DELETE CASCADE;
    END IF;
    
    -- Foreign key pro pokuty
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_pokuty_kategorie'
    ) THEN
        ALTER TABLE pokuty ADD CONSTRAINT fk_pokuty_kategorie 
        FOREIGN KEY (kategorie_id) REFERENCES kategorie(id) ON DELETE CASCADE;
    END IF;
    
    -- Foreign key pro platby
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_platby_kategorie'
    ) THEN
        ALTER TABLE platby ADD CONSTRAINT fk_platby_kategorie 
        FOREIGN KEY (kategorie_id) REFERENCES kategorie(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ==================================================================
-- KROK 9: Vytvoření indexů pro lepší výkon
-- ==================================================================
CREATE INDEX IF NOT EXISTS idx_hraci_kategorie_id ON hraci(kategorie_id);
CREATE INDEX IF NOT EXISTS idx_pokuty_kategorie_id ON pokuty(kategorie_id);
CREATE INDEX IF NOT EXISTS idx_platby_kategorie_id ON platby(kategorie_id);
CREATE INDEX IF NOT EXISTS idx_pokuty_typy_kategorie_id ON pokuty_typy(kategorie_id);
CREATE INDEX IF NOT EXISTS idx_kategorie_slug ON kategorie(slug);

-- ==================================================================
-- KROK 10: Přidání triggeru pro pokuty_typy
-- ==================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_pokuty_typy_updated_at'
    ) THEN
        CREATE TRIGGER update_pokuty_typy_updated_at 
            BEFORE UPDATE ON pokuty_typy 
            FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END $$;

-- ==================================================================
-- KROK 11: Vložení základních typů pokut pro všechny kategorie
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
    
    -- Vložení pokut pro A-tým (pouze pokud neexistují)
    IF NOT EXISTS (SELECT 1 FROM pokuty_typy WHERE kategorie_id = a_tym_id) THEN
        INSERT INTO pokuty_typy (kategorie_id, nazev, cena, popis, aktivni) VALUES 
        (a_tym_id, 'Pozdní příchod', 50, 'Pozdní příchod na trénink nebo zápas', true),
        (a_tym_id, 'Absence bez omluvy', 100, 'Neomluvaná absence na tréninku', true),
        (a_tym_id, 'Žlutá karta', 20, 'Žlutá karta v zápase', true),
        (a_tym_id, 'Červená karta', 100, 'Červená karta v zápase', true),
        (a_tym_id, 'Špatné chování', 200, 'Nevhodné chování vůči rozhodčím nebo soupeři', true);
    END IF;
    
    -- Vložení pokut pro Junioře (pouze pokud neexistují)
    IF NOT EXISTS (SELECT 1 FROM pokuty_typy WHERE kategorie_id = juniori_id) THEN
        INSERT INTO pokuty_typy (kategorie_id, nazev, cena, popis, aktivni) VALUES 
        (juniori_id, 'Pozdní příchod', 30, 'Pozdní příchod na trénink nebo zápas', true),
        (juniori_id, 'Absence bez omluvy', 50, 'Neomluvaná absence na tréninku', true),
        (juniori_id, 'Žlutá karta', 15, 'Žlutá karta v zápase', true),
        (juniori_id, 'Červená karta', 60, 'Červená karta v zápase', true),
        (juniori_id, 'Zapomenuté vybavení', 25, 'Zapomenutí hokejky, míčku nebo dresu', true);
    END IF;
    
    -- Vložení pokut pro Dorost (pouze pokud neexistují)
    IF NOT EXISTS (SELECT 1 FROM pokuty_typy WHERE kategorie_id = dorost_id) THEN
        INSERT INTO pokuty_typy (kategorie_id, nazev, cena, popis, aktivni) VALUES 
        (dorost_id, 'Pozdní příchod', 20, 'Pozdní příchod na trénink nebo zápas', true),
        (dorost_id, 'Absence bez omluvy', 40, 'Neomluvaná absence na tréninku', true),
        (dorost_id, 'Žlutá karta', 10, 'Žlutá karta v zápase', true),
        (dorost_id, 'Červená karta', 50, 'Červená karta v zápase', true),
        (dorost_id, 'Zapomenuté vybavení', 15, 'Zapomenutí hokejky, míčku nebo dresu', true);
    END IF;
END $$;

-- ==================================================================
-- ÚSPĚŠNĚ DOKONČENO!
-- ==================================================================
-- Migrace byla úspěšně provedena. Tvoje aplikace nyní podporuje:
-- - 3 kategorie: A-tým, Junioři, Dorost
-- - Každá kategorie má vlastní hráče, pokuty a typy pokut
-- - Existující data byla přiřazena ke kategorii "Junioři"
-- - Základní typy pokut byly přidány pro všechny kategorie
-- 
-- Můžeš nyní používat URL:
-- - / (výběr kategorií)
-- - /juniori (Junioři)
-- - /a-tym (A-tým) 
-- - /dorost (Dorost)
-- ==================================================================
