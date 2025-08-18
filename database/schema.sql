-- Vytvoření tabulky pro hráče
CREATE TABLE hraci (
    id SERIAL PRIMARY KEY,
    jmeno VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('hrac', 'golman', 'trener')),
    email VARCHAR(255),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvoření tabulky pro platby
CREATE TABLE platby (
    id SERIAL PRIMARY KEY,
    hrac_id INTEGER NOT NULL REFERENCES hraci(id) ON DELETE CASCADE,
    castka INTEGER NOT NULL,
    datum DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvoření indexů pro lepší výkon
CREATE INDEX idx_pokuty_hrac_id ON pokuty(hrac_id);
CREATE INDEX idx_platby_hrac_id ON platby(hrac_id);
CREATE INDEX idx_pokuty_datum ON pokuty(datum);
CREATE INDEX idx_platby_datum ON platby(datum);

-- Vytvoření funkce pro automatické aktualizování updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Vytvoření triggerů pro automatické aktualizování updated_at
CREATE TRIGGER update_hraci_updated_at BEFORE UPDATE ON hraci FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_pokuty_updated_at BEFORE UPDATE ON pokuty FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_platby_updated_at BEFORE UPDATE ON platby FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
