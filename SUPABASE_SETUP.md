# Průvodce nastavením Supabase pro aplikaci Pokuty Hokejbal

## 1. Vytvoření Supabase projektu

1. Jdi na [supabase.com](https://supabase.com)
2. Přihlas se nebo si vytvoř účet
3. Klikni na "New project"
4. Vyber organizaci (nebo vytvoř novou)
5. Zadej název projektu: `pokuty-hokejbal`
6. Vytvoř silné heslo pro databázi
7. Vyber region (nejlepší je Frankfurt pro Evropu)
8. Klikni "Create new project"

## 2. Nastavení databáze

### Spuštění SQL schématu

1. V Supabase dashboardu jdi do sekce "SQL Editor"
2. Otevři soubor `database/schema.sql` z projektu
3. Zkopíruj celý obsah a vlož ho do SQL editoru
4. Klikni "Run" pro vytvoření tabulek

### Naplnění dat

1. V SQL Editoru otevři nový dotaz
2. Zkopíruj obsah souboru `database/seed.sql`
3. Vlož ho do editoru a spusť pomocí "Run"
4. Zkontroluj v sekci "Table Editor", že máš data v tabulkách:
   - `hraci` - 20 hráčů
   - `pokuty` - 8 pokut
   - `platby` - prázdná tabulka

## 3. Získání přístupových údajů

1. V Supabase dashboardu jdi do "Settings" → "API"
2. Najdi sekci "Project API keys"
3. Zkopíruj:
   - **Project URL** (začíná https://...)
   - **anon public key** (dlouhý řetězec)

## 4. Nastavení environment variables

### Pro lokální vývoj:
Vytvoř soubor `.env.local` v root složce projektu:

```
NEXT_PUBLIC_SUPABASE_URL=tvoje_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tvuj_anon_key
```

### Pro Vercel deployment:

1. Jdi do Vercel dashboardu
2. Vyber svůj projekt
3. Jdi do "Settings" → "Environment Variables"
4. Přidej tyto proměnné:
   - `NEXT_PUBLIC_SUPABASE_URL` = tvoje project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tvůj anon key

## 5. Instalace závislostí

Spusť v terminálu:

```bash
npm install
```

## 6. Test aplikace

### Lokálně:
```bash
npm run dev
```

### Na Vercelu:
Po nastavení environment variables v Vercelu spusť nový deployment.

## 7. Ověření funkčnosti

1. Otevři aplikaci v prohlížeči
2. Zkontroluj, že se zobrazují hráči a pokuty
3. Zkus přidat nového hráče v admin sekci (`/admin`)
4. Zkus přidat novou pokutu
5. Zkontroluj v Supabase Table Editoru, že se data ukládají

## 8. Nastavení RLS (Row Level Security) - volitelné

Pro produkční použití doporučuji nastavit RLS politiky:

1. V Supabase jdi do "Authentication" → "Policies"
2. Pro každou tabulku nastav politiky podle potřeby
3. Momentálně je aplikace nastavena pro veřejný přístup

## Řešení problémů

### Chyba "Failed to fetch"
- Zkontroluj environment variables
- Zkontroluj, že Supabase projekt běží
- Zkontroluj URL a API key

### Chyba při načítání dat
- Zkontroluj v Supabase Logs, co se děje
- Ověř, že tabulky obsahují data
- Zkontroluj SQL dotazy v Network tabu

### Deployment na Vercel nefunguje
- Zkontroluj environment variables v Vercel
- Ujisti se, že jsou správně nastaveny pro Production
- Zkus rebuild aplikace

## Migrace existujících dat

Pokud máš další data v JSON souborech, můžeš je migrovat pomocí SQL dotazů:

```sql
-- Příklad přidání hráče
INSERT INTO hraci (jmeno, role, email) VALUES ('Nový Hráč', 'hrac', 'email@example.com');

-- Příklad přidání pokuty
INSERT INTO pokuty (hrac_id, typ, castka, datum, zaplaceno) 
VALUES (1, 'Nový typ pokuty', 100, '2024-02-10', false);
```

## Hotovo! 🎉

Tvoje aplikace by teď měla fungovat s Supabase databází na Vercelu.
