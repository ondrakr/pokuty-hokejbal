-- Seed data pro kategorie a jejich typy pokut

-- Nejdříve zkontrolujeme, zda kategorie existují, a pokud ne, vložíme je
DO $$
BEGIN
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

-- Vložení základních typů pokut pro každou kategorii
INSERT INTO pokuty_typy (nazev, cena, popis, aktivni, kategorie_id) VALUES 
-- A-tým pokuty
((SELECT id FROM kategorie WHERE slug = 'a-tym'), 'Pozdní příchod', 50, 'Pozdní příchod na trénink nebo zápas', true),
((SELECT id FROM kategorie WHERE slug = 'a-tym'), 'Absence bez omluvy', 100, 'Neomluvaná absence na tréninku', true),
((SELECT id FROM kategorie WHERE slug = 'a-tym'), 'Žlutá karta', 20, 'Žlutá karta v zápase', true),
((SELECT id FROM kategorie WHERE slug = 'a-tym'), 'Červená karta', 100, 'Červená karta v zápase', true),
((SELECT id FROM kategorie WHERE slug = 'a-tym'), 'Špatné chování', 200, 'Nevhodné chování vůči rozhodčím nebo soupeři', true),

-- Junioři pokuty  
((SELECT id FROM kategorie WHERE slug = 'juniori'), 'Pozdní příchod', 30, 'Pozdní příchod na trénink nebo zápas', true),
((SELECT id FROM kategorie WHERE slug = 'juniori'), 'Absence bez omluvy', 50, 'Neomluvaná absence na tréninku', true),
((SELECT id FROM kategorie WHERE slug = 'juniori'), 'Žlutá karta', 15, 'Žlutá karta v zápase', true),
((SELECT id FROM kategorie WHERE slug = 'juniori'), 'Červená karta', 60, 'Červená karta v zápase', true),
((SELECT id FROM kategorie WHERE slug = 'juniori'), 'Zapomenuté vybavení', 25, 'Zapomenutí hokejky, míčku nebo dresu', true),

-- Dorost pokuty
((SELECT id FROM kategorie WHERE slug = 'dorost'), 'Pozdní příchod', 20, 'Pozdní příchod na trénink nebo zápas', true),
((SELECT id FROM kategorie WHERE slug = 'dorost'), 'Absence bez omluvy', 40, 'Neomluvaná absence na tréninku', true),
((SELECT id FROM kategorie WHERE slug = 'dorost'), 'Žlutá karta', 10, 'Žlutá karta v zápase', true),
((SELECT id FROM kategorie WHERE slug = 'dorost'), 'Červená karta', 50, 'Červená karta v zápase', true),
((SELECT id FROM kategorie WHERE slug = 'dorost'), 'Zapomenuté vybavení', 15, 'Zapomenutí hokejky, míčku nebo dresu', true);

-- Oprava syntaxe - kategorie_id musí být první parametr
DELETE FROM pokuty_typy WHERE 1=1; -- Smazání případných špatných záznamů

INSERT INTO pokuty_typy (kategorie_id, nazev, cena, popis, aktivni) VALUES 
-- A-tým pokuty
((SELECT id FROM kategorie WHERE slug = 'a-tym'), 'Pozdní příchod', 50, 'Pozdní příchod na trénink nebo zápas', true),
((SELECT id FROM kategorie WHERE slug = 'a-tym'), 'Absence bez omluvy', 100, 'Neomluvaná absence na tréninku', true),
((SELECT id FROM kategorie WHERE slug = 'a-tym'), 'Žlutá karta', 20, 'Žlutá karta v zápase', true),
((SELECT id FROM kategorie WHERE slug = 'a-tym'), 'Červená karta', 100, 'Červená karta v zápase', true),
((SELECT id FROM kategorie WHERE slug = 'a-tym'), 'Špatné chování', 200, 'Nevhodné chování vůči rozhodčím nebo soupeři', true),

-- Junioři pokuty  
((SELECT id FROM kategorie WHERE slug = 'juniori'), 'Pozdní příchod', 30, 'Pozdní příchod na trénink nebo zápas', true),
((SELECT id FROM kategorie WHERE slug = 'juniori'), 'Absence bez omluvy', 50, 'Neomluvaná absence na tréninku', true),
((SELECT id FROM kategorie WHERE slug = 'juniori'), 'Žlutá karta', 15, 'Žlutá karta v zápase', true),
((SELECT id FROM kategorie WHERE slug = 'juniori'), 'Červená karta', 60, 'Červená karta v zápase', true),
((SELECT id FROM kategorie WHERE slug = 'juniori'), 'Zapomenuté vybavení', 25, 'Zapomenutí hokejky, míčku nebo dresu', true),

-- Dorost pokuty
((SELECT id FROM kategorie WHERE slug = 'dorost'), 'Pozdní příchod', 20, 'Pozdní příchod na trénink nebo zápas', true),
((SELECT id FROM kategorie WHERE slug = 'dorost'), 'Absence bez omluvy', 40, 'Neomluvaná absence na tréninku', true),
((SELECT id FROM kategorie WHERE slug = 'dorost'), 'Žlutá karta', 10, 'Žlutá karta v zápase', true),
((SELECT id FROM kategorie WHERE slug = 'dorost'), 'Červená karta', 50, 'Červená karta v zápase', true),
((SELECT id FROM kategorie WHERE slug = 'dorost'), 'Zapomenuté vybavení', 15, 'Zapomenutí hokejky, míčku nebo dresu', true);
