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
  }, [text]);

  return <div style={styles.page}>CV : {JSON.stringify(text)}</div>;
}

// ===== STYLES =====
const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg,rgba(57,13,35,0.9) 0%,rgb(29,29,58) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
};
