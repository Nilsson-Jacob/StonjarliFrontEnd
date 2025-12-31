import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../components/supabaseClient";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
} from "date-fns";

const Colors = {
  bg: "#0f0f14",
  card: "#1a1a22",
  primary: "#72063c",
  accent: "#ddb52f",
  text: "#ffffff",
  muted: "#888",
};

export default function Logs() {
  const [entries, setEntries] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // ✅ Memoized function
  const fetchEntries = useCallback(async () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const { data, error } = await supabase
      .from("daily_entries")
      .select("created_at, structured")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    if (error) {
      console.error(error);
      return;
    }

    const mapped = {};
    data.forEach((entry) => {
      const dayKey = format(new Date(entry.created_at), "yyyy-MM-dd");
      mapped[dayKey] = entry.structured?.rating;
    });

    setEntries(mapped);
  }, [currentMonth]);

  // ✅ Correct dependency list
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  function renderCells() {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const dayKey = format(day, "yyyy-MM-dd");
        const rating = entries[dayKey];

        days.push(
          <div
            key={dayKey}
            style={{
              padding: 12,
              borderRadius: 12,
              background: rating ? Colors.primary : Colors.card,
              opacity: isSameMonth(day, monthStart) ? 1 : 0.4,
              minHeight: 70,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 14 }}>{formattedDate}</span>

            {rating && (
              <span
                style={{
                  alignSelf: "flex-end",
                  fontSize: 18,
                  fontWeight: "bold",
                  color: Colors.accent,
                }}
              >
                {rating}/10
              </span>
            )}
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div
          key={day.toString()}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 10,
          }}
        >
          {days}
        </div>
      );

      days = [];
    }

    return rows;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: Colors.bg,
        color: Colors.text,
        padding: 24,
      }}
    >
      <h2 style={{ marginBottom: 16 }}>{format(currentMonth, "MMMM yyyy")}</h2>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setCurrentMonth(addDays(currentMonth, -30))}>
          ◀
        </button>
        <button
          style={{ marginLeft: 10 }}
          onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
        >
          ▶
        </button>
      </div>

      {renderCells()}
    </div>
  );
}
