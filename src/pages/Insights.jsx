import React, { useEffect, useState } from "react";
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
import { format } from "date-fns";

export default function Insights() {
  const [activityData, setActivityData] = useState({});

  useEffect(() => {
    fetchInsights();
  }, []);

  async function fetchInsights() {
    const { data, error } = await supabase
      .from("daily_entries")
      .select("created_at, structured");

    if (error) {
      console.error(error);
      return;
    }

    /*
      We expect structured like:
      {
        activities: [
          {
            activity_type: "bench",
            anchor_metric: { weight, sets, reps }
          }
        ]
      }
    */

    const grouped = {};

    data.forEach((entry) => {
      const date = format(new Date(entry.created_at), "yyyy-MM-dd");
      const activities = entry.structured?.activities || [];

      activities.forEach((activity) => {
        const type = activity.activity_type;
        const weight = activity.anchor_metric?.weight;

        if (!weight) return;

        if (!grouped[type]) grouped[type] = [];

        grouped[type].push({
          date,
          weight,
        });
      });
    });

    // Sort each activity by date
    Object.keys(grouped).forEach((type) => {
      grouped[type].sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    setActivityData(grouped);
  }

  return (
    <div
      style={{
        padding: 24,
        paddingTop: 45,
        minHeight: "100vh",
        background: "#0f0f14",
        color: "white",
      }}
    >
      <h2 style={{ marginBottom: 30 }}>Training Insights</h2>

      {Object.keys(activityData).length === 0 && <p>No training data yet.</p>}

      {Object.entries(activityData).map(([activity, data]) => (
        <div
          key={activity}
          style={{
            marginBottom: 50,
            background: "#1a1a22",
            padding: 20,
            borderRadius: 12,
          }}
        >
          <h3 style={{ textTransform: "capitalize", marginBottom: 20 }}>
            {activity} Progress (Max Weight)
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#ddb52f"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}

/*import React, { useEffect, useState } from "react";
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
}*/
