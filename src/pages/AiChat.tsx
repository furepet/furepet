import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  PawPrint,
  RotateCcw,
  Copy,
  Check,
  BookmarkPlus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { usePets } from "@/hooks/usePets";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useAddMedicalRecord } from "@/hooks/useMedicalRecords";
import { PremiumLockSheet } from "@/components/home/PremiumLockSheet";
import { differenceInYears, differenceInMonths, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pet-chat`;

type Msg = { role: "user" | "assistant"; content: string };

const formatAge = (dob: string | null): string | null => {
  if (!dob) return null;
  const bd = parseISO(dob);
  const y = differenceInYears(new Date(), bd);
  if (y >= 1) return `${y} year${y !== 1 ? "s" : ""} old`;
  const m = differenceInMonths(new Date(), bd);
  return m >= 1 ? `${m} month${m !== 1 ? "s" : ""} old` : "< 1 month old";
};

const AiChat = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();
  const { data: pets = [] } = usePets();
  const activePet = pets[0];
  const isPremium = activePet?.is_premium ?? false;
  const [lockOpen, setLockOpen] = useState(false);

  const {
    data: savedMessages = [],
    saveMessage,
    clearChat,
  } = useChatMessages(activePet?.id);

  const addRecord = useAddMedicalRecord();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load saved messages on mount
  useEffect(() => {
    if (savedMessages.length > 0 && messages.length === 0) {
      setMessages(savedMessages.map((m) => ({ role: m.role, content: m.content })));
    }
  }, [savedMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Build pet context
  const petContext = useMemo(() => {
    if (!activePet) return null;
    return {
      name: activePet.pet_name,
      species: activePet.species,
      breed: activePet.breed,
      age: formatAge(activePet.date_of_birth),
    };
  }, [activePet]);

  const suggestedQuestions = useMemo(() => {
    const breed = activePet?.breed || "my pet";
    const species = activePet?.species?.toLowerCase() || "pet";
    return [
      `Can my ${species} eat grapes?`,
      `How often should I bathe my ${breed}?`,
      `What vaccines does my ${species} need?`,
      `Signs of anxiety in ${species}s`,
      `How much exercise does a ${breed} need?`,
    ];
  }, [activePet]);

  const streamChat = useCallback(
    async (allMessages: Msg[]) => {
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Not authenticated");

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: allMessages, petContext }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              full += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: full } : m
                  );
                }
                return [...prev, { role: "assistant", content: full }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
      return full;
    },
    [petContext, session]
  );

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (!isPremium) {
      setLockOpen(true);
      return;
    }

    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Save user message
    if (activePet) {
      saveMessage.mutate({ pet_id: activePet.id, role: "user", content: text.trim() });
    }

    try {
      const assistantContent = await streamChat(newMessages);
      // Save assistant message
      if (activePet && assistantContent) {
        saveMessage.mutate({
          pet_id: activePet.id,
          role: "assistant",
          content: assistantContent,
        });
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to get response",
        variant: "destructive",
      });
      // Remove the user message if failed
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToMedical = (content: string) => {
    if (!activePet || !session) return;
    addRecord.mutate(
      {
        pet_id: activePet.id,
        category: "observation",
        data: { title: "AI Chat Note", notes: content, date_first_noticed: new Date().toISOString().split("T")[0], status: "New" },
      },
      {
        onSuccess: () =>
          toast({ title: "Saved", description: "Added to Medical Observations" }),
      }
    );
  };

  const handleNewChat = () => {
    setMessages([]);
    clearChat.mutate();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm font-medium text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <PawPrint className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Ask FurePET AI</p>
            <p className="text-xs text-muted-foreground">Your pet care assistant</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleNewChat} className="gap-1 text-xs">
          <RotateCcw className="h-3.5 w-3.5" />
          New Chat
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-4 pt-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <PawPrint className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-foreground">
                Hi! I'm FurePET AI 🐾
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Ask me anything about{" "}
                {activePet ? `${activePet.pet_name}'s` : "your pet's"} care
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 px-2 mt-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1 mt-2 -mb-0.5">
                  <button
                    onClick={() => handleCopy(msg.content, i)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedId === i ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copiedId === i ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={() => handleSaveToMedical(msg.content)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-2"
                  >
                    <BookmarkPlus className="h-3 w-3" />
                    Save to Notes
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Thinking…</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 flex items-end gap-2 pt-2 border-t border-border">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder={`Ask about ${activePet?.pet_name ?? "your pet"}…`}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button
          size="icon"
          onClick={() => send(input)}
          disabled={!input.trim() || isLoading}
          className="h-10 w-10 rounded-xl shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <PremiumLockSheet open={lockOpen} onOpenChange={setLockOpen} />
    </div>
  );
};

export default AiChat;
