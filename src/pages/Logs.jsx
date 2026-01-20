// src/pages/Logs.jsx
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  text: "#ffffff",
  muted: "#888",
};

export default function Logs() {
  const [entries, setEntries] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const fetchEntries = useCallback(async () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const { data, error } = await supabase
      .from("daily_entries")
      .select("created_at, structured, targets")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    if (error) {
      console.error(error);
      return;
    }

    const mapped = {};
    data.forEach((entry) => {
      const dayKey = format(new Date(entry.created_at), "yyyy-MM-dd");
      //mapped[dayKey] = entry.structured;
      mapped[dayKey] = {
        structured: entry.structured,
        targets: entry.targets,
      };
    });

    setEntries(mapped);
  }, [currentMonth]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  function getDayColor(entry) {
    if (!entry) return Colors.card;

    const { liftImproved, proteinGoalMet, sleepGoalMet } = entry;

    const score =
      (liftImproved ? 1 : 0) +
      (proteinGoalMet ? 1 : 0) +
      (sleepGoalMet ? 1 : 0);

    if (score === 3) return "#1f8f4e";
    if (score === 2) return "#2f6db3";
    if (score === 1) return "#b38b2f";
    return "#8b2f2f";
  }

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
        const currentDay = day; // 🔥 freeze variable to avoid ESLint no-loop-func error

        const formattedDate = format(currentDay, "d");
        const dayKey = format(currentDay, "yyyy-MM-dd");
        const entry = entries[dayKey];

        days.push(
          <motion.div
            key={dayKey}
            layoutId={dayKey}
            onClick={() =>
              setSelectedDay({
                dayKey,
                entry,
                formattedDate,
                fullDate: format(currentDay, "MMMM d, yyyy"),
              })
            }
            style={{
              padding: 12,
              borderRadius: 14,
              background: getDayColor(entry),
              opacity: isSameMonth(currentDay, monthStart) ? 1 : 0.35,
              minHeight: 80,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: entry ? "0 0 12px rgba(0,0,0,0.4)" : "none",
              cursor: "pointer",
            }}
            whileHover={{ scale: 1.05 }}
          >
            <span style={{ fontSize: 14, color: Colors.text }}>
              {formattedDate}
            </span>

            {entry?.activities?.map((e, index) => (
              <div key={index}>
                <div style={{ fontSize: 13, color: "#fff" }}>
                  {e.activity_type}: {e.anchor_metric?.weight}kg{" "}
                  {e.anchor_metric?.reps}x{e.anchor_metric?.sets}
                </div>
              </div>
            ))}

            {entry?.targets?.map((e, index) => (
              <div key={index}>
                <div style={{ fontSize: 13, color: "#fff" }}>
                  Protein: {e.protein}
                  Sleep: {e.sleep}
                </div>
              </div>
            ))}
          </motion.div>
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
        paddingTop: 45,
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

      {/* Expanded Day View */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              layoutId={selectedDay.dayKey}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: getDayColor(selectedDay.entry),
                borderRadius: 20,
                padding: 24,
                width: "90%",
                maxWidth: 400,
                color: "#fff",
              }}
            >
              <h3>{selectedDay.fullDate}</h3>

              {selectedDay.entry ? (
                <>
                  {selectedDay.entry.activities?.map((a, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <strong>{a.activity_type}</strong>:{" "}
                      {a.anchor_metric?.weight}kg {a.anchor_metric?.reps}x
                      {a.anchor_metric?.sets}
                    </div>
                  ))}

                  <div style={{ marginTop: 12, fontSize: 14 }}>
                    🏋️ Lift Improved:{" "}
                    {selectedDay.entry.liftImproved ? "Yes" : "No"}
                    <br />
                    🥩 Protein Goal:{" "}
                    {selectedDay.entry.proteinGoalMet ? "Met" : "Not met"}
                    <br />
                    💤 Sleep Goal:{" "}
                    {selectedDay.entry.sleepGoalMet ? "Met" : "Not met"}
                  </div>
                </>
              ) : (
                <p>No data for this day.</p>
              )}

              <button
                onClick={() => setSelectedDay(null)}
                style={{
                  marginTop: 20,
                  width: "100%",
                  padding: 10,
                  border: "none",
                  borderRadius: 10,
                  background: "#000",
                  color: "#fff",
                }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/*import React, { useEffect, useState, useCallback } from "react";
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
  text: "#ffffff",
  muted: "#888",
};

export default function Logs() {
  const [entries, setEntries] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
      mapped[dayKey] = entry.structured;
    });

    setEntries(mapped);
  }, [currentMonth]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  function getDayColor(entry) {
    if (!entry) return Colors.card;

    const { liftImproved, proteinGoalMet, sleepGoalMet } = entry;

    const score =
      (liftImproved ? 1 : 0) +
      (proteinGoalMet ? 1 : 0) +
      (sleepGoalMet ? 1 : 0);

    if (score === 3) return "#1f8f4e"; // green
    if (score === 2) return "#2f6db3"; // blue
    if (score === 1) return "#b38b2f"; // yellow
    return "#8b2f2f"; // red
  }

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
        const entry = entries[dayKey];

        days.push(
          <div
            key={dayKey}
            style={{
              padding: 12,
              borderRadius: 14,
              background: getDayColor(entry),
              opacity: isSameMonth(day, monthStart) ? 1 : 0.35,
              minHeight: 80,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: entry ? "0 0 12px rgba(0,0,0,0.4)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ fontSize: 14, color: Colors.text }}>
              {formattedDate}
            </span>

            {entry?.activities?.map((e, index) => (
              <div>
                <span
                  key={index}
                  style={{
                    alignSelf: "flex-end",
                    fontSize: 16,
                    color: "#fff",
                  }}
                >
                  {e.training_type}
                </span>
                <span
                  key={index}
                  style={{
                    alignSelf: "flex-end",
                    fontSize: 14,
                    color: "#fff",
                  }}
                >
                  {e.activity_type}: {e.anchor_metric?.weight}kg{" "}
                  {e.anchor_metric?.reps}x{e.anchor_metric?.sets}
                </span>
              </div>
            ))}

            {entry?.rating && (
              <span
                style={{
                  alignSelf: "flex-end",
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#fff",
                }}
              >
                {entry.rating}/10
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
        paddingTop: 45,
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
*/
