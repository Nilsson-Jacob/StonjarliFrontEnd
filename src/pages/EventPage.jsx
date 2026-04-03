import { useParams } from "react-router-dom";

export default function Home() {
  const { eventId } = useParams();
  console.log("here: " + eventId);

  return (
    <div>
      <div
        style={{ height: "10vh", background: "#ece7db", alignItems: "center" }}
      >
        <h2>Bageri Baka</h2>
      </div>
      Hej {eventId.toString()}
    </div>
  );
}
