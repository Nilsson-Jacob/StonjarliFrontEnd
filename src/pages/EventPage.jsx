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
          alignContent: "center",
        }}
      >
        <span>Bageri Baka</span>
      </div>
      Hej {eventId.toString()}
    </div>
  );
}
