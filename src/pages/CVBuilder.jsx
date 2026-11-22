import { supabase } from "../components/supabaseClientCV";

export default function Home() {
  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
  };

  return <div>CV : {fetchUser}</div>;
}
