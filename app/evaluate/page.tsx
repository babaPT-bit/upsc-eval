import UPSCEvaluator from "../components/UPSCEvaluator";

export const metadata = {
  title: "Evaluate — Abhyaas AI",
  description: "Upload your UPSC Mains answer sheet or type your answer. Get scored across 7 dimensions by an AI calibrated on examiner behavior.",
};

export default function EvaluatePage() {
  return <UPSCEvaluator />;
}
