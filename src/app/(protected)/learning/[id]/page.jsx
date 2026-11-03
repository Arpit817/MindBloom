import PlanDetailClient from "./PlanDetailClient";

export const metadata = {
  title: "Learning Plan Roadmap | MindBloom",
  description: "Track your day-by-day learning plan and syllabus progress.",
};

export default async function PlanDetailPage({ params }) {
  const { id } = await params;
  return <PlanDetailClient planId={id} />;
}

