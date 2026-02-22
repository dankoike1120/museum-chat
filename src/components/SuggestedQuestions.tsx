type Props = {
  questions: string[];
  onSelect: (question: string) => void;
};

export default function SuggestedQuestions({ questions, onSelect }: Props) {
  if (questions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-4">
      <p className="text-sm text-text-muted text-center">
        何を知りたいですか？
      </p>
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className="w-full text-left px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-sm text-text-primary hover:border-gold/50 hover:bg-gold/5 transition-all duration-200"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
