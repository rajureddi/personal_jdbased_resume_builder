export default function Preview({ pdfUrl, onBack }) {
  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <iframe
        src={pdfUrl}
        style={{ width: "100%", height: "90vh" }}
        title="Resume Preview"
      />
      <a href={pdfUrl} download="RAJU_BANDAM_RESUME.pdf">
        Download PDF
      </a>
    </div>
  );
}
