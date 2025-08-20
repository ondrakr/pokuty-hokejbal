# 🚀 Instrukce pro nasazení do produkce

## 📋 Přehled

Aplikace je připravena pro ostrou verzi s těmito funkcemi:
- ✅ Tři kategorie: A-tým, Junioři, Dorost
- ✅ Bezpečný login systém s bcrypt hashe
- ✅ Ochrana proti brute force útokům
- ✅ Administrace pro každou kategorii
- ✅ Hlavní administrace pro přehled všech kategorií

## 🗄️ Databázové migrace

### Krok 1: Kategorie a struktura
Spusť v Supabase SQL editoru:
```sql
-- Zkopíruj a spusť celý obsah souboru:
database/FINAL_MIGRATION_FIXED.sql
```

### Krok 2: Uživatelský systém (PRODUKCE)
Spusť v Supabase SQL editoru:
```sql
-- Zkopíruj a spusť celý obsah souboru:
database/FINAL_PRODUCTION_users.sql
```

## 👥 Přístupové údaje

### Hlavní administrátor
- **URL:** `/admin`
- **Login:** `ondra`
- **Heslo:** `Jednicka123`
- **Oprávnění:** Přístup všude + správa kategorií

### Administrátoři kategorií
- **A-tým:** `/a-tym/admin` → `acko` / `luxikmamalyho`
- **Junioři:** `/juniori/admin` → `juniori` / `luxikmamalyho`
- **Dorost:** `/dorost/admin` → `dorost` / `luxikmamalyho`

## 🌐 URL struktura

### Veřejné stránky
- `/` - výběr kategorií
- `/juniori` - evidence Juniorů
- `/a-tym` - evidence A-týmu
- `/dorost` - evidence Dorostu

### Admin stránky
- `/admin` - hlavní administrace (pouze ondra)
- `/[kategorie]/admin` - administrace kategorie

## 🔒 Bezpečnostní funkce

### Ochrana přihlášení
- ✅ **Bcrypt hashe** - 12 rounds pro maximální bezpečnost
- ✅ **Brute force ochrana** - 5 neúspěšných pokusů = 15min blokace
- ✅ **Session tracking** - 24h platnost přihlášení
- ✅ **Logování** - všechny přihlašovací pokusy se logují

### Separace oprávnění
- ✅ **Kategorie admini** vidí pouze svou kategorii
- ✅ **Hlavní admin** má přístup všude
- ✅ **Kontrola oprávnění** na každé stránce

## 📦 Nasazení

### Environment Variables
Zkopíruj `env.example` jako `.env.local` a nastav:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://tvuj-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tvuj-anon-key
NODE_ENV=production
```

### Build a Deploy
```bash
npm install
npm run build
npm start
```

### Vercel Deploy
```bash
vercel --prod
```

## 🔧 Konfigurace

### Supabase nastavení
1. **RLS (Row Level Security)** - doporučeno zapnout pro produkci
2. **API Rate Limiting** - nastav podle potřeby
3. **Backup strategie** - nastav automatické zálohy

### Doporučené monitoring
- **Supabase Dashboard** - sleduj databázové dotazy
- **Vercel Analytics** - sleduj výkon aplikace
- **Error tracking** - nastav Sentry nebo podobný nástroj

## ⚠️ Důležité poznámky

### Bezpečnost
- ✅ Hesla jsou hashovaná bcrypt s 12 rounds
- ✅ Žádné plaintext hesla v databázi
- ✅ Session management je bezpečný
- ✅ Ochrana proti CSRF a XSS

### Údržba
- 🔄 **Session cleanup** se řeší automaticky na frontendu
- 📊 **Monitoring** - sleduj logy v Supabase a Vercel
- 🔐 **Hesla jsou fixní** - žádná změna hesel není možná

## 🎯 Po nasazení

1. **Otestuj všechny účty** - přihlas se jako každý uživatel
2. **Zkontroluj oprávnění** - ověř že admini vidí jen svou kategorii
3. **Otestuj přidávání dat** - vytvoř testovací hráče a pokuty
4. **Backup** - proveď zálohu databáze

## 📞 Podpora

Pokud je něco problém:
1. Zkontroluj Supabase logy
2. Zkontroluj Vercel deployment logy
3. Zkontroluj browser console pro frontend chyby

---
**Aplikace je připravena pro produkci! 🚀**
