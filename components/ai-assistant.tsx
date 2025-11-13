"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User,
  Sparkles,
  ImageIcon,
  FileDown,
  ScanText,
  Zap,
  Link2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolSuggestion?: {
    id: string;
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  };
}

const toolKeywords: Record<string, { keywords: string[]; tool: { id: string; name: string; href: string; icon: React.ComponentType<{ className?: string }> } }> = {
  "image-converter": {
    keywords: ["صورة", "صور", "تحويل", "تحويل صورة", "convert image", "image", "format", "webp", "png", "jpg", "jpeg"],
    tool: {
      id: "image-converter",
      name: "محول الصور",
      href: "/image-converter",
      icon: ImageIcon
    }
  },
  "file-compressor": {
    keywords: ["ضغط", "ضغط ملف", "ضغط صور", "compress", "zip", "archive", "ضغط", "صغير", "حجم"],
    tool: {
      id: "file-compressor",
      name: "ضاغط الملفات",
      href: "/file-compressor",
      icon: FileDown
    }
  },
  "ocr": {
    keywords: ["نص", "استخراج نص", "ocr", "text", "extract", "استخراج", "قراءة", "scan"],
    tool: {
      id: "ocr",
      name: "استخراج النص",
      href: "/ocr",
      icon: ScanText
    }
  },
  "auto-detect": {
    keywords: ["اكتشف", "اكتشاف", "detect", "auto", "تلقائي", "ما هي", "ماذا"],
    tool: {
      id: "auto-detect",
      name: "اكتشاف تلقائي",
      href: "/auto-detect",
      icon: Zap
    }
  },
  "smart-chain": {
    keywords: ["سلسلة", "متسلسل", "chain", "عدة", "مع بعض", "معاً"],
    tool: {
      id: "smart-chain",
      name: "أدوات متسلسلة",
      href: "/smart-chain",
      icon: Link2
    }
  }
};

function detectToolFromMessage(message: string): { id: string; name: string; href: string; icon: React.ComponentType<{ className?: string }> } | null {
  const lowerMessage = message.toLowerCase();
  
  for (const [toolId, { keywords, tool }] of Object.entries(toolKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
      return tool;
    }
  }
  
  return null;
}

function generateResponse(userMessage: string, t: ReturnType<typeof useTranslations>): { content: string; toolSuggestion?: { id: string; name: string; href: string; icon: React.ComponentType<{ className?: string }> } } {
  const lowerMessage = userMessage.toLowerCase();
  const detectedTool = detectToolFromMessage(userMessage);

  if (detectedTool) {
    return {
      content: t("aiAssistant.toolDetected", { tool: detectedTool.name }),
      toolSuggestion: detectedTool
    };
  }

  // Default responses based on keywords
  if (lowerMessage.includes("مرحبا") || lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return { content: t("aiAssistant.greeting") };
  }

  if (lowerMessage.includes("مساعدة") || lowerMessage.includes("help") || lowerMessage.includes("مساعدة")) {
    return { content: t("aiAssistant.help") };
  }

  if (lowerMessage.includes("شكرا") || lowerMessage.includes("thanks") || lowerMessage.includes("thank")) {
    return { content: t("aiAssistant.thanks") };
  }

  // Default response
  return { content: t("aiAssistant.defaultResponse") };
}

export function AIAssistant() {
  const t = useTranslations();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: t("aiAssistant.welcome")
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 800));

    const response = generateResponse(userMessage.content, t);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response.content,
      toolSuggestion: response.toolSuggestion
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToolClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rtl:left-6 rtl:right-auto z-50 h-14 w-14 rounded-full bg-gradient-to-r from-primary to-purple-600 shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110 group"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        <span className="absolute -top-2 -right-2 rtl:right-auto rtl:-left-2 h-5 w-5 rounded-full bg-green-500 animate-pulse" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 rtl:left-6 rtl:right-auto z-50 w-[90vw] sm:w-96 h-[600px] shadow-2xl border-primary/20 bg-card/95 backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-purple-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">{t("aiAssistant.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("aiAssistant.subtitle")}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const Icon = message.role === "assistant" ? Bot : User;
          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2",
                message.role === "user"
                  ? "bg-gradient-to-r from-primary to-purple-600 text-white"
                  : "bg-muted text-foreground"
              )}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.toolSuggestion && (
                  <Button
                    onClick={() => handleToolClick(message.toolSuggestion!.href)}
                    className="mt-2 w-full bg-background/50 hover:bg-background text-foreground border border-border"
                    size="sm"
                  >
                    <message.toolSuggestion.icon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t("aiAssistant.useTool")}: {message.toolSuggestion.name}
                  </Button>
                )}
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          );
        })}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="p-4 border-t border-border/50 bg-background/50">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("aiAssistant.placeholder")}
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

