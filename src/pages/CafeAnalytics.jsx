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
  BarChart,
  Bar,
} from "recharts";

import CafeNavBar from "../components/CafeNavBar";

export default function Home() {
  const [bookings, setBookings] = useState([]);
  const [items, setItems] = useState([]);
  const [chartData, setChartData] = useState([]);

  const [feedback, setFeedback] = useState([]);

  const [stats, setStats] = useState({
    totalCustomers: 0,
    returningCustomers: 0,
    returnRate: 0,
    totalBookings: 0,
    cancelled: 0,
  });

  console.log("bookings + items: " + bookings + " : " + items);

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

      const { data: feedbackData } = await supabase
        .from("email_replies")
        .select("*, events(title,date)");

      setFeedback(feedbackData || []);

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

  const groupedFeedback = {};

  feedback.forEach((f) => {
    if (!groupedFeedback[f.event_id]) {
      groupedFeedback[f.event_id] = [];
    }
    groupedFeedback[f.event_id].push(f);
  });

  const feedbackByEvent = Object.entries(groupedFeedback).map(
    ([eventId, items]) => ({
      eventId,
      count: items.length,
      items,
    })
  );

  const cardStyle = {
    flex: 1,
    minWidth: 120,
    padding: 16,
    borderRadius: 12,
    background: "#1a1a22",
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
    textAlign: "center",
  };

  return (
    <>
      <CafeNavBar />

      <div
        style={{
          padding: 16,
          background: "#0f0f14",
          minHeight: "100vh",
          color: "#ffffff",
        }}
      >
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
            background: "#1a1a22",
            borderRadius: 12,
            boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
            color: "white",
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

        <div
          style={{
            marginTop: 30,
            padding: 16,
            background: "#1a1a22",
            borderRadius: 12,
            boxShadow: "0 6px 20px rgba(79, 231, 63, 0.05)",
          }}
        >
          <h4>Most popular items</h4>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularItems.slice(0, 6)}>
              <CartesianGrid />
              <XAxis dataKey="name" fill="white" />
              <YAxis fill="white" />
              <Tooltip />
              <Bar dataKey="count" fill="#4fe73f" label />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feedback section */}
        <div
          style={{
            marginTop: 30,
            padding: 16,
            background: "#1a1a22",
            borderRadius: 12,
          }}
        >
          <h4>Customer feedback</h4>

          {feedbackByEvent.length === 0 ? (
            <p style={{ opacity: 0.6 }}>No feedback yet</p>
          ) : (
            feedbackByEvent.map((event) => (
              <details
                key={event.eventId}
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "#0f0f14",
                  borderRadius: 10,
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                  Event {event.items?.[0]?.events?.title || "Unknown event"}:{" "}
                  {event.items?.[0]?.events?.date} :{event.count} responses
                </summary>

                <div style={{ marginTop: 10 }}>
                  {event.items.map((f) => (
                    <div
                      key={f.id}
                      style={{
                        padding: 10,
                        marginBottom: 8,
                        background: "#1a1a22",
                        borderRadius: 8,
                      }}
                    >
                      <p style={{ margin: 0, fontWeight: "bold" }}>
                        {f.name} ({f.email})
                      </p>
                      <p style={{ margin: "6px 0 0", opacity: 0.8 }}>
                        {f.message}
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            ))
          )}
        </div>
      </div>
    </>
  );
}
