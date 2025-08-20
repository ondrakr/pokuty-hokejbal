-- Nové schéma databáze s podporou kategorií

-- Vytvoření tabulky pro kategorie
CREATE TABLE kategorie (
    id SERIAL PRIMARY KEY,
    nazev VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,  -- URL friendly název (a-tym, juniori, dorost)
    popis TEXT,
    aktivni BOOLEAN DEFAULT TRUE,
    poradi INTEGER DEFAULT 0,  -- pro řazení kategorií
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvoření tabulky pro hráče s kategorií
CREATE TABLE hraci (
    id SERIAL PRIMARY KEY,
    jmeno VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('hrac', 'golman', 'trener')),
    email VARCHAR(255),
    kategorie_id INTEGER NOT NULL REFERENCES kategorie(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvoření tabulky pro typy pokut s kategorií
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

-- Vytvoření tabulky pro pokuty
CREATE TABLE pokuty (
    id SERIAL PRIMARY KEY,
    hrac_id INTEGER NOT NULL REFERENCES hraci(id) ON DELETE CASCADE,
    typ VARCHAR(255) NOT NULL,
    castka INTEGER NOT NULL,
    datum DATE NOT NULL,
    zaplaceno BOOLEAN DEFAULT FALSE,
    kategorie_id INTEGER NOT NULL REFERENCES kategorie(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvoření tabulky pro platby
CREATE TABLE platby (
    id SERIAL PRIMARY KEY,
    hrac_id INTEGER NOT NULL REFERENCES hraci(id) ON DELETE CASCADE,
    castka INTEGER NOT NULL,
    datum DATE NOT NULL,
    kategorie_id INTEGER NOT NULL REFERENCES kategorie(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvoření indexů pro lepší výkon
CREATE INDEX idx_hraci_kategorie_id ON hraci(kategorie_id);
CREATE INDEX idx_pokuty_typy_kategorie_id ON pokuty_typy(kategorie_id);
CREATE INDEX idx_pokuty_kategorie_id ON pokuty(kategorie_id);
CREATE INDEX idx_pokuty_hrac_id ON pokuty(hrac_id);
CREATE INDEX idx_platby_kategorie_id ON platby(kategorie_id);
CREATE INDEX idx_platby_hrac_id ON platby(hrac_id);
CREATE INDEX idx_pokuty_datum ON pokuty(datum);
CREATE INDEX idx_platby_datum ON platby(datum);
CREATE INDEX idx_kategorie_slug ON kategorie(slug);

-- Vytvoření funkce pro automatické aktualizování updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Vytvoření triggerů pro automatické aktualizování updated_at
CREATE TRIGGER update_kategorie_updated_at BEFORE UPDATE ON kategorie FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_hraci_updated_at BEFORE UPDATE ON hraci FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_pokuty_typy_updated_at BEFORE UPDATE ON pokuty_typy FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_pokuty_updated_at BEFORE UPDATE ON pokuty FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_platby_updated_at BEFORE UPDATE ON platby FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
