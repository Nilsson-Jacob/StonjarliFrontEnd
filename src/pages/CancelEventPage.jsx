import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../components/supabaseClient";

import { motion } from "framer-motion";

export default function CancelBooking() {
  const { token } = useParams();

  const [booking, setBooking] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        // 1. Get booking by token
        const { data: bookingData, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("booking_token", token)
          .is("cancelled_at", null)
          .single();

        if (error) {
          setStatus("error");
          return;
        }

        if (!bookingData) {
          setStatus("cancelled");
          return;
        }

        setBooking(bookingData);

        // 2. Get event
        const { data: event } = await supabase
          .from("events")
          .select("*")
          .eq("id", bookingData.event_id)
          .single();

        setEventData(event);

        // 3. Get booking items
        const { data: bookingItems } = await supabase
          .from("booking_items")
          .select("*")
          .eq("booking_id", bookingData.id);

        setItems(bookingItems);

        setStatus("loaded");
      } catch (err) {
        console.log(err);
        setStatus("error");
      }
    };

    fetchBooking();
  }, [token]);

  const handleCancel = async () => {
    const { error } = await supabase
      .from("bookings")
      .update({ cancelled_at: new Date().toISOString() })
      .eq("booking_token", token)
      .is("cancelled_at", null);

    if (error) {
      alert("Failed to cancel");
    } else {
      setStatus("cancelled");
    }
  };

  // UI states
  if (status === "loading") return <p>Loading booking...</p>;
  if (status === "error")
    return <p>❌ Invalid booking link or already cancelled</p>;

  if (status === "cancelled") {
    return (
      <div
        style={{
          textAlign: "center",
          background: "#5c1e2e",
          color: "#DBACB4",
          height: 1000,
          marginTop: -20,
        }}
      >
        <h2>❌ Booking cancelled</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        textAlign: "center",
        background: "#5c1e2e",
        color: "#DBACB4",
        height: 1000,
        marginTop: -20,
      }}
    >
      <h2>Cancel booking</h2>

      {eventData && (
        <p>
          <strong>{eventData.title}</strong> –{" "}
          {eventData?.date?.substring(0, 10)} -{" "}
          {eventData?.date?.substring(11, 16)}{" "}
        </p>
      )}

      {booking && (
        <div>
          <p>Name: {booking.name}</p>
          <p>Email: {booking.email}</p>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <h4>Selected items:</h4>
        {items.map((item) => (
          <p key={item.id}>{item.name}</p>
        ))}
      </div>

      <motion.button
        onClick={handleCancel}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          marginTop: 30,
          padding: "12px 20px",
          background: "#d9534f",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Cancel this booking
      </motion.button>
    </div>
  );
}
