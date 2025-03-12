"use client";

import { useState, useRef, useEffect } from "react";
import { Message } from "@/app/types";

export default function Chat(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (input.trim() === "") return;

    setError(null); // Reset error state
    
    // Tambahkan pesan pengguna ke state
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("Mengirim pesan ke API route");
      
      // Kirim permintaan ke API route dengan timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 detik timeout
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Parse response
      const data = await response.json();
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        console.error("Error response:", data);
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      // Tambahkan respons dari AI ke state
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Catch error:", error);
      
      // Handle specific error types
      let errorMessage = "Maaf, terjadi kesalahan. Silakan coba lagi nanti.";
      
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "Permintaan timeout. Server tidak merespons tepat waktu.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full md:w-3/4 lg:w-9/12 mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">AI Chatbot</h1>
      
      {error && (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
      </div>
      )}
      
      <div className="flex-1 overflow-y-auto mb-4  rounded-md p-2 md:p-4">
        {messages.length === 0 && (
          <div className="text-gray-500 text-center py-8 animate-pulse duration-500 transition-all">
          Kirim pesan untuk memulai percakapan dengan AI
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
          key={index}
          className={`mb-4 p-3 ${
            message.role === "user"
            ? "bg-blue-100 ml-auto max-w-[75%] p-4 rounded-2xl"
            : "bg-gray-100 mr-auto max-w-[75%] rounded-lg"
          }`}
          >
          <p className="text-sm font-semibold mb-1">
            {message.role === "user" ? "Anda" : "AI"}
          </p>
          <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 rounded-lg p-3 mr-auto max-w-[75%]">
          <p className="text-sm font-semibold mb-1">AI</p>
          <p className="animate-pulse">Sedang mengetik...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pesan Anda di sini..."
          className="flex-1 p-2 border-2 border-gray-300 rounded-xl"
          disabled={isLoading}
        />
        {input.length > 0 && (
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-700 shadow-lg disabled:bg-gray-500"
            disabled={isLoading || input.trim() === ""}
              >
            Kirim
          </button>
        )}
      </form>
    </div>
  );
}