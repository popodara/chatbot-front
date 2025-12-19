import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Square, AlertCircle, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { API_ROUTE } from "../../../config";

import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  result?: any;
  needsHuman?: boolean;
}

const typeWriter = (
  fullText: string,
  onUpdate: (partial: string) => void,
  onDone: () => void,
  charsPerFrame = 3,
) => {
  let i = 0;
  const timer = setInterval(() => {
    i += charsPerFrame;
    if (i >= fullText.length) {
      i = fullText.length;
      onUpdate(fullText);
      clearInterval(timer);
      onDone();
    } else {
      onUpdate(fullText.slice(0, i));
    }
  }, 16);
  return timer;
};

const TypingIndicator = () => (
  <div className="flex items-start gap-3 max-w-3xl">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-lg">
      🤖
    </div>
    <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-700 shadow-sm border border-gray-200">
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <motion.div
            className="h-2 w-2 rounded-full bg-gray-400"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="h-2 w-2 rounded-full bg-gray-400"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="h-2 w-2 rounded-full bg-gray-400"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          />
        </div>
        <span className="ml-2 text-xs text-gray-500">Traitement en cours...</span>
      </div>
    </div>
  </div>
);

const HumanNeededBadge = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-200 px-4 py-2.5 text-sm shadow-sm"
  >
    <AlertCircle size={18} className="text-orange-500" />
    <span className="text-orange-700 font-medium">Intervention humaine requise</span>
  </motion.div>
);

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const [needsHumanIntervention, setNeedsHumanIntervention] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Bonjour! Je suis Aicha, l'assistante pour les réalisations. Comment puis‑je vous aider aujourd'hui?",
      timestamp: new Date(),
    },
  ]);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [processingTimer, setProcessingTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typeWriterRef = useRef<number | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTypingIndicator]);

  useEffect(() => {
    return () => {
      if (typeWriterRef.current) {
        clearInterval(typeWriterRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (processingTimer) {
        clearInterval(processingTimer);
      }
    };
  }, [processingTimer]);

  const handleStop = () => {
    if (typeWriterRef.current) {
      clearInterval(typeWriterRef.current);
      typeWriterRef.current = null;
    }
    setIsTyping(false);
    setIsLoading(false);
    setShowTypingIndicator(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setProcessingTime(0);
    const timer = setInterval(() => {
      setProcessingTime(prev => prev + 1);
    }, 1000);
    setProcessingTimer(timer);

    if (typeWriterRef.current) {
      clearInterval(typeWriterRef.current);
      typeWriterRef.current = null;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setIsTyping(false);
    setShowTypingIndicator(true);

    try {
      const conversationHistory = updatedMessages
        .slice(1)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const res = await fetch(`${API_ROUTE}/api/chat/ask/realisation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sessionId: "8766767", 
          message: trimmed,
          conversationHistory: conversationHistory
        }),
      });
      const data = await res.json();
      
      if (processingTimer) {
        clearInterval(processingTimer);
        setProcessingTimer(null);
      }
      setShowTypingIndicator(false);

      if (data?.result?.bot) {
        const answer = data.result.bot;
        const needsHuman = data.result.needsHuman || false;

        if (needsHuman) {
          setNeedsHumanIntervention(true);
        }

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          result: data.result,
          needsHuman: needsHuman
        };

        const finalMessages = [...updatedMessages, botMessage];
        setMessages(finalMessages);
        setIsTyping(true);

        typeWriterRef.current = typeWriter(
          answer,
          (partial) => {
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = {
                ...copy[copy.length - 1],
                content: partial,
              };
              return copy;
            });
          },
          () => {
            setIsTyping(false);
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
          },
          4
        ) as unknown as number;
      } else {
        setShowTypingIndicator(false);
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      if (processingTimer) {
        clearInterval(processingTimer);
        setProcessingTimer(null);
      }
      setShowTypingIndicator(false);
      setIsLoading(false);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Oops! Une erreur s'est produite. Veuillez réessayer.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold shadow-lg">
              🤖
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Réalisations - Assistant IA
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-gray-600">En ligne</span>
              </div>
            </div>
          </div>
          
          {needsHumanIntervention && <HumanNeededBadge />}
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <motion.div
                key={`${msg.timestamp}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={msg.role === "assistant" ? "flex items-start gap-4" : "flex items-start justify-end gap-4"}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                    🤖
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-2xl px-6 py-4 shadow-md ${
                    msg.role === "assistant"
                      ? "bg-white text-gray-800 border border-gray-200"
                      : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className={`mb-2 text-sm leading-relaxed ${msg.role === "assistant" ? "text-gray-700" : "text-white"}`}>
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className={`list-inside list-disc space-y-1 text-sm ${msg.role === "assistant" ? "text-gray-700" : "text-white"}`}>
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li className={`text-sm ${msg.role === "assistant" ? "text-gray-700" : "text-white"}`}>{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className={`font-bold ${msg.role === "assistant" ? "text-gray-900" : "text-white"}`}>
                          {children}
                        </strong>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {msg.role === "user" && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            ))}

            <AnimatePresence>
              {showTypingIndicator && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-6">
          <div className="max-w-4xl mx-auto">
            {(isTyping || (isLoading && showTypingIndicator)) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex justify-center"
              >
                <button
                  onClick={handleStop}
                  className="flex items-center gap-2 rounded-full border-2 border-red-300 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100 hover:border-red-400 shadow-md hover:shadow-lg"
                >
                  <Square size={16} fill="currentColor" />
                  <span>Arrêter la génération</span>
                </button>
              </motion.div>
            )}

            <div className="flex gap-4">
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  placeholder={isTyping || isLoading ? "Veuillez patienter..." : "Posez votre question à Aicha..."}
                  className="w-full rounded-2xl border-2 border-gray-200 bg-white px-6 py-4 pr-16 text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 resize-none shadow-sm"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                  disabled={isLoading || isTyping}
                  maxLength={500}
                  rows={1}
                  style={{ minHeight: '56px', maxHeight: '200px' }}
                />
                {input.length > 0 && !isTyping && !isLoading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                    {input.length}/500
                  </div>
                )}
              </div>
              
              <motion.button
                onClick={handleSubmit}
                className="h-14 w-14 flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!input.trim() || isLoading || isTyping}
                whileHover={{ scale: input.trim() && !isLoading && !isTyping ? 1.05 : 1 }}
                whileTap={{ scale: input.trim() && !isLoading && !isTyping ? 0.95 : 1 }}
              >
                {isLoading || isTyping ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <Send size={24} />
                )}
              </motion.button>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>
                {isTyping && "L'assistante écrit..."}
                {isLoading && !isTyping && processingTime > 0 && `Traitement de votre demande... ${processingTime}s`}
                {!isLoading && !isTyping && "Appuyez sur Entrée pour envoyer"}
              </span>
              <span className="font-medium">
                {messages.length - 1} message{messages.length > 2 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}