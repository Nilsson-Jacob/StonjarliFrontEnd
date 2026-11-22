import { supabase } from "../components/CVsupabaseClient";
import React, { useState, useEffect } from "react";

export default function Home() {
  const [text, setText] = useState("");
  var insert = false;

  const fetchUser = async () => {
    const { data, error } = await supabase.from("cv").select("*");

    setText(data);
    console.log("data: " + JSON.stringify(data));

    if (error) {
      console.log("jn: " + error);
    }

    if (insert) {
      const { dataCV } = await supabase
        .from("cv")
        .insert({
          cv_text_swedish: { test: "newCVdata" },
        })
        .select();

      console.log("cv text: " + dataCV);
    }

    return data;
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return <div>CV : {JSON.stringify(text)}</div>;
}
