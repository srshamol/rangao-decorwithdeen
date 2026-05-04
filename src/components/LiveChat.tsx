import { useState, useEffect } from "react";
import { MessageCircle, X, Send, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem("chat_messages");
      if (saved) return JSON.parse(saved);
    }
    return [{ role: 'bot', text: 'আসসালামু আলাইকুম! রাঙ্গাও-তে আপনাকে স্বাগতম। আমি কীভাবে আপনাকে সাহায্য করতে পারি?' }];
  });
  const [input, setInput] = useState("");

  useEffect(() => {
    sessionStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user' as const, text: input };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");

    // Simple bot response simulation
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot' as const, text: 'ধন্যবাদ আপনার বার্তার জন্য। আমাদের একজন প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন। অথবা সরাসরি কথা বলতে নিচের হোয়াটসঅ্যাপ বাটনে ক্লিক করুন।' }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[320px] md:w-[380px] bg-card border border-border rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-primary p-6 text-primary-foreground flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">রাঙ্গাও হেল্প ডেক্স</h3>
                  <p className="text-[10px] opacity-80 uppercase tracking-widest font-black">Online Now</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-xl text-xs leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-muted text-foreground rounded-tl-none border border-border'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="আপনার প্রশ্ন লিখুন..."
                className="rounded-xl border-none bg-muted h-10 text-xs"
              />
              <Button type="submit" size="icon" className="rounded-xl h-10 w-10 shrink-0">
                <Send size={16} />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-xl animate-pulse border-2 border-white" />
        )}
      </button>
    </div>
  );
}
