import { useParams } from "react-router-dom";

export default function Home() {
  const { eventId } = useParams();
  console.log("here: " + eventId);

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
      Hej {eventId.toString()}
    </div>
  );
}
