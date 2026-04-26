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

  const [eventData, setEventData] = useState({}); // YYYY-MM-DD
  const [items, setItems] = useState([]);
  const [bookingCount, setBookingCount] = useState({});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  //Notify
  const [notifyEmail, setNotifyEmail] = useState("");
  const [waitlisted, setWaitlisted] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  const [booked, setBooked] = useState(false);

  useEffect(() => {
    if (booked) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [booked]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        /*
        const { data: eventData } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single();*/

        const { data: eventData } = await supabase
          .from("events")
          .select(
            `
    *,
    companies (
      id,
      name,
      primary_color,
      secondary_color
    )
      ,
    event_types (
      id,
      name,
      label,
      event_type_items (
        id,
        name
      )
    )
  `
          )
          .eq("id", eventId)
          .single();

        const { data: eventItems } = await supabase
          .from("items")
          .select("*")
          .eq("event_id", eventId);

        const { data: bookingCount } = await supabase
          .from("bookings")
          .select("count")
          .eq("event_id", eventId)
          .is("cancelled_at", null);

        const { data: queueCount } = await supabase
          .from("waitlist")
          .select("count")
          .eq("event_id", eventId)
          .eq("status", "waiting");

        setBookingCount(bookingCount);
        setEventData(eventData);
        setItems(eventItems);

        setQueueCount(queueCount[0].count);
      } catch (error) {
        console.log("error: " + error);
      }
    };

    fetchData();
  }, [eventId]);

  const notifyMe = async function () {
    if (!notifyEmail) {
      alert("fill out email");
      return;
    }

    const claimToken = crypto.randomUUID();

    await supabase.from("waitlist").insert({
      event_id: eventId,
      email: notifyEmail,
      claim_token: claimToken,
      company_id: eventData.company_id,
    });

    setWaitlisted(true);
  };

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

      const { data: bookingData, error } = await supabase
        .from("bookings")
        .insert({
          event_id: eventId,
          name,
          email,
          booking_token: token,
          company_id: eventData.company_id,
        })
        .select()
        .single();

      console.log("BOOKING DATA:", bookingData);
      console.log("BOOKING ERROR:", error);

      selectedItems.forEach(async (element) => {
        await supabase.from("booking_items").insert({
          booking_id: bookingData.id,
          item_id: element.id,
          name: element.name,
        });
      });

      if (bookingData && !(bookingData.length === 0)) {
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
      }
    } catch (error) {
      console.log("error : " + error);
    }

    setBooked(true);
  };

  const capacity = eventData?.max_capacity ?? 0;
  const bookedCount = bookingCount?.[0]?.count ?? 0;

  const spotsLeft = capacity - bookedCount;
  const hasSpots = spotsLeft > 0;

  if (capacity === 0 && bookedCount === 0) {
    return null; // or loader
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        //background: "#5c1e2e",
        background: eventData?.companies?.primary_color,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          // background: "#5c1e2e",
          background: eventData?.companies?.primary_color,
        }}
      >
        <div
          style={{
            width: 500,
            padding: 24,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            //background: "#5c1e2e",
            background: eventData?.companies?.primary_color,

            //color: "#DBACB4",
            color: eventData?.companies?.secondary_color,
            height: 1000,
          }}
        >
          {eventData && (
            <div style={{ marginBottom: 20, textAlign: "center" }}>
              <h1>{eventData?.companies?.name}</h1>
              <h2 style={{ margin: 0 }}>{eventData.title}</h2>
              <p style={{ margin: 0 }}>
                {eventData?.date?.substring(0, 10)} -{" "}
                {eventData?.date?.substring(11, 16)}
              </p>

              {!booked && hasSpots && (
                <>
                  <p style={{ margin: 0 }}>
                    Number of available spots: {spotsLeft}
                  </p>
                  <p>Adress: {eventData?.address}</p>
                  <h4>{eventData?.description}</h4>
                </>
              )}

              {!booked && !hasSpots && (
                <>
                  <p style={{ margin: 0 }}>
                    Event is fully booked: {queueCount} in queue
                  </p>
                  <h3>
                    If you fill in your email below we can send an email if a
                    spot becomes available
                  </h3>
                  <input
                    placeholder="Email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    style={inputStyle}
                  />
                  <button
                    onClick={notifyMe}
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
                    Add me to queue
                  </button>
                  {waitlisted && (
                    <h3>Thank you we will notify you if a spot is available</h3>
                  )}
                </>
              )}
            </div>
          )}

          <AnimatePresence>
            {hasSpots && !booked && (
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

                <p style={{ marginBottom: 8, fontWeight: 500 }}>
                  {eventData?.event_types?.label ?? "Choose breakfast"}
                </p>

                {items && (
                  <div style={{ marginTop: 16 }}>
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
