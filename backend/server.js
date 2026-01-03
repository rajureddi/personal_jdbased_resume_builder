import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import { execSync } from "child_process";
import { GoogleGenerativeAI } from "@google/generative-ai";
import profile from "../src/data/profile.js";

const app = express();
app.use(cors());
app.use(express.json());

// Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/generate", async (req, res) => {
  const { role, jd = "" } = req.body;

  // -----------------------------
  // 1️⃣ ROLE-BASED PROJECT SELECTION
  // -----------------------------
  const projects = profile.projects
    .filter(p => p.relevance[role])
    .sort((a, b) => b.relevance[role] - a.relevance[role]);

  let ai;

  // -----------------------------
  // 2️⃣ GEMINI AI (SUMMARY + BULLETS)
  // -----------------------------
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

    const prompt = `
You are an expert technical resume writer.

Candidate background:
- Final-year B.Tech student in Computer Science and Engineering (AIML)
- Strong academic foundation in Machine Learning, Deep Learning, NLP, Computer Vision
- Hands-on experience building AI/ML and software engineering projects
- Comfortable with Python, data structures, and applied ML systems

Candidate skills:
${Object.values(profile.skills).flat().join(", ")}

Target Role:
${role}

Job Description:
${jd}

Projects:
${projects.map(p => p.title).join("\n")}

TASK:
1. Write a PROFESSIONAL SUMMARY of EXACTLY 6-7 lines that:
   - Explicitly mentions the candidate’s Computer Science and Engineering (AIML) background
   - Clearly connects AIML concepts (ML, DL, NLP, CV, data-driven systems) to the target role
   - Reflects key technical expectations implied by the job description
   - Sounds role-specific, not generic
  
   - Uses ATS-friendly, technical, professional language

2. For EACH project, write EXACTLY 3 concise resume bullet points that:
   - Are relevant to the target role
   - Use technical, measurable phrasing
   - Avoid vague or generic statements

STRICT RULES:
- Do NOT use filler phrases (e.g., "passionate", "highly motivated", "eager to learn")
- Do NOT exaggerate experience or claim years of industry work
- Do NOT repeat the job description verbatim
- Do NOT invent skills, tools, or experience
- Write in third person
- Output STRICT JSON ONLY in the following format:

{
  "summary": "4–5 line professional summary text",
  "projects": {
    "Project Title": ["bullet 1", "bullet 2", "bullet 3"]
  }
}
`;

    const result = await model.generateContent(prompt);
    const clean = result.response.text().replace(/```json|```/g, "").trim();
    ai = JSON.parse(clean);

  } catch (err) {
    // -----------------------------
    // 3️⃣ OFFLINE / NO-AI FALLBACK
    // -----------------------------
    ai = {
      summary:
        `Final-year B.Tech Computer Science and Engineering (AIML) student with a strong foundation in machine learning, data-driven systems, and software development. Experienced in applying AIML concepts through academic and project-based implementations aligned with ${role} responsibilities. Seeking to contribute technical and analytical skills to role-focused, real-world engineering problems.`,
      projects: Object.fromEntries(
        projects.map(p => [
          p.title,
          [
            "Designed and implemented core project functionality using appropriate technologies",
            "Applied domain-specific concepts to solve real-world technical problems",
            "Demonstrated strong analytical thinking and problem-solving abilities"
          ]
        ])
      )
    };
  }

  // -----------------------------
  // 4️⃣ FILL LaTeX TEMPLATE
  // -----------------------------
  let tex = fs.readFileSync("backend/latex/base.tex", "utf8");

  tex = tex
    .replace("{NAME}", profile.name)
    .replace("{PHONE}", profile.phone)
    .replace("{EMAIL}", profile.email)
    .replace("{LINKEDIN}", profile.linkedin)
    .replace("{GITHUB}", profile.github)
    .replace("{PORTFOLIO}", profile.portfolio)
    .replace("{SUMMARY}", ai.summary);

  tex = tex.replace(
    "{EDUCATION}",
    profile.education
      .map(e =>
        `\\textbf{${e.degree}}, ${e.institute} (${e.year})${e.cgpa ? ` | CGPA: ${e.cgpa}` : ""}\\\\`
      )
      .join("")
  );

  tex = tex.replace("{COURSEWORK}", profile.coursework.join(", "));

  tex = tex.replace(
    "{PROJECTS}",
    projects
      .map(
        p => `\\textbf{${p.title}}\\\\
\\begin{itemize}
${ai.projects[p.title].map(b => `\\item ${b}`).join("\n")}
\\end{itemize}`
      )
      .join("\n")
  );

  tex = tex.replace(
    "{CERTIFICATIONS}",
    profile.certifications.map(c => `${c}\\\\`).join("")
  );

  tex = tex
    .replace("{LANGUAGES}", profile.skills.languages.join(", "))
    .replace("{FRAMEWORKS}", profile.skills.frameworks.join(", "))
    .replace("{ML}", profile.skills.ml.join(", "))
    .replace("{TOOLS}", profile.skills.tools.join(", "));

  // -----------------------------
  // 5️⃣ GENERATE PDF
  // -----------------------------
  fs.mkdirSync("backend/output", { recursive: true });
  fs.writeFileSync("backend/output/resume.tex", tex);

  execSync("pdflatex -interaction=nonstopmode resume.tex", {
    cwd: "backend/output"
  });

  // -----------------------------
  // 6️⃣ RETURN PDF PREVIEW URL
  // -----------------------------
  res.json({ pdfUrl: "http://localhost:5000/resume.pdf" });
});

// Serve generated PDF
app.get("/resume.pdf", (req, res) => {
  res.sendFile(process.cwd() + "/backend/output/resume.pdf");
});

app.listen(5000, () =>
  console.log("Backend running at http://localhost:5000")
);
