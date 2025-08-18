-- Vložení hráčů
INSERT INTO hraci (id, jmeno, role) VALUES
(1, 'Vychytil Petr', 'trener'),
(3, 'Bár Oldřich', 'hrac'),
(4, 'Bednář Jakub', 'hrac'),
(5, 'Červený Vojtěch', 'hrac'),
(6, 'Havlásek Jakub', 'hrac'),
(7, 'Kačurik David', 'hrac'),
(8, 'Kloupar Miroslav', 'hrac'),
(9, 'Kopecký Miroslav', 'hrac'),
(10, 'Krejčí Ondřej', 'hrac'),
(11, 'Lux Tomáš', 'hrac'),
(12, 'Marek Petr', 'hrac'),
(13, 'Neruda Martin', 'hrac'),
(14, 'Pavlásek Dušan', 'golman'),
(16, 'Pražák Ondřej', 'hrac'),
(17, 'Rous Matěj', 'hrac'),
(18, 'Schwach Petr', 'hrac'),
(20, 'Šafář Pavel', 'hrac'),
(21, 'Šmídek Jaroslav', 'hrac'),
(22, 'Šťovíček Jáchym', 'hrac'),
(23, 'Vencl Radek', 'hrac');

-- Nastavení sequence pro další záznamy
SELECT setval('hraci_id_seq', (SELECT MAX(id) FROM hraci));

-- Vložení pokut
INSERT INTO pokuty (id, hrac_id, typ, castka, datum, zaplaceno) VALUES
(1, 1, 'První gól', 100, '2024-01-15', false),
(2, 1, 'Vítězný gól', 20, '2024-01-20', true),
(3, 3, 'První start', 100, '2024-01-18', false),
(4, 3, 'Vychytaná nula', 100, '2024-01-22', false),
(5, 4, 'Hattrick', 200, '2024-01-25', false),
(6, 5, 'Poprvé kapitán', 200, '2024-01-28', true),
(7, 1, 'První asistence', 50, '2024-02-01', false),
(8, 3, 'Obdržený gól', 2, '2024-02-05', false);

-- Nastavení sequence pro další záznamy
SELECT setval('pokuty_id_seq', (SELECT MAX(id) FROM pokuty));

-- Nastavení sequence pro platby
SELECT setval('platby_id_seq', 1, false);
