# Uzbekistan Data Sources for BiznesYo'l

## Available APIs

### cbu.uz — Central Bank (BEST API)
- Exchange rates: `https://cbu.uz/uz/arkhiv-kursov-valyut/json/`
- Refinancing rate: 13.5% (2024)
- Free, no auth, JSON

### data.gov.uz — Open Data Portal (CKAN)
- API: `https://data.gov.uz/api/action/datastore_search?resource_id={id}`
- Business registry, licensing, government procurement
- Free, no auth, JSON/CSV

### stat.uz — Statistics Agency
- No direct API — XLS/PDF downloads
- Population by region, SME stats, employment data
- Updated quarterly

## Key Data Points (2024-2025)

### Average Monthly Salary by Region (mln UZS)
- Tashkent city: 6.5-7.5
- Tashkent region: 4.5-5.0
- Navoi: 5.5-6.0
- Bukhara/Samarkand: 3.5-4.0
- Surkhandarya/Kashkadarya/Jizzakh: 3.0-3.5
- National average: 4.5-5.0

### SME Statistics
- ~600,000+ active SMEs
- 54-56% of GDP
- Registration cost: ~340,000 UZS (~$27) via my.gov.uz
- Processing: 1-3 business days

### mehnat.uz — Employment Portal
- Partial API: `https://ish.mehnat.uz/api/vacancies`
- Inconsistent availability
