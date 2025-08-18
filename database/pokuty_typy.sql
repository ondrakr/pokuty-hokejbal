-- Vytvoření tabulky pro typy pokut (ceník)
CREATE TABLE pokuty_typy (
    id SERIAL PRIMARY KEY,
    nazev VARCHAR(255) NOT NULL,
    cena INTEGER NOT NULL,
    popis VARCHAR(500),
    aktivni BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvoření indexů
CREATE INDEX idx_pokuty_typy_aktivni ON pokuty_typy(aktivni);
CREATE INDEX idx_pokuty_typy_nazev ON pokuty_typy(nazev);

-- Trigger pro updated_at
CREATE TRIGGER update_pokuty_typy_updated_at 
    BEFORE UPDATE ON pokuty_typy 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Naplnění základními daty z obrázku
INSERT INTO pokuty_typy (nazev, cena, popis) VALUES
('První start', 100, 'První start v sezóně'),
('První gól', 100, 'První gól v sezóně'),
('První asistence', 50, 'První asistence v sezóně'),
('Hattrick', 200, 'Tři góly v jednom zápase'),
('Desátý gól', 50, 'Desátý gól v sezóně'),
('Vyšší trest - faul', 100, 'Faul s vyšším trestem'),
('Vyšší trest - nesportovní chování', 200, 'Nesportovní chování'),
('Neomluvený pozdní příchod na zápas', 5, 'Za každou minutu zpoždění'),
('Poprvé kapitán', 200, 'První kapitánská páska'),
('Poprvé asistent', 100, 'První asistent trenéra'),
('Vítězný gól', 20, 'Rozhodující gól'),
('Nesplněný trest (flašky, míčky, ...)', 100, 'Nesplnění uloženého trestu'),
('Trest pro trenéra', 500, 'Speciální trest pro trenéra'),
('Obdržený gól', 2, 'Gól proti brankáři'),
('Vychytaná nula', 100, 'Čisté konto brankáře');
