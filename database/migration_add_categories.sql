-- Migrace pro přidání podpory kategorií do existující databáze

-- Krok 1: Vytvoření tabulky kategorií
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

-- Krok 2: Vložení základních kategorií
INSERT INTO kategorie (nazev, slug, popis, poradi) VALUES 
('A-tým', 'a-tym', 'Hlavní tým dospělých hráčů', 1),
('Junioři', 'juniori', 'Juniorské družstvo', 2),
('Dorost', 'dorost', 'Dorostenci', 3);

-- Krok 3: Přidání sloupce kategorie_id do existujících tabulek
ALTER TABLE hraci ADD COLUMN IF NOT EXISTS kategorie_id INTEGER;
ALTER TABLE pokuty ADD COLUMN IF NOT EXISTS kategorie_id INTEGER;
ALTER TABLE platby ADD COLUMN IF NOT EXISTS kategorie_id INTEGER;

-- Krok 4: Nastavení výchozí kategorie (Junioři) pro existující data
UPDATE hraci SET kategorie_id = (SELECT id FROM kategorie WHERE slug = 'juniori') WHERE kategorie_id IS NULL;
UPDATE pokuty SET kategorie_id = (SELECT id FROM kategorie WHERE slug = 'juniori') WHERE kategorie_id IS NULL;
UPDATE platby SET kategorie_id = (SELECT id FROM kategorie WHERE slug = 'juniori') WHERE kategorie_id IS NULL;

-- Krok 5: Přidání NOT NULL constraints po nastavení hodnot
ALTER TABLE hraci ALTER COLUMN kategorie_id SET NOT NULL;
ALTER TABLE pokuty ALTER COLUMN kategorie_id SET NOT NULL;
ALTER TABLE platby ALTER COLUMN kategorie_id SET NOT NULL;

-- Krok 6: Přidání foreign key constraints
ALTER TABLE hraci ADD CONSTRAINT fk_hraci_kategorie FOREIGN KEY (kategorie_id) REFERENCES kategorie(id) ON DELETE CASCADE;
ALTER TABLE pokuty ADD CONSTRAINT fk_pokuty_kategorie FOREIGN KEY (kategorie_id) REFERENCES kategorie(id) ON DELETE CASCADE;
ALTER TABLE platby ADD CONSTRAINT fk_platby_kategorie FOREIGN KEY (kategorie_id) REFERENCES kategorie(id) ON DELETE CASCADE;

-- Krok 7: Vytvoření/úprava tabulky pokuty_typy s kategoriemi
CREATE TABLE IF NOT EXISTS pokuty_typy (
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

-- Krok 8: Vytvoření indexů
CREATE INDEX IF NOT EXISTS idx_hraci_kategorie_id ON hraci(kategorie_id);
CREATE INDEX IF NOT EXISTS idx_pokuty_kategorie_id ON pokuty(kategorie_id);
CREATE INDEX IF NOT EXISTS idx_platby_kategorie_id ON platby(kategorie_id);
CREATE INDEX IF NOT EXISTS idx_pokuty_typy_kategorie_id ON pokuty_typy(kategorie_id);
CREATE INDEX IF NOT EXISTS idx_kategorie_slug ON kategorie(slug);

-- Krok 9: Přidání trigger pro kategorie
CREATE TRIGGER IF NOT EXISTS update_kategorie_updated_at 
    BEFORE UPDATE ON kategorie 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_pokuty_typy_updated_at 
    BEFORE UPDATE ON pokuty_typy 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
