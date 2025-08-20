-- OPRAVA HESEL VŠECH UŽIVATELŮ
-- Aktualizace bcrypt hashů pro správná hesla
-- Spusť v Supabase SQL editoru

-- ==================================================================
-- AKTUALIZACE HESEL
-- ==================================================================

-- Aktualizace hesla pro ondra (Jednicka123)
UPDATE uzivatele 
SET heslo_hash = '$2b$12$Ap3RgR2mLhP8UdG.nUw59eeFxhMQPjsmW0UbjnHz.GoVchvbqKp0K'
WHERE uzivatelske_jmeno = 'ondra';

-- Aktualizace hesla pro acko (luxikmamalyho)  
UPDATE uzivatele 
SET heslo_hash = '$2b$12$xbeACluBwbPgq2z94ZqGQO2gW1.UwQncVUdHcJ8CDVRSywNJzSQ8W'
WHERE uzivatelske_jmeno = 'acko';

-- Aktualizace hesla pro juniori (luxikmamalyho)
UPDATE uzivatele 
SET heslo_hash = '$2b$12$xbeACluBwbPgq2z94ZqGQO2gW1.UwQncVUdHcJ8CDVRSywNJzSQ8W'
WHERE uzivatelske_jmeno = 'juniori';

-- Aktualizace hesla pro dorost (luxikmamalyho)
UPDATE uzivatele 
SET heslo_hash = '$2b$12$xbeACluBwbPgq2z94ZqGQO2gW1.UwQncVUdHcJ8CDVRSywNJzSQ8W'
WHERE uzivatelske_jmeno = 'dorost';

-- Reset všech neúspěšných pokusů a odblokování účtů
UPDATE uzivatele 
SET 
    pocet_neuspesnych_pokusu = 0,
    zablokovano_do = NULL
WHERE uzivatelske_jmeno IN ('ondra', 'acko', 'juniori', 'dorost');

-- ==================================================================
-- KONTROLA VÝSLEDKŮ
-- ==================================================================
SELECT 
    uzivatelske_jmeno,
    role,
    aktivni,
    pocet_neuspesnych_pokusu,
    zablokovano_do,
    kategorie_id
FROM uzivatele 
ORDER BY id;

-- ==================================================================
-- HOTOVO!
-- ==================================================================
-- Po spuštění tohoto skriptu budou fungovat tyto přihlašovací údaje:
-- 
-- ondra / Jednicka123 (hlavní admin)
-- acko / luxikmamalyho (A-tým)
-- juniori / luxikmamalyho (Junioři)
-- dorost / luxikmamalyho (Dorost)
-- ==================================================================
