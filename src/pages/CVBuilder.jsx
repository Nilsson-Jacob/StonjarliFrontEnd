import { supabase } from "../components/CVsupabaseClient";
import React, { useState, useEffect } from "react";

export default function Home() {
  const [text, setText] = useState("");

  const fetchUser = async () => {
    const { data, error } = await supabase.from("cv").select("*");

    setText(data);
    console.log("data: " + JSON.stringify(data));

    if (error) {
      console.log("jn: " + error);
    }

    return data;
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return <div>CV : {JSON.stringify(text)}</div>;
}
