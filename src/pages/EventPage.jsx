import { useParams } from "react-router-dom";

export default function Home() {
  const { eventId } = useParams();
  console.log("here: " + eventId);

  return (
    <div>
      <div style={{ height: 200, background: "blue", alignItems: "center" }}>
        <h2>Bageri Baka</h2>
      </div>
      Hej {eventId.toString()}
    </div>
  );
}
