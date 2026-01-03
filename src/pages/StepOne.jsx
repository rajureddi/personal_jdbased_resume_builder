import { useState } from "react";

export default function StepOne({ onGenerated }) {
  const [role, setRole] = useState("ML Engineer");
  const [customRole, setCustomRole] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);

  const finalRole = role === "Other" ? customRole : role;

  const generate = async () => {
    if (!finalRole) return alert("Enter a role");

    setLoading(true);
    const res = await fetch("http://localhost:5000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: finalRole, jd })
    });

    const data = await res.json();
    onGenerated(data.pdfUrl);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto" }}>
      <h2>AI Resume Builder</h2>

      <label>Target Role</label>
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option>ML Engineer</option>
        <option>AI Engineer</option>
        <option>Backend Developer</option>
        <option>Frontend Developer</option>
        <option>Other</option>
      </select>

      {role === "Other" && (
        <input
          placeholder="Custom role"
          value={customRole}
          onChange={e => setCustomRole(e.target.value)}
        />
      )}

      <label>Job Description</label>
      <textarea rows={6} value={jd} onChange={e => setJd(e.target.value)} />

      <button onClick={generate}>
        {loading ? "Generating..." : "Generate Resume"}
      </button>
    </div>
  );
}
