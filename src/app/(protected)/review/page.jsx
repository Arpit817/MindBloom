import ReviewClient from "./ReviewClient";

export const metadata = {
  title: "Daily Review | MindBloom",
  description: "Review active recall notes and flashcards with spaced repetition intervals.",
};

export default function ReviewPage() {
  return <ReviewClient />;
}
