import { useState, useEffect } from "react";

const API = "http://sales-dashboard-production-37a7.up.railway.app/api";

// ── Small reusable components ──────────────────────────────────

function MetricCard({ icon, label, value, sub }) {
  return (
    <div style={{
      background: "#f8f9fa", borderRadius: 10, padding: "1rem 1.25rem",
      border: "1px solid #e9ecef"
    }}>
      <div style={{ fontSize: 12, color: "#868e96", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>{label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: "#212529" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#adb5bd", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function BarChart({ title, data, color = "#4361ee" }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ background: "#fff", border: "1px solid #e9ecef", borderRadius: 12, padding: "1.25rem" }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: "#868e96", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</h3>
      {data.map(d => (
        <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 70, fontSize: 13, color: "#495057", flexShrink: 0 }}>{d.label}</div>
          <div style={{ flex: 1, height: 8, background: "#f1f3f5", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(d.value / max) * 100}%`, background: color, borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 12, color: "#868e96", width: 60, textAlign: "right", flexShrink: 0 }}>
            ₹{d.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ value, map }) {
  const cfg = map[value] || { bg: "#f1f3f5", color: "#495057" };
  return (
    <span style={{ background: cfg.bg, color: cfg.color, fontSize: 11, padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>
      {value}
    </span>
  );
}

// ── Main App ───────────────────────────────────────────────────

export default function SalesDashboard() {
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/metrics/summary`).then(r => r.json()),
      fetch(`${API}/sales`).then(r => r.json()),
      fetch(`${API}/analytics/region`).then(r => r.json()),
      fetch(`${API}/analytics/payment-mode`).then(r => r.json()),
    ])
      .then(([s, sl, rd, pd]) => {
        setSummary(s);
        setSales(sl);
        setRegionData(rd);
        setPaymentData(pd);
        setLoading(false);
      })
      .catch(e => { setError("Could not reach backend — is Flask running?"); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: "2rem", color: "#868e96" }}>Loading from API…</div>;
  if (error)   return <div style={{ padding: "2rem", color: "#e03131" }}>{error}</div>;

  const regionBars = regionData.map(r => ({ label: r.Region, value: r.sales }));
  const profitBars = regionData.map(r => ({ label: r.Region, value: r.profit }));

  const regionColors = { East: { bg: "#e7f5ff", color: "#1971c2" }, West: { bg: "#fff3bf", color: "#e67700" }, North: { bg: "#ebfbee", color: "#2f9e44" }, South: { bg: "#fff0f6", color: "#c2255c" } };
  const customerColors = { Regular: { bg: "#ebfbee", color: "#2f9e44" }, New: { bg: "#e7f5ff", color: "#1971c2" } };
  const paymentColors = { UPI: { bg: "#f3f0ff", color: "#7048e8" }, Cash: { bg: "#ebfbee", color: "#2f9e44" }, Card: { bg: "#fff3bf", color: "#e67700" } };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#212529" }}>📊 Sales Dashboard</h1>
        <span style={{ fontSize: 12, color: "#868e96", background: "#f1f3f5", padding: "4px 10px", borderRadius: 8 }}>
          Flask + SQLite → React
        </span>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
        <MetricCard icon="💰" label="Total Sales"    value={`₹${summary.total_sales.toLocaleString()}`}  sub={`${summary.total_quantity} units`} />
        <MetricCard icon="📈" label="Total Profit"   value={`₹${summary.total_profit.toLocaleString()}`} sub={`${summary.profit_margin}% margin`} />
        <MetricCard icon="🏆" label="Top Region"     value={summary.top_region}   sub="by sales" />
        <MetricCard icon="📦" label="Top Product"    value={summary.top_product}  sub="by sales" />
      </div>

      {/* Bar Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <BarChart title="Sales by region"  data={regionBars} color="#4361ee" />
        <BarChart title="Profit by region" data={profitBars} color="#2f9e44" />
      </div>

      {/* Payment donut + summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div style={{ background: "#fff", border: "1px solid #e9ecef", borderRadius: 12, padding: "1.25rem" }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#868e96", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment modes</h3>
          {paymentData.map(p => (
            <div key={p.mode} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
              <StatusBadge value={p.mode} map={paymentColors} />
              <span style={{ fontSize: 13, color: "#495057" }}>{p.count} order{p.count > 1 ? "s" : ""}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", border: "1px solid #e9ecef", borderRadius: 12, padding: "1.25rem" }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#868e96", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Key insights</h3>
          <div style={{ fontSize: 13, color: "#495057", lineHeight: 1.8 }}>
            <p>• East leads with <strong>₹{regionData.find(r=>r.Region==="East")?.sales.toLocaleString()}</strong> in sales</p>
            <p>• UPI is the most popular payment mode</p>
            <p>• Overall profit margin is <strong>{summary.profit_margin}%</strong></p>
            <p>• Average order value: <strong>₹{Math.round(summary.avg_sales).toLocaleString()}</strong></p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div style={{ background: "#fff", border: "1px solid #e9ecef", borderRadius: 12, padding: "1.25rem" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "#868e96", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Transactions — <code style={{ fontFamily: "monospace", fontSize: 11 }}>GET /api/sales</code>
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e9ecef" }}>
              {["Date","Product","Region","Sales","Profit","Payment","Customer"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: "#868e96", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sales.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f1f3f5" }}>
                <td style={{ padding: "8px 8px" }}>{row.Date}</td>
                <td style={{ padding: "8px 8px" }}>{row.Product}</td>
                <td style={{ padding: "8px 8px" }}><StatusBadge value={row.Region} map={regionColors} /></td>
                <td style={{ padding: "8px 8px" }}>₹{row.Sales.toLocaleString()}</td>
                <td style={{ padding: "8px 8px" }}>₹{row.Profit.toLocaleString()}</td>
                <td style={{ padding: "8px 8px" }}><StatusBadge value={row.Payment_Mode} map={paymentColors} /></td>
                <td style={{ padding: "8px 8px" }}><StatusBadge value={row.Customer_Type} map={customerColors} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
