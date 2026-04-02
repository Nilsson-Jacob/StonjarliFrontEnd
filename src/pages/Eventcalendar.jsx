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

const DAY_BOX_SIZE = 120;

const defaultItemsByType = {
  slowrun: ["Semla", "Croissant"],
};

export default function Home() {
  const [entries, setEntries] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [createNewEvent, setCreateNewEvent] = useState(false);

  //inputs:
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState(""); // YYYY-MM-DD
  const [eventType, setEventType] = useState(""); // e.g., 'slowrun'
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!eventType) return;

    const defaults = defaultItemsByType[eventType] || [];

    setItems(defaults.map((name) => ({ name })));
  }, [eventType]);

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

  const handleCreateEvent = () => {
    if (!eventTitle || !eventDate || !eventType)
      return alert("Fill all fields!");

    // Call your backend / Supabase insert here
    console.log({ eventTitle, eventDate, eventType });

    // Optionally reset form
    setEventTitle("");
    setEventDate("");
    setEventType("");
    setCreateNewEvent(false);
  };
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
              width: "93%",
              height: DAY_BOX_SIZE,
              background: "grey",
              padding: 8,
              marginRight: 2,
              borderRadius: 12,
              opacity: isSameMonth(currentDay, monthStart) ? 1 : 0.35,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              cursor: "pointer",
            }}
            whileTap={{ scale: 0.94 }}
          >
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              {formattedDate}
            </span>
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
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            alignItems: "center",
            flexDirection: "row",
            display: "flex",
            justifyContent: "space-between",
            width: 300,
          }}
        >
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2 style={{ marginBottom: 6, fontSize: 30 }}>
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div style={{ flexDirection: "row" }}>
              <button
                style={{ width: 40, height: 22 }}
                onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
              >
                ◀
              </button>
              <button
                style={{ marginLeft: 10, width: 40, height: 22 }}
                onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
              >
                ▶
              </button>
            </div>
          </div>
          <motion.button
            layoutId="create-event"
            style={{ display: "flex" }}
            onClick={() => setCreateNewEvent(true)}
          >
            Create new event
          </motion.button>
        </div>
      </div>

      {renderCells()}

      <AnimatePresence>
        {createNewEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <motion.div
              layoutId="create-event"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "blue",
                borderRadius: 20,
                padding: 20,
                width: "92%",
                minWidth: 1000,
                color: "#fff",
                boxShadow: "blue",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <h3>New event</h3>
              <p>No data for this day.</p>
              <input
                type="text"
                placeholder="Event title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 12,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
              />

              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 12,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
              />
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 12,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Select type</option>
                <option value="slowrun">Slowrun</option>
              </select>

              {items.map((item, index) => (
                <div
                  key={index}
                  style={{ display: "flex", gap: 10, marginTop: 8 }}
                >
                  <input
                    value={item.name}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[index].name = e.target.value;
                      setItems(updated);
                    }}
                    style={{ flex: 1, padding: 8 }}
                  />

                  <button
                    onClick={() => {
                      setItems(items.filter((_, i) => i !== index));
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => setItems([...items, { name: "" }])}
                style={{ marginTop: 10 }}
              >
                + Add item
              </button>

              <button
                onClick={handleCreateEvent}
                style={{
                  marginTop: 20,
                  width: "50%",
                  padding: 12,
                  border: "none",
                  borderRadius: 12,
                  background: "#000",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Create
              </button>

              <button
                onClick={() => setCreateNewEvent(false)}
                style={{
                  marginTop: 20,
                  width: "50%",
                  padding: 12,
                  border: "none",
                  borderRadius: 12,
                  background: "#000",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}

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
                background: "blue",
                borderRadius: 20,
                padding: 20,
                width: "92%",
                minWidth: 1000,
                color: "#fff",
                boxShadow: "blue",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <h3>{selectedDay.fullDate}</h3>

              {selectedDay.entry ? (
                <>
                  <h4 style={{ marginTop: 12 }}>Training</h4>(
                  <p style={{ opacity: 0.7 }}>No training logged.</p>)
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
