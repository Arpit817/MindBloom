import NotesClient from "./NotesClient";

export const metadata = {
  title: "Notes | MindBloom",
  description: "Write, manage, and review your active recall study notes.",
};

export default function NotesPage({ searchParams }) {
  const subjectId = searchParams?.subjectId || "";
  return <NotesClient initialSubjectId={subjectId} />;
}
