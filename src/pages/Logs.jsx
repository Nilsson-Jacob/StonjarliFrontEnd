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
  green: "#1f8f4e",
  orange: "#c46a2b",
  red: "#8b2f2f",
  mid: "#3f7fa6",
};

const DAY_BOX_SIZE = 80;

const {
  data: { user },
} = await supabase.auth.getUser();

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
      .eq("user_id", user.id)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    if (error) {
      console.error(error);
      return;
    }

    const mapped = {};
    data.forEach((entry) => {
      const dayKey = format(new Date(entry.created_at), "yyyy-MM-dd");
      mapped[dayKey] = {
        structured: entry.structured,
        // targets: entry.targets || [],
      };
    });

    setEntries(mapped);
  }, [currentMonth]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  function getDayColor(entry) {
    if (!entry) return Colors.card;

    /*
    const trainingImproved = didTrainingImprove(entry);
    const { hit, total } = getTargetsScore(entry);
    const targetRatio = total > 0 ? hit / total : 0;

    const score = (trainingImproved ? 1 : 0) + targetRatio; // 0 → 2

    if (score >= 1.8) return Colors.green;
    if (score >= 1.2) return Colors.mid;
    if (score >= 0.6) return Colors.orange;*/
    return Colors.mid;
  }

  function getGlow(color) {
    if (color === Colors.green) return "0 0 12px rgba(31,143,78,0.9)";
    return "none";
  }

  function returnTrainingTypeEmoji(entry) {
    console.log("entry: " + JSON.stringify(entry));
    if (!entry) {
      return;
    }

    if (!entry.structured) {
      return;
    }

    if (!entry.structured.activities) {
      return;
    }

    if (entry.structured.activities.length > 0)
      switch (entry.structured.activities[0].training_type) {
        case "gym":
          return <span>🏋️‍♂️</span>;
        case "run":
          return <span>🏃</span>;
        case "sport":
          return <span>⚽️</span>;
        case "swim":
          return <span>🏊</span>;
        default:
          break;
      }
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
        const currentDay = day;
        const formattedDate = format(currentDay, "d");
        const dayKey = format(currentDay, "yyyy-MM-dd");
        const entry = entries[dayKey];

        const color = getDayColor(entry);
        const glow = getGlow(color);

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
              width: "100%",
              height: DAY_BOX_SIZE,
              padding: 8,
              borderRadius: 12,
              background: color,
              opacity: isSameMonth(currentDay, monthStart) ? 1 : 0.35,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              cursor: "pointer",
              boxShadow: glow,
            }}
            whileTap={{ scale: 0.94 }}
          >
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              {formattedDate}
            </span>

            <div
              style={{
                position: "absolute",
                bottom: 6,
                right: 6,
                display: "flex",
                gap: 6,
                fontSize: 27,
                alignItems: "center",
              }}
            >
              {/* 
              {trainingImproved && <span title="Training Improved">💪</span>}
              {total > 0 && (
                <span title="Targets hit">
                  {hit}/{total} 🎯
                </span>
              )}
                */}
              {returnTrainingTypeEmoji(entry)}
            </div>
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
            gap: 6,
            marginBottom: 6,
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
        padding: 12,
        paddingTop: 60,
        overflowX: auto,
      }}
    >
      <h2 style={{ marginBottom: 12 }}>{format(currentMonth, "MMMM yyyy")}</h2>

      <div style={{ marginBottom: 16 }}>
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

      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
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
                padding: 20,
                width: "92%",
                maxWidth: 420,
                color: "#fff",
                boxShadow: getGlow(getDayColor(selectedDay.entry)),
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <h3>{selectedDay.fullDate}</h3>

              {selectedDay.entry ? (
                <>
                  <h4 style={{ marginTop: 12 }}>Training</h4>

                  {selectedDay.entry.structured?.activities?.length > 0 ? (
                    selectedDay.entry.structured.activities.map((a, i) => {
                      if (a.activity_type === "run") {
                        return (
                          <div
                            key={i}
                            style={{
                              background: "rgba(0,0,0,0.25)",
                              borderRadius: 12,
                              padding: 10,
                              marginBottom: 8,
                            }}
                          >
                            <strong>{a.activity_type} 🏃</strong>
                            <div style={{ fontSize: 13 }}>
                              {a.anchor_metric?.distance_km} km ·{" "}
                              {a.anchor_metric?.time_minutes} min
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                marginTop: 4,
                                color: "#7CFFB2",
                              }}
                            ></div>
                          </div>
                        );
                      } else {
                        return (
                          <div
                            key={i}
                            style={{
                              background: "rgba(0,0,0,0.25)",
                              borderRadius: 12,
                              padding: 10,
                              marginBottom: 8,
                            }}
                          >
                            <strong>{a.activity_type}</strong>
                            <div style={{ fontSize: 13 }}>
                              {a.anchor_metric?.weight}kg ·{" "}
                              {a.anchor_metric?.reps}x{a.anchor_metric?.sets}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                marginTop: 4,
                                color: "#7CFFB2",
                              }}
                            ></div>
                          </div>
                        );
                      }
                    })
                  ) : (
                    <p style={{ opacity: 0.7 }}>No training logged.</p>
                  )}

                  {/* 
                  <h4 style={{ marginTop: 14 }}>Targets</h4>
                  <p>
                    🎯 {getTargetsScore(selectedDay.entry).hit}/
                    {getTargetsScore(selectedDay.entry).total} targets hit
                  </p> */}
                </>
              ) : (
                <p>No data for this day.</p>
              )}

              <button
                onClick={() => setSelectedDay(null)}
                style={{
                  marginTop: 20,
                  width: "100%",
                  padding: 12,
                  border: "none",
                  borderRadius: 12,
                  background: "#000",
                  color: "#fff",
                  fontWeight: "bold",
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
