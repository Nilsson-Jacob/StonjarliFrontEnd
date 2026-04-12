import { useEffect, useState } from "react";
import { supabase } from "../components/supabaseClient";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const [bookings, setBookings] = useState([]);
  const [items, setItems] = useState([]);
  const [chartData, setChartData] = useState([]);

  const [stats, setStats] = useState({
    totalCustomers: 0,
    returningCustomers: 0,
    returnRate: 0,
    totalBookings: 0,
    cancelled: 0,
  });

  const [popularItems, setPopularItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // BOOKINGS
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*");

      // BOOKING ITEMS
      const { data: itemsData } = await supabase
        .from("booking_items")
        .select("*");

      setBookings(bookingsData || []);
      setItems(itemsData || []);

      // 🧠 === RETURNING CUSTOMERS ===
      const emailCounts = {};

      bookingsData.forEach((b) => {
        const email = b.email.toLowerCase().trim();
        emailCounts[email] = (emailCounts[email] || 0) + 1;
      });

      const totalCustomers = Object.keys(emailCounts).length;
      const returningCustomers = Object.values(emailCounts).filter(
        (c) => c > 1
      ).length;

      const returnRate =
        totalCustomers > 0
          ? ((returningCustomers / totalCustomers) * 100).toFixed(1)
          : 0;

      // ❌ cancellations
      const cancelled = bookingsData.filter(
        (b) => b.cancelled_at !== null
      ).length;

      setStats({
        totalCustomers,
        returningCustomers,
        returnRate,
        totalBookings: bookingsData.length,
        cancelled,
      });

      // 🥐 === POPULAR ITEMS ===
      const itemCounts = {};

      itemsData.forEach((item) => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
      });

      const sortedItems = Object.entries(itemCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setPopularItems(sortedItems);

      // 📈 === BOOKINGS OVER TIME ===
      const grouped = {};

      bookingsData.forEach((b) => {
        const date = b.created_at.substring(0, 10);
        grouped[date] = (grouped[date] || 0) + 1;
      });

      const chart = Object.entries(grouped).map(([date, count]) => ({
        date,
        count,
      }));

      setChartData(chart);
    };

    fetchData();
  }, []);

  const cardStyle = {
    flex: 1,
    minWidth: 120,
    padding: 16,
    borderRadius: 12,
    background: "white",
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
    textAlign: "center",
  };

  return (
    <div
      style={{
        padding: 16,
        background: "#f7f7f7",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ marginBottom: 20 }}>📊 Analytics</h2>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <h3>{stats.totalBookings}</h3>
          <p>Total bookings</p>
        </div>

        <div style={cardStyle}>
          <h3>{stats.returnRate}%</h3>
          <p>Returning customers</p>
          <small>
            {stats.returningCustomers} / {stats.totalCustomers}
          </small>
        </div>

        <div style={cardStyle}>
          <h3>{stats.cancelled}</h3>
          <p>Cancellations</p>
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          marginTop: 30,
          padding: 16,
          background: "white",
          borderRadius: 12,
          boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
        }}
      >
        <h4>Bookings over time</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Popular items */}
      <div
        style={{
          marginTop: 30,
          padding: 16,
          background: "white",
          borderRadius: 12,
          boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
        }}
      >
        <h4>🥐 Most popular items</h4>

        {popularItems.slice(0, 5).map((item) => (
          <div
            key={item.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <span>{item.name}</span>
            <strong>{item.count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
