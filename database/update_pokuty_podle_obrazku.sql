-- AKTUALIZACE POKUT PODLE OBRÁZKU
-- Přidání všech pokut z obrázku do každé kategorie
-- Spusť tento SQL v Supabase SQL editoru

-- ==================================================================
-- KROK 1: Smazání všech současných typů pokut
-- ==================================================================
DELETE FROM pokuty_typy;

-- ==================================================================
-- KROK 2: Přidání pokut z obrázku do všech kategorií
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
    
    -- Vložení pokut pro všechny kategorie
    -- Každá kategorie bude mít stejné pokuty podle obrázku
    
    -- A-TÝM POKUTY
    INSERT INTO pokuty_typy (kategorie_id, nazev, cena, aktivni, has_quantity, unit) VALUES 
    (a_tym_id, 'První start', 100, true, false, null),
    (a_tym_id, 'První gól', 100, true, false, null),
    (a_tym_id, 'První asistence', 50, true, false, null),
    (a_tym_id, 'Hattrick', 200, true, false, null),
    (a_tym_id, 'Desátý gól', 50, true, false, null),
    (a_tym_id, 'Vyšší trest - faul', 100, true, false, null),
    (a_tym_id, 'Vyšší trest - nesportovní chování', 200, true, false, null),
    (a_tym_id, 'Neomluvený pozdní příchod na zápas', 5, true, true, 'min'),
    (a_tym_id, 'Poprvé kapitán', 200, true, false, null),
    (a_tym_id, 'Poprvé asistent', 100, true, false, null),
    (a_tym_id, 'Vítězný gól', 20, true, false, null),
    (a_tym_id, 'Nesplněný trest (flašky, míčky, ...)', 100, true, false, null),
    (a_tym_id, 'Trest pro trenéra', 500, true, false, null),
    (a_tym_id, 'Obdržený gól', 2, true, false, null),
    (a_tym_id, 'Vychytaná nula', 100, true, false, null);
    
    -- JUNIOŘI POKUTY (stejné jako A-tým)
    INSERT INTO pokuty_typy (kategorie_id, nazev, cena, aktivni, has_quantity, unit) VALUES 
    (juniori_id, 'První start', 100, true, false, null),
    (juniori_id, 'První gól', 100, true, false, null),
    (juniori_id, 'První asistence', 50, true, false, null),
    (juniori_id, 'Hattrick', 200, true, false, null),
    (juniori_id, 'Desátý gól', 50, true, false, null),
    (juniori_id, 'Vyšší trest - faul', 100, true, false, null),
    (juniori_id, 'Vyšší trest - nesportovní chování', 200, true, false, null),
    (juniori_id, 'Neomluvený pozdní příchod na zápas', 5, true, true, 'min'),
    (juniori_id, 'Poprvé kapitán', 200, true, false, null),
    (juniori_id, 'Poprvé asistent', 100, true, false, null),
    (juniori_id, 'Vítězný gól', 20, true, false, null),
    (juniori_id, 'Nesplněný trest (flašky, míčky, ...)', 100, true, false, null),
    (juniori_id, 'Trest pro trenéra', 500, true, false, null),
    (juniori_id, 'Obdržený gól', 2, true, false, null),
    (juniori_id, 'Vychytaná nula', 100, true, false, null);
    
    -- DOROST POKUTY (stejné jako A-tým)
    INSERT INTO pokuty_typy (kategorie_id, nazev, cena, aktivni, has_quantity, unit) VALUES 
    (dorost_id, 'První start', 100, true, false, null),
    (dorost_id, 'První gól', 100, true, false, null),
    (dorost_id, 'První asistence', 50, true, false, null),
    (dorost_id, 'Hattrick', 200, true, false, null),
    (dorost_id, 'Desátý gól', 50, true, false, null),
    (dorost_id, 'Vyšší trest - faul', 100, true, false, null),
    (dorost_id, 'Vyšší trest - nesportovní chování', 200, true, false, null),
    (dorost_id, 'Neomluvený pozdní příchod na zápas', 5, true, true, 'min'),
    (dorost_id, 'Poprvé kapitán', 200, true, false, null),
    (dorost_id, 'Poprvé asistent', 100, true, false, null),
    (dorost_id, 'Vítězný gól', 20, true, false, null),
    (dorost_id, 'Nesplněný trest (flašky, míčky, ...)', 100, true, false, null),
    (dorost_id, 'Trest pro trenéra', 500, true, false, null),
    (dorost_id, 'Obdržený gól', 2, true, false, null),
    (dorost_id, 'Vychytaná nula', 100, true, false, null);

END $$;

-- ==================================================================
-- ÚSPĚŠNĚ DOKONČENO!
-- ==================================================================
-- Všechny pokuty byly aktualizovány podle obrázku:
-- 
-- PŘIDANÉ POKUTY PRO VŠECHNY KATEGORIE:
-- - První start: 100 Kč
-- - První gól: 100 Kč  
-- - První asistence: 50 Kč
-- - Hattrick: 200 Kč
-- - Desátý gól: 50 Kč
-- - Vyšší trest - faul: 100 Kč
-- - Vyšší trest - nesportovní chování: 200 Kč
-- - Neomluvený pozdní příchod na zápas: 5 Kč/min
-- - Poprvé kapitán: 200 Kč
-- - Poprvé asistent: 100 Kč
-- - Vítězný gól: 20 Kč
-- - Nesplněný trest (flašky, míčky, ...): 100 Kč
-- - Trest pro trenéra: 500 Kč
-- - Obdržený gól: 2 Kč
-- - Vychytaná nula: 100 Kč
-- 
-- Každá kategorie (A-tým, Junioři, Dorost) má nyní tyto pokuty.
-- ==================================================================
