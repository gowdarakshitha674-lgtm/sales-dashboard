from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3
import pandas as pd

app = Flask(__name__)
CORS(app)

# ── Database setup ──────────────────────────────────────────────
def init_db():
    data = {
        "Date": ["2024-01-01","2024-01-02","2024-01-03","2024-01-04"],
        "Region": ["East","West","North","South"],
        "Product": ["Laptop","Mobile","Tablet","Headphones"],
        "Category": ["Electronics","Electronics","Electronics","Accessories"],
        "Sales": [50000, 30000, 20000, 8000],
        "Profit": [8000, 5000, 4000, 1500],
        "Quantity": [5, 10, 7, 12],
        "Customer_Type": ["Regular","New","Regular","New"],
        "Payment_Mode": ["UPI","Cash","Card","UPI"]
    }
    df = pd.DataFrame(data)
    conn = sqlite3.connect("sales.db")
    df.to_sql("sales", conn, if_exists="replace", index=False)
    conn.close()

def get_df():
    conn = sqlite3.connect("sales.db")
    df = pd.read_sql("SELECT * FROM sales", conn)
    conn.close()
    return df

# ── Routes / API Endpoints ──────────────────────────────────────

@app.route("/api/sales")
def get_sales():
    """Return all raw transactions"""
    df = get_df()
    return jsonify(df.to_dict(orient="records"))

@app.route("/api/metrics/summary")
def summary():
    """Return top-level KPIs"""
    df = get_df()
    return jsonify({
        "total_sales": int(df["Sales"].sum()),
        "total_profit": int(df["Profit"].sum()),
        "total_quantity": int(df["Quantity"].sum()),
        "avg_sales": round(float(df["Sales"].mean()), 2),
        "avg_profit": round(float(df["Profit"].mean()), 2),
        "profit_margin": round(float(df["Profit"].sum() / df["Sales"].sum() * 100), 1),
        "top_region": df.groupby("Region")["Sales"].sum().idxmax(),
        "top_product": df.groupby("Product")["Sales"].sum().idxmax(),
    })

@app.route("/api/analytics/region")
def by_region():
    df = get_df()
    result = df.groupby("Region").agg(
        sales=("Sales","sum"), profit=("Profit","sum")
    ).reset_index()
    return jsonify(result.to_dict(orient="records"))

@app.route("/api/analytics/product")
def by_product():
    df = get_df()
    result = df.groupby("Product").agg(
        sales=("Sales","sum"), profit=("Profit","sum"), quantity=("Quantity","sum")
    ).reset_index()
    return jsonify(result.to_dict(orient="records"))

@app.route("/api/analytics/payment-mode")
def by_payment():
    df = get_df()
    counts = df["Payment_Mode"].value_counts().reset_index()
    counts.columns = ["mode", "count"]
    return jsonify(counts.to_dict(orient="records"))

@app.route("/api/analytics/customer-type")
def by_customer():
    df = get_df()
    counts = df["Customer_Type"].value_counts().reset_index()
    counts.columns = ["type", "count"]
    return jsonify(counts.to_dict(orient="records"))

@app.route("/api/analytics/trend")
def trend():
    df = get_df()
    df["Date"] = pd.to_datetime(df["Date"])
    result = df.groupby("Date").agg(sales=("Sales","sum")).reset_index()
    result["Date"] = result["Date"].dt.strftime("%Y-%m-%d")
    return jsonify(result.to_dict(orient="records"))

# ── Run ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
