import profile from "../data/profile.js";

export default function ResumePreview({ data }) {
  return (
    <div
      className="resume-preview bg-white mx-auto shadow p-10"
      style={{
        width: "210mm",
        minHeight: "297mm"
      }}
    >
      {/* Header */}
      <center>
        <div style={{ fontSize: "18pt", fontWeight: "bold" }}>
          {profile.name}
        </div>
        <div>
          {profile.phone} | {profile.email} | {profile.linkedin} |{" "}
          {profile.github} | {profile.portfolio}
        </div>
      </center>

      <Section title="Professional Summary">
        <p>(AI-generated summary appears in DOCX)</p>
      </Section>

      <Section title="Education">
        {profile.education.map((e, i) => (
          <p key={i}>
            <strong>{e.degree}</strong>, {e.institute} ({e.year})
            {e.cgpa && ` | CGPA: ${e.cgpa}`}
          </p>
        ))}
      </Section>

      <Section title="Relevant Coursework">
        <p>{profile.coursework.join(", ")}</p>
      </Section>

      <Section title="Certifications">
        {profile.certifications.map((c, i) => (
          <p key={i}>{c}</p>
        ))}
      </Section>

      <Section title="Technical Skills">
        <p>
          <strong>Languages:</strong> {profile.skills.languages.join(", ")} <br />
          <strong>Frameworks:</strong> {profile.skills.frameworks.join(", ")} <br />
          <strong>ML/AI:</strong> {profile.skills.ml.join(", ")} <br />
          <strong>Tools:</strong> {profile.skills.tools.join(", ")}
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ fontWeight: "bold", fontSize: "11pt" }}>
        {title}
      </div>
      {children}
    </div>
  );
}
