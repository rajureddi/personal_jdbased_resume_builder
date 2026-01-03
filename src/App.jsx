import { useState } from "react";
import StepOne from "./pages/StepOne";
import Preview from "./pages/Preview";

export default function App() {
  const [pdfUrl, setPdfUrl] = useState(null);

  return pdfUrl ? (
    <Preview pdfUrl={pdfUrl} onBack={() => setPdfUrl(null)} />
  ) : (
    <StepOne onGenerated={setPdfUrl} />
  );
}
