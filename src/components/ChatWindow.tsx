"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MessageBubble from "./MessageBubble";
import SuggestedQuestions from "./SuggestedQuestions";
import type { ObjectRecord } from "@/lib/supabase";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  object: ObjectRecord;
  onReset: () => void;
};

// 文単位でキューに追加して読み上げ（cancelしない）
function speakSentence(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find((v) => v.lang.startsWith("ja"));
  if (jaVoice) utterance.voice = jaVoice;
  window.speechSynthesis.speak(utterance);
}

// 文の区切り文字で分割（区切り文字を含む）
const SENTENCE_DELIMITERS = /([。！？\n])/;

export default function ChatWindow({ object, onReset }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 音声リストを事前にロード（一部ブラウザで必要）
  useEffect(() => {
    window.speechSynthesis?.getVoices();
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMessage: Message = { role: "user", content: text };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setStreaming(true);
      setShowSuggestions(false);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages,
            objectName: object.name,
            tone: object.tone,
            knowledge: object.knowledge,
            searchQuery: text,
          }),
        });

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No reader");

        let assistantContent = "";
        let unspokenBuffer = ""; // まだ読み上げていないテキスト
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                assistantContent += parsed.text;
                unspokenBuffer += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return updated;
                });

                // 文の区切りが来たら、そこまでを読み上げ
                if (ttsEnabled) {
                  const parts = unspokenBuffer.split(SENTENCE_DELIMITERS);
                  // 最後の要素は未完成の文の可能性があるので残す
                  if (parts.length >= 3) {
                    // 区切り文字で分割すると [文, 区切り, 残り, ...] になる
                    // 完成した文をすべて読み上げ
                    let toSpeak = "";
                    let i = 0;
                    while (i + 1 < parts.length) {
                      toSpeak += parts[i] + parts[i + 1];
                      i += 2;
                    }
                    if (toSpeak.trim()) {
                      speakSentence(toSpeak);
                    }
                    // 残りのバッファ（未完成の文）
                    unspokenBuffer = i < parts.length ? parts[i] : "";
                  }
                }
              } catch {
                // skip parse errors
              }
            }
          }
        }

        // 残りのバッファを読み上げ
        if (ttsEnabled && unspokenBuffer.trim()) {
          speakSentence(unspokenBuffer);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "エラーが発生しました。もう一度お試しください。" },
        ]);
      }

      setStreaming(false);
    },
    [messages, object, ttsEnabled]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    sendMessage(input.trim());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-bold text-gray-900">{object.name}</h2>
          <p className="text-xs text-gray-500">と会話中</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              setTtsEnabled(!ttsEnabled);
              if (ttsEnabled) window.speechSynthesis?.cancel();
            }}
            className={`text-lg px-2 py-1 rounded-lg border transition-colors ${
              ttsEnabled
                ? "border-blue-300 bg-blue-50 text-blue-600"
                : "border-gray-200 text-gray-400"
            }`}
            title={ttsEnabled ? "読み上げON" : "読み上げOFF"}
          >
            {ttsEnabled ? "\uD83D\uDD0A" : "\uD83D\uDD07"}
          </button>
          <button
            onClick={() => {
              window.speechSynthesis?.cancel();
              onReset();
            }}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 border border-gray-200 rounded-lg"
          >
            別の展示物
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {showSuggestions && object.suggested_questions.length > 0 && (
          <SuggestedQuestions
            questions={object.suggested_questions}
            onSelect={(q) => sendMessage(q)}
          />
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t bg-white px-4 py-3 flex gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          disabled={streaming}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          送信
        </button>
      </form>
    </div>
  );
}
