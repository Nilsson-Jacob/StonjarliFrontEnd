import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../components/supabaseClient";

import { motion, AnimatePresence } from "framer-motion";

const inputStyle = {
  width: "95%",
  padding: 10,
  marginTop: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 14,
};

export default function Home() {
  const { eventId } = useParams();
  console.log("here: " + eventId);

  const [eventData, setEventData] = useState({}); // YYYY-MM-DD
  const [items, setItems] = useState([]);
  const [bookingCount, setBookingCount] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: eventData } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single();

        const { data: eventItems } = await supabase
          .from("items")
          .select("*")
          .eq("event_id", eventId);

        const { data: bookingCount } = await supabase
          .from("bookings")
          .select("count")
          .is("cancelled_at", null);

        setBookingCount(bookingCount);

        setEventData(eventData);
        setItems(eventItems);
      } catch (error) {
        console.log("error: " + error);
      }
    };

    fetchData();
  }, [eventId]);

  const handleItemToggle = (item) => {
    const exists = selectedItems.find((i) => i.id === item.id);

    if (exists) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔥 important

    if (!name || !email || !selectedItems) {
      alert("Fill everything");
      return;
    }

    try {
      const token = crypto.randomUUID();

      const { data: bookingData } = await supabase
        .from("bookings")
        .insert({
          event_id: eventId,
          name,
          email,
          booking_token: token,
        })
        .select()
        .single();

      selectedItems.forEach(async (element) => {
        await supabase.from("booking_items").insert({
          booking_id: bookingData.id,
          item_id: element.id,
          name: element.name,
        });
      });

      await fetch(
        "https://chwjjrgyubbdjqawlolx.supabase.co/functions/v1/sendBookingEmail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // apikey: process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
            //Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY}`,
          },
          body: JSON.stringify({
            name,
            email,
            eventTitle: eventData.title,
            cancelLink: `${window.location.origin}/cancel/${token}`,
          }),
        }
      );
    } catch (error) {
      console.log("error : " + error);
    }

    setBooked(true);
  };

  return (
    <div>
      <div
        style={{
          height: "7vh",
          background: "#ece7db",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 400 }}>Bageri Baka</span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 40,
        }}
      >
        <div
          style={{
            width: 500,
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            background: "white",
          }}
        >
          {eventData && (
            <div style={{ marginBottom: 20, textAlign: "center" }}>
              <h2 style={{ margin: 0 }}>{eventData.title}</h2>
              <p style={{ margin: 0, color: "#666" }}>
                {eventData?.date?.substring(0, 10)}
              </p>
              <p style={{ margin: 0, color: "#666" }}>
                Number of available spots {eventData?.max_capacity}-
                {bookingCount.valueOf}
              </p>
            </div>
          )}

          <AnimatePresence>
            {!booked && (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -200 }}
                transition={{ duration: 0.5 }}
              >
                <input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />

                <input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />

                {items && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ marginBottom: 8, fontWeight: 500 }}>
                      Choose breakfast:
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {items.map((item) => {
                        const selected = selectedItems.find(
                          (i) => i.id === item.id
                        );

                        return (
                          <label
                            key={item.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "10px 12px",
                              borderRadius: 8,
                              border: selected
                                ? "2px solid #000"
                                : "1px solid #ddd",
                              cursor: "pointer",
                            }}
                          >
                            <span>{item.name}</span>
                            <input
                              type="checkbox"
                              checked={!!selected}
                              onChange={() => handleItemToggle(item)}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    marginTop: 24,
                    width: "95%",
                    padding: 12,
                    borderRadius: 8,
                    border: "none",
                    background: "#000",
                    color: "white",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  Book
                </button>
              </motion.form>
            )}

            {booked && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: "center" }}
              >
                <h2>✅ Booking confirmed!</h2>
                <p>Check your email to manage your booking.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/*
  return (
    <div>
      <div
        style={{
          height: "7vh",
          background: "#ece7db",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 30, fontWeight: 300 }}>Bageri Baka</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {eventData && (
          <div>
            <span style={{ fontSize: 25, fontWeight: 500 }}>
              {eventData.title} - {eventData?.date?.substring(0, 10)}
            </span>
          </div>
        )}
        
        <AnimatePresence>
          {!booked && (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: -600,
                scale: 0.7,
                rotate: -10,
              }}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1], // custom cubic-bezier (fast start, slow end)
              }}
            >
              <input
                style={{ marginTop: 10 }}
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                style={{ display: "block", marginTop: 10 }}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {items && (
                <div style={{ marginTop: 16 }}>
                  <span>Val av frukost:</span>
                  {items.map((item) => (
                    <label
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <input
                        type="checkbox"
                        onChange={() => handleItemToggle(item)}
                      />
                      {item.name}
                    </label>
                  ))}
                </div>
              )}

              <button type="submit">Book</button>
            </motion.form>
          )}
          {booked && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ justifyContent: "center" }}
            >
              <h2>✅ Booking confirmed!</h2>
              <h4>Please use the link in email to cancel if needed</h4>
            </motion.div>
          )}
        </AnimatePresence>

        {/* eventData && (
          <div>
            <span style={{ fontSize: 25, fontWeight: 500 }}>
              {eventData.title} - {eventData?.date?.substring(0, 10)}
            </span>
          </div>
        )}

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "40vw",
            padding: 10,
            marginTop: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />

        {items && (
          <div style={{ marginTop: 16 }}>
            <span>Val av frukost:</span>
            {items.map((item) => (
              <label
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <input
                  type="checkbox"
                  value={item.id}
                  onChange={(e) => handleItemToggle(item)}
                />
                {item.name}
              </label>
            ))}
          </div>
        )*/
/*}
      </div>
    </div>
  );
}*/
