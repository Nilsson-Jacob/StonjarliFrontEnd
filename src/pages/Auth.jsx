import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const Colors = {
  primary500: "#72063c",
  primary600: "#640233",
  primary700: "#4e0329",
  primary800: "#4e0329",
  primary1000: "#4e0335",
  accent500: "#ddb52f",
};

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("signin"); // signin | signup | magic
  const [message, setMessage] = useState("");

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          console.log("Logged in:", session.user);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account.");
      }

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setMessage("Magic link sent. Check your email.");
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Maxhapp</h1>
        <p style={styles.subtitle}>
          {mode === "signup"
            ? "Create your account"
            : mode === "magic"
            ? "Sign in with magic link"
            : "Welcome back"}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {mode !== "magic" && (
            <input
              style={styles.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          <button style={styles.button} disabled={loading}>
            {loading
              ? "Loading..."
              : mode === "signup"
              ? "Sign up"
              : mode === "magic"
              ? "Send magic link"
              : "Sign in"}
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.switches}>
          <button onClick={() => setMode("signin")} style={styles.link}>
            Sign in
          </button>
          <button onClick={() => setMode("signup")} style={styles.link}>
            Sign up
          </button>
          <button onClick={() => setMode("magic")} style={styles.link}>
            Magic link
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(180deg, #4e0329 0%, #ddb52f 100%)",
  },

  card: {
    background: Colors.primary600,
    padding: "40px",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "380px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
    textAlign: "center",
  },

  title: {
    color: "white",
    fontSize: "32px",
    marginBottom: "8px",
  },

  subtitle: {
    color: Colors.accent500,
    marginBottom: "24px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  input: {
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    fontSize: "16px",
    outline: "none",
  },

  button: {
    marginTop: "10px",
    padding: "14px",
    borderRadius: "18px",
    border: "none",
    background: Colors.accent500,
    color: Colors.primary700,
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
  },

  switches: {
    marginTop: "24px",
    display: "flex",
    justifyContent: "space-between",
  },

  link: {
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    opacity: 0.8,
  },

  message: {
    marginTop: "16px",
    color: Colors.accent500,
    fontSize: "14px",
  },
};
