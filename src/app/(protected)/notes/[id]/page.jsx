import NoteEditorClient from "./NoteEditorClient";

export const metadata = {
  title: "Note Editor | MindBloom",
  description: "Edit, enrich, and manage your study notes.",
};

export default async function NoteEditorPage({ params }) {
  const { id } = await params;
  return <NoteEditorClient noteId={id} />;
}
