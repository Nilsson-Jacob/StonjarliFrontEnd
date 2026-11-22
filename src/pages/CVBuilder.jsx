import { supabase } from "../components/CVsupabaseClient";
import React, { useState, useEffect } from "react";

export default function Home() {
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.from("cv").select("*");

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      setText(data);
      console.log("data:", data);

      // Insert test data if needed
      const insert = false;

      if (insert) {
        const { data: dataCV, error: insertError } = await supabase
          .from("cv")
          .insert({
            cv_text_swedish: { test: "newCVdata" },
          })
          .select();

        if (insertError) {
          console.error("Insert error:", insertError);
        } else {
          console.log("cv text:", dataCV);
        }
      }
    };

    fetchUser();
  }, []);

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
