import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../components/supabaseClient";

export default function Home() {
  const { eventId } = useParams();
  console.log("here: " + eventId);

  const [eventData, setEventData] = useState({}); // YYYY-MM-DD
  const [items, setItems] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

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
        console.log("here and: " + JSON.stringify(bookingData));

        await supabase.from("booking_items").insert({
          booking_id: bookingData.id,
          item_id: element.id,
        });
      });
    } catch (error) {
      console.log("error : " + error);
    }

    alert("Booked!");
  };

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
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
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
                  value={item.id}
                  onChange={(e) => handleItemToggle(item)}
                />
                {item.name}
              </label>
            ))}
          </div>
        )}

        <button type="submit">Book</button>
      </form>

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
        )}
      </div>
    </div>
  );
}
