# Sales Dashboard — Full Stack

## Architecture
```
┌──────────────────┐        HTTP        ┌──────────────────────┐
│  React Frontend  │  ←──────────────→  │   Flask Backend API  │
│  (port 3000)     │   REST JSON APIs   │   (port 5000)        │
└──────────────────┘                    └──────────┬───────────┘
                                                   │ SQL queries
                                          ┌────────▼────────┐
                                          │  SQLite DB       │
                                          │  (sales.db)      │
                                          └─────────────────┘
```

## Backend setup (Flask)

```bash
cd backend
pip install flask flask-cors pandas
python app.py
```

API endpoints:
- GET /api/sales                    → all transactions
- GET /api/metrics/summary          → KPIs (total sales, profit, top region, etc.)
- GET /api/analytics/region         → sales & profit grouped by region
- GET /api/analytics/product        → sales grouped by product
- GET /api/analytics/payment-mode   → payment mode counts
- GET /api/analytics/customer-type  → customer type breakdown
- GET /api/analytics/trend          → daily sales trend

## Frontend setup (React)

```bash
cd frontend
npx create-react-app .     # or: npm create vite@latest . -- --template react
cp src/App.jsx src/App.jsx  # already done
npm install
npm start
```

## How it maps to your original notebook

| Notebook step         | Full-stack equivalent               |
|-----------------------|-------------------------------------|
| pandas DataFrame      | SQLite DB (sales.db)                |
| groupby / .sum()      | Flask route → SQL query via pandas  |
| print() output        | JSON API response                   |
| plt.show() charts     | React bar charts & pie chart        |
| Colab cell execution  | HTTP GET from browser               |
