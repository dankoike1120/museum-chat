type Props = {
  role: "user" | "assistant";
  content: string;
};

export default function MessageBubble({ role, content }: Props) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-gold text-dark rounded-br-md font-medium"
            : "bg-dark-card text-text-primary border border-dark-border rounded-bl-md"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
