import { useParams } from "react-router-dom";

export default function Home() {
  const { eventId } = useParams();
  console.log("here: " + eventId);
  return <div>Hej</div>;
}
