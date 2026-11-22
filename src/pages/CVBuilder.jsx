import { supabase } from "../components/CVsupabaseClient";
import React, { useState, useEffect } from "react";

export default function Home() {
  const [text, setText] = useState("");

  console.log("text : " + text);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.from("cv").select("*");

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      setText(data);
      console.log("data:" + data);

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

  return (
    <div style={styles.page}>
      <div style={styles.cardContainer}>
        <div style={styles.cardStyle}>
          <h5 style={{ fontSize: "0.8rem" }}>Klicka för att skapa CV</h5>
        </div>
      </div>
    </div>
  );
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

  cardContainer: {
    width: "100%",
    maxWidth: 360,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  cardStyle: {
    background: "#1a1a22",
    borderRadius: 20,
    padding: 24,
    minHeight: 140,
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: "bold",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
  },
};
