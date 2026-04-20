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
  isToday,
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
  const [eventMaxCap, setEventMaxCap] = useState(""); // YYYY-MM-DD
  //const [eventBookingsMade, setEventBookingsMade] = useState(0); // YYYY-MM-DD

  //const [eventTypeItems, setEventTypeItems] = useState({});
  const [copied, setCopied] = useState(false);

  const [createFeedbackEmail, setCreateFeedbackEmail] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState(
    `
Hi {{name}},

thank you for being part of {{event}}, I would love to hear what you thought.

Best regards,
{{company}}
`
  );

  // const [user, setUser] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    const loadUserAndCompany = async () => {
      // 1. Get logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // setUser(user);

      // 2. Get company_id
      const { data, error } = await supabase
        .from("company_users")
        .select("company_id")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching company:", error);
        return;
      }

      setCompanyId(data.company_id);
    };

    loadUserAndCompany();
  }, []);

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

  const handleSendFeedbackEmail = async function () {
    try {
      await fetch(
        "https://chwjjrgyubbdjqawlolx.supabase.co/functions/v1/sendFeedbackEmail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // apikey: process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
            //Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY}`,
          },
          body: JSON.stringify({
            eventId: selectedDay.entry.id,
            feedbackEmail: feedbackEmail,
          }),
        }
      );

      alert("Email has been sent");
      setCreateFeedbackEmail(false);
    } catch (error) {
      console.log("error : " + error);
    }
  };

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
      .lte("date", end.toISOString())
      .is("bookings.cancelled_at", null);

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

  const handleCreateEvent = async (e) => {
    e.preventDefault();

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
        max_capacity: Number(eventMaxCap),
        company_id: companyId,
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

    fetchEntries(); // <-- this will reload events

    // 3. Reset
    setItems([]);
    setCreateNewEvent(false);
    setEventTitle("");
    setEventDate("");
    setEventType("");
    setEventMaxCap("");
  };

  function renderCells() {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    /*
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);*/
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const formattedDate = format(currentDay, "d");
        const dayOfWeek = format(currentDay, "EEEE");
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
              background: isToday(currentDay) ? "green" : "grey",
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
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {formattedDate} - {dayOfWeek.substring(0, 3)}
            </span>

            {entry && (
              <div
                style={{
                  background: "orange",
                  textAlign: "center",
                  alignSelf: "center",
                  width: "90%",
                  height: "70%",
                  borderRadius: 15,
                }}
              >
                <h4 style={{ marginBottom: 0 }}>{entry.title}</h4>
                <h5 style={{ margin: 5 }}>
                  Bookings: {entry.numberOfBookings}/{entry.max_capacity}
                </h5>
              </div>
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

  if (!companyId) {
    return <div>Loading...</div>;
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
              width: "30vw",
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
              style={{
                display: "flex",
                marginTop: 20,
                width: "13vw",
                padding: 12,
                border: "none",
                borderRadius: 12,
                background: "grey",
                color: "#fff",
                fontWeight: "bold",
                justifyContent: "center",
                alignItems: "center",
              }}
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
                  background: Colors.card,
                  borderRadius: 20,
                  padding: 20,
                  width: "92%",
                  minWidth: 1000,
                  color: Colors.text, //"#fff",
                  boxShadow: "blue",
                  maxHeight: "80vh",
                  overflowY: "auto",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <form
                  onSubmit={handleCreateEvent}
                  style={{
                    background: "#2a2a35", // Darker card background
                    borderRadius: 20,
                    padding: 40,
                    width: "90%",
                    maxWidth: 600, // Limit width for better readability
                    color: "#fff",
                    maxHeight: "80vh", // 👈 KEY
                    overflowY: "auto", // 👈 KEY
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)", // subtle shadow
                    gap: 16, // consistent spacing
                  }}
                >
                  <h2 style={{ marginBottom: 20 }}>Create New Event</h2>

                  {/* Event Name */}
                  <input
                    type="text"
                    placeholder="Event name"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 10,
                      border: "1px solid #555",
                      background: "#1a1a22",
                      color: "#fff",
                      fontSize: 16,
                    }}
                  />

                  {/* Event Date */}
                  <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 10,
                      border: "1px solid #555",
                      background: "#1a1a22",
                      color: "#fff",
                      fontSize: 16,
                    }}
                  />

                  {/* Event Type */}
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 10,
                      border: "1px solid #555",
                      background: "#1a1a22",
                      color: "#fff",
                      fontSize: 16,
                    }}
                  >
                    <option value="">Select type</option>
                    {eventTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>

                  {/* Items */}
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        gap: 10,
                        width: "100%",
                        alignItems: "center",
                      }}
                    >
                      <input
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...items];

                          updated[index] = {
                            ...updated[index],
                            name: e.target.value,
                          };

                          setItems(updated);
                        }}
                        style={{
                          flex: 1,
                          padding: 10,
                          borderRadius: 10,
                          border: "1px solid #555",
                          background: "#1a1a22",
                          color: "#fff",
                          fontSize: 16,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setItems(items.filter((_, i) => i !== index))
                        }
                        style={{
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "none",
                          background: "#c42f2f",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setItems([
                        ...items,
                        { id: crypto.randomUUID(), name: "" },
                      ])
                    }
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 10,
                      border: "1px dashed #666",
                      background: "transparent",
                      color: "#aaa",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    + Add item
                  </button>

                  {/* Max Participants */}
                  <input
                    type="number"
                    placeholder="Max number of participants"
                    value={eventMaxCap || ""}
                    onChange={(e) => setEventMaxCap(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 10,
                      border: "1px solid #555",
                      background: "#1a1a22",
                      color: "#fff",
                      fontSize: 16,
                    }}
                  />

                  {/* Buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      marginTop: 20,
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        padding: 14,
                        borderRadius: 12,
                        border: "none",
                        background: "#1f8f4e",
                        color: "#fff",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: 16,
                      }}
                    >
                      Create
                    </button>

                    <button
                      type="button"
                      onClick={() => setCreateNewEvent(false)}
                      style={{
                        flex: 1,
                        padding: 14,
                        borderRadius: 12,
                        border: "none",
                        background: "#c42f2f",
                        color: "#fff",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: 16,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
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
                  background: "grey", //Colors.card,
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

                    <button
                      style={{
                        padding: 12,
                        border: "none",
                        borderRadius: 12,
                        background: "#000",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                      onClick={() => {
                        const shareLink = `${window.location.origin}/event/${selectedDay.entry.id}`;

                        navigator.clipboard.writeText(shareLink);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? "Copied!" : "Copy link to share"}
                    </button>

                    <motion.button
                      layoutId="create-feedbackemail"
                      style={{
                        padding: 12,
                        border: "none",
                        borderRadius: 12,
                        background: "#000",
                        color: "#fff",
                        fontWeight: "bold",
                        marginLeft: 20,
                      }}
                      onClick={() => setCreateFeedbackEmail(true)}
                    >
                      Draft and send Feedback email
                    </motion.button>

                    {createFeedbackEmail && (
                      <motion.div
                        onClick={() => setCreateFeedbackEmail(false)}
                        style={{
                          position: "fixed",
                          top: 0,
                          left: 0,
                          width: "100vw",
                          height: "100vh",
                          background: "rgba(0,0,0,0.6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 1000,
                        }}
                      >
                        <motion.div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            background: Colors.card,
                            borderRadius: 20,
                            padding: 30,
                            width: "90%",
                            maxWidth: 600,
                            color: Colors.text,
                            boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                          }}
                        >
                          <h2 style={{ margin: 0 }}>Draft feedback email</h2>

                          {/* Multiline textarea */}
                          <textarea
                            value={feedbackEmail}
                            onChange={(e) => setFeedbackEmail(e.target.value)}
                            placeholder="Write your message here..."
                            style={{
                              width: "100%",
                              minHeight: 180,
                              padding: 14,
                              borderRadius: 12,
                              border: "1px solid #444",
                              background: "#1a1a22", // darker field
                              color: "#fff",
                              fontSize: 15,
                              resize: "vertical",
                              outline: "none",
                              lineHeight: 1.5,
                            }}
                          />

                          {/* Buttons */}
                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              onClick={() => setCreateFeedbackEmail(false)}
                              style={{
                                padding: "10px 16px",
                                borderRadius: 10,
                                border: "none",
                                background: "#444",
                                color: "#fff",
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>

                            <button
                              onClick={handleSendFeedbackEmail} // hook this up
                              style={{
                                padding: "10px 18px",
                                borderRadius: 10,
                                border: "none",
                                background: "#1f8f4e",
                                color: "#fff",
                                fontWeight: "bold",
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                              }}
                            >
                              Send Email
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    <h3>
                      Number of bookings / max capacity: (
                      {selectedDay.entry.numberOfBookings} /{" "}
                      {selectedDay.entry.max_capacity})
                    </h3>

                    <h3>Orders</h3>

                    <table
                      style={{
                        width: "100%",
                        marginTop: 10,
                        borderCollapse: "collapse",
                        background: "#1a1a22",
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                    >
                      <thead style={{ background: "#2a2a35" }}>
                        <tr>
                          <th style={{ textAlign: "left", padding: 10 }}>
                            Item
                          </th>
                          <th style={{ textAlign: "left", padding: 10 }}>
                            Quantity
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {Object.entries(selectedDay.entry?.items || {}).map(
                          ([name, count]) => (
                            <tr
                              key={name}
                              style={{ borderTop: "1px solid #333" }}
                            >
                              <td style={{ padding: 10 }}>{name}</td>
                              <td style={{ padding: 10 }}>{count}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p style={{ opacity: 0.7 }}>No training logged.</p>
                )}
                <button
                  onClick={() => setSelectedDay(null)}
                  style={{
                    marginTop: 20,
                    width: "40%",
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
