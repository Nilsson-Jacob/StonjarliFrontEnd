import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../components/supabaseClient";

export default function Home() {
  const { eventId } = useParams();
  console.log("here: " + eventId);

  const [eventData, setEventData] = useState({}); // YYYY-MM-DD
  const [items, setItems] = useState([]);

  /* const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);*/

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
          .eq("id", eventId)
          .single();

        setEventData(eventData);
        setItems(eventItems);
      } catch (error) {
        console.log("error: " + error);
      }
    };

    fetchData();
  }, [eventId]);

  return (
    <div>
      <div
        style={{
          height: "10vh",
          background: "#ece7db",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 30, fontWeight: 300 }}>Bageri Baka</span>
        </div>
      </div>
      {eventData && (
        <div>
          <span style={{ font: 40 }}>{eventData.title}</span>
        </div>
      )}
      {items && (
        <div>
          <span style={{ font: 20 }}>{items.toString()}</span>
        </div>
      )}
    </div>
  );
}
