import { supabase } from "../components/CVsupabaseClient";

export default function Home() {
  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
  };

  return <div>CV : {fetchUser}</div>;
}
