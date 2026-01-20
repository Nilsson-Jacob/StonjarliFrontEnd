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

const DAY_BOX_SIZE = 80;

/* ================= LEGEND ITEM ================= */

function LegendItem({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 4,
          background: color,
          boxShadow:
            color === "#1f8f4e" ? "0 0 6px rgba(31,143,78,0.8)" : "none",
        }}
      />
      <span style={{ color: "#ccc" }}>{label}</span>
    </div>
  );
}

/* ================= MAIN ================= */

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
      mapped[dayKey] = {
        structured: entry.structured,
        targets: entry.targets || [],
      };
    });

    setEntries(mapped);
  }, [currentMonth]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  /* ================= COLOR LOGIC ================= */

  function getDayColor(entry) {
    if (!entry || !entry.structured) return Colors.card;

    const { liftImproved } = entry.structured;
    const targets = entry.targets || [];

    const totalTargets = targets.length;
    const hitTargets = targets.filter((t) => t.met === true).length;

    if (liftImproved && hitTargets === totalTargets && totalTargets > 0)
      return "#1f8f4e"; // Green

    if (liftImproved || hitTargets >= Math.ceil(totalTargets / 2))
      return "#2f6db3"; // Blue

    if (hitTargets > 0) return "#b38b2f"; // Yellow

    return "#8b2f2f"; // Red
  }

  function getGlow(color) {
    if (color === "#1f8f4e") {
      return "0 0 12px rgba(31,143,78,0.9)";
    }
    return "none";
  }

  /* ================= RENDER CALENDAR ================= */

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

        const hasLiftImproved = entry?.structured?.liftImproved;
        const hasTargets = entry?.targets?.length > 0;

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
            {/* Date */}
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              {formattedDate}
            </span>

            {/* Icon Overlays */}
            <div
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                display: "flex",
                gap: 4,
                fontSize: 14,
              }}
            >
              {hasLiftImproved && <span title="Training Improved">🏋️</span>}
              {hasTargets && <span title="Targets Logged">🎯</span>}
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

      {/* ===== LEGEND ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 12,
          fontSize: 11,
        }}
      >
        <LegendItem
          color="#1f8f4e"
          label="Perfect: Training improved + all targets hit"
        />
        <LegendItem
          color="#2f6db3"
          label="Strong: Training improved or most targets hit"
        />
        <LegendItem color="#b38b2f" label="Partial: Some targets hit" />
        <LegendItem color="#8b2f2f" label="Missed: No targets hit" />
      </div>

      {renderCells()}

      {/* ===== EXPANDED VIEW ===== */}
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
                padding: 20,
                width: "92%",
                maxWidth: 420,
                color: "#fff",
                boxShadow: getGlow(getDayColor(selectedDay.entry)),
              }}
            >
              <h3>{selectedDay.fullDate}</h3>

              {selectedDay.entry ? (
                <>
                  <p>
                    🏋️ Training Improved:{" "}
                    {selectedDay.entry.structured?.liftImproved ? "Yes" : "No"}
                  </p>
                  <p>🎯 Targets: {selectedDay.entry.targets.length}</p>
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

/*import React, { useEffect, useState, useCallback } from "react";
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

const DAY_BOX_SIZE = 80; // fixed size for mobile grid cells

function LegendItem({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 4,
          background: color,
        }}
      />
      <span style={{ color: "#ccc" }}>{label}</span>
    </div>
  );
}

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
    if (!entry || !entry.structured) return Colors.card;

    const { liftImproved, proteinGoalMet, sleepGoalMet } = entry.structured;

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
        const currentDay = day;
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
              width: "100%",
              height: DAY_BOX_SIZE,
              padding: 8,
              borderRadius: 12,
              background: getDayColor(entry),
              opacity: isSameMonth(currentDay, monthStart) ? 1 : 0.35,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: entry ? "0 0 8px rgba(0,0,0,0.4)" : "none",
              cursor: "pointer",
              overflow: "hidden",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              {formattedDate}
            </span>

            {entry?.structured?.activities?.slice(0, 1).map((e, index) => (
              <div key={index} style={{ fontSize: 10, lineHeight: 1.2 }}>
                {e.activity_type} {e.anchor_metric?.weight}kg
              </div>
            ))}

            {entry?.targets && (
              <div style={{ fontSize: 11, opacity: 0.8 }}>🎯</div>
            )}
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 12,
          fontSize: 11,
        }}
      >
        <LegendItem color="#1f8f4e" label="All targets hit and training progress (3/3)" />
        <LegendItem color="#2f6db3" label="Good day (2/3)" />
        <LegendItem color="#b38b2f" label="Okay day (1/3)" />
        <LegendItem color="#8b2f2f" label="Missed goals (0/3)" />
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
                padding: 20,
                width: "92%",
                maxWidth: 420,
                color: "#fff",
              }}
            >
              <h3 style={{ marginBottom: 12 }}>{selectedDay.fullDate}</h3>

              {selectedDay.entry ? (
                <>
¨                  {selectedDay.entry.structured?.activities?.map((a, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <strong>{a.activity_type}</strong>:{" "}
                      {a.anchor_metric?.weight}kg {a.anchor_metric?.reps}x
                      {a.anchor_metric?.sets}
                    </div>
                  ))}


                  <div style={{ marginTop: 12, fontSize: 14 }}>
                    🏋️ Lift Improved:{" "}
                    {selectedDay.entry.structured?.liftImproved ? "Yes" : "No"}
                    <br />
                    🥩 Protein Goal:{" "}
                    {selectedDay.entry.structured?.proteinGoalMet
                      ? "Met"
                      : "Not met"}
                    <br />
                    💤 Sleep Goal:{" "}
                    {selectedDay.entry.structured?.sleepGoalMet
                      ? "Met"
                      : "Not met"}
                  </div>

                  {selectedDay.entry.targets?.map((t, i) => (
                    <div key={i} style={{ marginTop: 10, fontSize: 14 }}>
                      {t.protein && <div>🥩 Protein target: {t.protein}</div>}
                      {t.sleep && <div>💤 Sleep target: {t.sleep}</div>}
                    </div>
                  ))}
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
*/

/*

-------------------------------






*/

// src/pages/Logs.jsx
/*
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

            {entry?.structured?.activities?.map((e, index) => (
              <div key={index}>
                <div style={{ fontSize: 13, color: "#fff" }}>
                  Training:
                  {e.activity_type}: {e.anchor_metric?.weight}kg{" "}
                  {e.anchor_metric?.reps}x{e.anchor_metric?.sets}
                </div>
              </div>
            ))}

            {entry?.targets?.map((e, index) => (
              <div key={index}>
                <div style={{ fontSize: 13, color: "#fff" }}>
                  Targets:
                  {e.protein && (
                    <div style={{ fontSize: 9, color: "#fff" }}>
                      {" "}
                      Protein: {e.protein}
                    </div>
                  )}
                  {e.sleep && (
                    <div style={{ fontSize: 9, color: "#fff" }}>
                      Sleep: {e.sleep}
                    </div>
                  )}
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

*/
