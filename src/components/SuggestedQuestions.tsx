type Props = {
  questions: string[];
  onSelect: (question: string) => void;
};

export default function SuggestedQuestions({ questions, onSelect }: Props) {
  if (questions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-4">
      <p className="text-sm text-gray-500 text-center">
        何を知りたいですか？
      </p>
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
