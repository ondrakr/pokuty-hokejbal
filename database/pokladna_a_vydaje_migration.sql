-- Migrace pro přidání podpory pokladny a výdajů

-- Tabulka pro evidenci celkové částky v pokladně pro každou kategorii
CREATE TABLE IF NOT EXISTS pokladna (
    id SERIAL PRIMARY KEY,
    kategorie_id INTEGER NOT NULL REFERENCES kategorie(id) ON DELETE CASCADE,
    celkova_castka INTEGER NOT NULL DEFAULT 0, -- částka v haléřích
    popis TEXT, -- popis původu částky (např. "Částka z předchozí sezóny")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Jedna pokladna na kategorii
    UNIQUE(kategorie_id)
);

-- Tabulka pro evidenci výdajů
CREATE TABLE IF NOT EXISTS vydaje (
    id SERIAL PRIMARY KEY,
    kategorie_id INTEGER NOT NULL REFERENCES kategorie(id) ON DELETE CASCADE,
    castka INTEGER NOT NULL, -- částka v haléřích
    popis TEXT NOT NULL, -- za co byly výdaje
    datum DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexy pro lepší výkon
CREATE INDEX IF NOT EXISTS idx_pokladna_kategorie_id ON pokladna(kategorie_id);
CREATE INDEX IF NOT EXISTS idx_vydaje_kategorie_id ON vydaje(kategorie_id);
CREATE INDEX IF NOT EXISTS idx_vydaje_datum ON vydaje(datum);

-- Trigger pro automatické aktualizování updated_at pro pokladnu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pokladna_updated_at 
    BEFORE UPDATE ON pokladna 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_vydaje_updated_at 
    BEFORE UPDATE ON vydaje 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Vložení výchozích záznamů pro existující kategorie
INSERT INTO pokladna (kategorie_id, celkova_castka, popis)
SELECT id, 0, 'Počáteční částka - možno upravit ručně'
FROM kategorie 
WHERE NOT EXISTS (
    SELECT 1 FROM pokladna WHERE pokladna.kategorie_id = kategorie.id
);

-- Komentáře pro dokumentaci
COMMENT ON TABLE pokladna IS 'Eviduje celkovou částku v pokladně pro každou kategorii';
COMMENT ON COLUMN pokladna.celkova_castka IS 'Celková částka v pokladně v haléřích';
COMMENT ON COLUMN pokladna.popis IS 'Popis původu částky (např. z předchozí sezóny)';

COMMENT ON TABLE vydaje IS 'Evidence výdajů pro každou kategorii';
COMMENT ON COLUMN vydaje.castka IS 'Částka výdaje v haléřích';
COMMENT ON COLUMN vydaje.popis IS 'Popis za co byly výdaje';
