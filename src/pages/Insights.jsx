import React, { useEffect, useState } from "react";
import { supabase } from "../components/supabaseClient";

const Colors = {
  bg: "#0f0f14",
  card: "#1a1a22",
  primary: "#72063c",
  accent: "#ddb52f",
  text: "#ffffff",
  muted: "#888",
};

export default function Insights() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    const { data, error } = await supabase
      .from("daily_entries")
      .select("created_at, structured")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      console.error(error);
      return;
    }

    setEntries(data);
    setLoading(false);
  }

  if (loading) {
    return <div style={{ color: Colors.text }}>Loading insights…</div>;
  }

  // ---- Calculations ----

  const ratings = entries.map((e) => e.structured?.rating).filter(Boolean);

  const avgRating = ratings.reduce((a, b) => a + b, 0) / (ratings.length || 1);

  const energyCount = {};
  const activityCount = {};

  entries.forEach((e) => {
    const energy = e.structured?.energy_level;
    if (energy) energyCount[energy] = (energyCount[energy] || 0) + 1;

    const activities = e.structured?.activities || [];
    activities.forEach((a) => {
      activityCount[a] = (activityCount[a] || 0) + 1;
    });
  });

  const topEnergy = Object.entries(energyCount).sort((a, b) => b[1] - a[1])[0];
  const topActivity = Object.entries(activityCount).sort(
    (a, b) => b[1] - a[1]
  )[0];

  // ---- UI ----

  return (
    <div
      style={{
        minHeight: "100vh",
        background: Colors.bg,
        color: Colors.text,
        padding: 24,
      }}
    >
      <h2 style={{ marginBottom: 20 }}>Insights</h2>

      <InsightCard
        title="Average rating (last 30 days)"
        value={avgRating.toFixed(1)}
      />

      {topEnergy && (
        <InsightCard title="Most common energy level" value={topEnergy[0]} />
      )}

      {topActivity && (
        <InsightCard title="Most frequent activity" value={topActivity[0]} />
      )}

      <InsightCard title="Entries analyzed" value={entries.length} muted />
    </div>
  );
}

function InsightCard({ title, value, muted }) {
  return (
    <div
      style={{
        background: Colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        border: `1px solid ${Colors.primary}`,
        opacity: muted ? 0.6 : 1,
      }}
    >
      <div style={{ fontSize: 14, color: Colors.muted }}>{title}</div>
      <div
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: Colors.accent,
          marginTop: 6,
        }}
      >
        {value}
      </div>
    </div>
  );
}
