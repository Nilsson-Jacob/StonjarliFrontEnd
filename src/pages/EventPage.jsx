import { useParams } from "react-router-dom";

export default function Home() {
  const { eventId } = useParams();

  return <div>Hej {{ eventId }}</div>;
}
