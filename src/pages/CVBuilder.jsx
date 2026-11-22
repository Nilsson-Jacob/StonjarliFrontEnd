import { supabase } from "../components/CVsupabaseClient";

export default function Home() {
  const fetchUser = async () => {
    const { data, error } = await supabase
      .from("cv")
      .select("cv_text_swedish")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("jn: " + error);
    }

    return data;
  };

  return <div>CV : {JSON.stringify(fetchUser())}</div>;
}
