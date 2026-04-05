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

import CafeNavBar from "../components/CafeNavBar";

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
  const [eventTypes, setEventTypes] = useState([]);

  // Event Info
  const [eventMaxCap, setEventMaxCap] = useState(0); // YYYY-MM-DD
  //const [eventBookingsMade, setEventBookingsMade] = useState(0); // YYYY-MM-DD

  //const [eventTypeItems, setEventTypeItems] = useState({});

  useEffect(() => {
    const fetchEventTypes = async () => {
      const { data, error } = await supabase.from("event_types").select("*");

      if (error) {
        console.error(error);
      } else {
        setEventTypes(data);
      }
    };

    fetchEventTypes();
  }, []);

  useEffect(() => {
    const fetchEventTypeItems = async () => {
      if (!eventType) return;

      const { data, error } = await supabase
        .from("event_type_items")
        .select("*")
        .eq("event_type_id", eventType);

      if (error) {
        console.error(error);
      } else {
        console.log("EventTypes: " + JSON.stringify(data));

        // setEventTypes(data);
        //setItems(data.map((name) => ({ name })));
        setItems(
          data.map((item) => ({
            id: item.id,
            name: item.name,
          }))
        );
      }
    };

    fetchEventTypeItems();
  }, [eventType]);
  /*

  const fetchEntries = useCallback(async () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const { data, error } = await supabase
      .from("events")
      .select("date, title, id, max_capacity")
      .gte("date", start.toISOString())
      .lte("date", end.toISOString());

    if (error) {
      console.error(error);
      return;
    }

    const mapped = {};
    data.forEach(async (entry) => {
      const dayKey = format(new Date(entry.date), "yyyy-MM-dd");



      mapped[dayKey] = {
        title: entry.title,
        date: entry.date,
        id: entry.id,
        max_capacity: entry.max_capacity,
        //numberOfBookings: bookings?.length,
      };
    });

    setEntries(mapped);
  }, [currentMonth]);

  const fetchBookings = useCallback(async () => {
    const { data, error } = await supabase.from("bookings").select("event_id");

    if (error) {
      console.error(error);
      return;
    }

    // Count bookings per event_id
    const bookingsCount = {};

    data.forEach((booking) => {
      if (!bookingsCount[booking.event_id]) {
        bookingsCount[booking.event_id] = 0;
      }
      bookingsCount[booking.event_id]++;
    });


    // Merge into entries
    setEntries((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((dayKey) => {
        const entry = updated[dayKey];

        updated[dayKey] = {
          ...entry,
          numberOfBookings: bookingsCount[entry.id] || 0,
        };
      });

      return updated;
    });
  }, []);

  const fetchBookingItems = useCallback(async () => {
    const { data, error } = await supabase.from("booking_items").select("booking_id");

    if (error) {
      console.error(error);
      return;
    }

    // Count bookings per event_id
    const bookingsCount = {};

    data.forEach((booking) => {
      if (!bookingsCount[booking.event_id]) {
        bookingsCount[booking.event_id] = 0;
      }
      bookingsCount[booking.event_id]++;
    });

    // Merge into entries
    setEntries((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((dayKey) => {
        const entry = updated[dayKey];

        updated[dayKey] = {
          ...entry,
          numberOfBookings: bookingsCount[entry.id] || 0,
        };
      });

      return updated;
    });
  }, []);


  useEffect(() => {
    const loadData = async () => {
      await fetchEntries();
      await fetchBookings();
      await fetchBookingItems();
    };

    loadData();
  }, [fetchEntries, fetchBookings]);

*/
  const fetchEntries = useCallback(async () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const { data, error } = await supabase
      .from("events")
      .select(
        `
        id,
        title,
        date,
        max_capacity,
        bookings (
          id,
          booking_items (
            name,
            quantity
          )
        )
      `
      )
      .gte("date", start.toISOString())
      .lte("date", end.toISOString());

    if (error) {
      console.error(error);
      return;
    }

    const mapped = {};

    data.forEach((event) => {
      const dayKey = format(new Date(event.date), "yyyy-MM-dd");

      let totalBookings = 0;
      const itemCounts = {};

      event.bookings?.forEach((booking) => {
        totalBookings++;

        booking.booking_items?.forEach((item) => {
          const name = item.name;

          if (!itemCounts[name]) {
            itemCounts[name] = 0;
          }

          itemCounts[name] += item.quantity || 1;
        });
      });

      mapped[dayKey] = {
        id: event.id,
        title: event.title,
        date: event.date,
        max_capacity: event.max_capacity,
        numberOfBookings: totalBookings,
        items: itemCounts,
      };
    });

    setEntries(mapped);
  }, [currentMonth]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  /*
  const handleCreateEvent = async () => {
    if (!eventTitle || !eventDate || !eventType)
      return alert("Fill all fields!");

    // Call your backend / Supabase insert here
    console.log({ eventTitle, eventDate, eventType });

    // 1. Create event
    const { data: event } = await supabase
      .from("events")
      .insert({
        title: eventTitle,
        date: eventDate,
        event_type_id: eventType,
        max_capacity: eventMaxCap,
      })
      .select()
      .single();

    console.log("error here?" + event);

    // 2. Insert items
    const itemsToInsert = items.map((item) => ({
      event_id: event.id,
      name: item.name,
    }));

    await supabase.from("items").insert(itemsToInsert);

    // 3. Reset
    setItems([]);
    setCreateNewEvent(false);

    // Optionally reset form
    setEventTitle("");
    setEventDate("");
    setEventType("");

    setCreateNewEvent(false);
  };*/

  const handleCreateEvent = async (e) => {
    e.preventDefault(); // 🔥 THIS STOPS THE REFRESH

    if (!eventTitle || !eventDate || !eventType) {
      alert("Fill all fields!");
      return;
    }

    // 1. Create event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        title: eventTitle,
        date: eventDate,
        event_type_id: eventType,
        max_capacity: eventMaxCap,
      })
      .select()
      .single();

    if (eventError) {
      console.error("Event insert error:", eventError);
      return;
    }

    console.log("Created event:", event);

    // 2. Insert items (only if items exist)
    if (items.length > 0) {
      const itemsToInsert = items.map((item) => ({
        event_id: event.id,
        name: item.name,
      }));

      const { error: itemsError } = await supabase
        .from("items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("Items insert error:", itemsError);
      }
    }

    // 3. Reset
    setItems([]);
    setCreateNewEvent(false);
    setEventTitle("");
    setEventDate("");
    setEventType("");
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

            <div
              style={{
                background: "orange",
                textAlign: "center",
                marginBottom: 20,
                textDecorationColor: "aliceblue",
              }}
            >
              {entry?.title}
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
    <div>
      <CafeNavBar />
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
                <form
                  onSubmit={handleCreateEvent}
                  style={{
                    background: "blue",
                    borderRadius: 20,
                    padding: 20,
                    width: "92%",
                    minWidth: 1000,
                    color: "#fff",
                  }}
                >
                  <h3>New event</h3>
                  <p>No data for this day.</p>
                  <input
                    type="text"
                    placeholder="Event name"
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
                    required
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{
                      width: "50%",
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
                      width: "50%",
                      padding: 10,
                      marginTop: 12,
                      borderRadius: 8,
                      border: "1px solid #ccc",
                    }}
                  >
                    <option value="">Select type</option>

                    {eventTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>

                  {items.map((item, index) => (
                    <div
                      key={item.id}
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

                  <input
                    type="number"
                    value={eventMaxCap}
                    onChange={(e) => setEventMaxCap(e.target.value)}
                    style={{
                      width: "50%",
                      padding: 10,
                      marginTop: 12,
                      borderRadius: 8,
                      border: "1px solid #ccc",
                    }}
                  />

                  <button
                    type="submit"
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
                </form>
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
                    <h2>{selectedDay.entry.title}</h2>
                    <h2>
                      Share link:
                      {`${window.location.origin}/event/${selectedDay.entry.id}}`}{" "}
                    </h2>

                    <h3>
                      Number of bookings / max capacity: (
                      {selectedDay.entry.numberOfBookings} /{" "}
                      {selectedDay.entry.max_capacity})
                    </h3>

                    {/*selectedDay.entry?.items?.forEach((element) => {
                      <h2>{JSON.stringify(element)}</h2>;
                    })*/}
                    {JSON.stringify(selectedDay.entry)}
                  </>
                ) : (
                  <p style={{ opacity: 0.7 }}>No training logged.</p>
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
    </div>
  );
}
