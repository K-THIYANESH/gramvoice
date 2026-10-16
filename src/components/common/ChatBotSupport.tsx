/**
 * GramVoice TN - Production-Grade AI Civic Navigator & Chatbot (Kanmani / கண்மணி)
 * Bottom-Right Non-Intrusive Floating Widget with Deep-Link Navigation & Speech
 * Mobile optimized: No text truncation, flexible container growth, wrap-anywhere
 */
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Compass, 
  ChevronRight, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Building2,
  Minimize2,
  Maximize2,
  Bot
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface ChatBotSupportProps {
  onNavigate: (tab: 'citizen' | 'government' | 'public', view?: string, data?: any) => void;
}

interface QuickActionItem {
  id: string;
  labelEn: string;
  labelTa: string;
  tab: 'citizen' | 'government' | 'public';
  view?: string;
  directJump: boolean;
  query: string;
  icon?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  textEn: string;
  textTa?: string;
  timestamp: string;
  quickChips?: Array<{
    labelEn: string;
    labelTa: string;
    tab: 'citizen' | 'government' | 'public';
    view?: string;
    direct: boolean;
    query?: string;
  }>;
  action?: {
    type: 'NAVIGATE';
    tab: 'citizen' | 'government' | 'public';
    view?: string;
    label: string;
    labelTamil: string;
  };
}

export const ChatBotSupport: React.FC<ChatBotSupportProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1-Tap Direct Action Chips & Prompt Helpers
  const quickActions: QuickActionItem[] = [
    { 
      id: 'road_issue',
      labelEn: '🛣️ Report a Road Issue', 
      labelTa: '🛣️ சாலை பிரச்சனை புகார்', 
      tab: 'citizen', 
      view: 'report_problem', 
      directJump: true,
      query: 'I want to report a damaged road or pothole issue' 
    },
    { 
      id: 'project_status',
      labelEn: '📊 Check Project Status', 
      labelTa: '📊 திட்டங்களின் நிலை அறிய', 
      tab: 'citizen', 
      view: 'projects', 
      directJump: true,
      query: 'Check current status and budget of village projects' 
    },
    { 
      id: 'water_leak',
      labelEn: '🚨 Report Water Leak (SLA)', 
      labelTa: '🚨 குடிநீர் கசிவு புகார் (SLA)', 
      tab: 'citizen', 
      view: 'report_problem', 
      directJump: true,
      query: 'Report water supply pipeline leakage' 
    },
    { 
      id: 'gram_sabha',
      labelEn: '👥 Join Gram Sabha', 
      labelTa: '👥 கிராம சபை நிகழ்ச்சி நிரல்', 
      tab: 'citizen', 
      view: 'gramsabha', 
      directJump: true,
      query: 'Tell me about upcoming Gram Sabha agenda and voting' 
    },
    { 
      id: 'propose_idea',
      labelEn: '💡 Propose New Idea', 
      labelTa: '💡 புதிய யோசனை பகிர', 
      tab: 'citizen', 
      view: 'suggest_project', 
      directJump: true,
      query: 'I want to suggest a new project for our village' 
    },
    { 
      id: 'ledger_audit',
      labelEn: '🔒 Audit Decision Ledger', 
      labelTa: '🔒 லெட்ஜர் தணிக்கை', 
      tab: 'government', 
      view: 'gov_ledger', 
      directJump: true,
      query: 'How to verify the cryptographic SHA-256 ledger?' 
    },
    { 
      id: 'construction_watch',
      labelEn: '📸 Construction Watch', 
      labelTa: '📸 கட்டுமான தர ஆய்வு', 
      tab: 'citizen', 
      view: 'construction_watch', 
      directJump: true,
      query: 'How can I upload site photos for quality inspection?' 
    }
  ];

  const initialGreeting: Message = {
    id: 'msg-init',
    sender: 'bot',
    textEn: `Vanakkam! I am Kanmani (கண்மணி), your GramVoice TN AI Assistant for ${currentUser.panchayatName}.\n\nTap any quick action below to jump directly, or ask me any question about village governance, budgets, or grievances:`,
    textTa: `வணக்கம்! நான் உங்கள் கண்மணி (Kanmani), ${currentUser.panchayatName} ஊராட்சிக்கான AI வழிகாட்டி.\n\nகீழே உள்ள விரைவு பொத்தான்களை 1-தட்டலில் அழுத்தி நேரடியாக செல்லலாம் அல்லது உங்கள் சந்தேகங்களை கேட்கலாம்:`,
    quickChips: [
      { labelEn: '🛣️ Report a Road Issue', labelTa: '🛣️ சாலை பிரச்சனை புகார்', tab: 'citizen', view: 'report_problem', direct: true },
      { labelEn: '📊 Check Project Status', labelTa: '📊 திட்டங்களின் நிலை அறிய', tab: 'citizen', view: 'projects', direct: true },
      { labelEn: '👥 Gram Sabha Agenda', labelTa: '👥 கிராம சபை நிரல்', tab: 'citizen', view: 'gramsabha', direct: true },
      { labelEn: '💡 Propose Village Scheme', labelTa: '💡 புதிய யோசனை', tab: 'citizen', view: 'suggest_project', direct: true },
    ],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<Message[]>([initialGreeting]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText.trim();
    if (!query) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      textEn: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.textEn
      }));

      const res = await api.sendChatMessage(query, historyPayload, {
        role: currentUser.role,
        panchayatId: currentUser.panchayatId,
        wardNumber: currentUser.wardNumber,
        language
      });

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        textEn: res.reply || 'Here is what you need:',
        textTa: res.replyTamil,
        action: res.suggestedAction,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (e: any) {
      const fallbackMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        textEn: 'I am Kanmani, your civic guide. Use the quick links below to jump directly to any section.',
        textTa: 'நான் உங்கள் கண்மணி. எங்கள் தளத்தின் எந்த பகுதிக்கும் செல்ல கீழே உள்ள இணைப்புகளைப் பயன்படுத்தவும்.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice recognition support
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setInputText(language === 'ta' ? 'குடிநீர் குழாய் உடைந்துள்ளது புகார் செய்ய வேண்டும்' : 'Need to report a water pipe problem');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsRecording(false);
        handleSendMessage(transcript);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  // Text to speech playback
  const handleSpeak = (msg: Message) => {
    if ('speechSynthesis' in window) {
      if (speakingMsgId === msg.id) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
      } else {
        window.speechSynthesis.cancel();
        const text = language === 'ta' && msg.textTa ? msg.textTa : msg.textEn;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
        utterance.rate = 0.95;
        utterance.onend = () => setSpeakingMsgId(null);
        utterance.onerror = () => setSpeakingMsgId(null);
        window.speechSynthesis.speak(utterance);
        setSpeakingMsgId(msg.id);
      }
    }
  };

  const handleActionClick = (action: Message['action']) => {
    if (!action) return;
    onNavigate(action.tab, action.view);
  };

  return (
    <div className="fixed bottom-18 md:bottom-5 right-3 sm:right-5 z-50 pointer-events-none select-none">
      {/* Floating Trigger Button (Clean icon only - No outside text badge) */}
      {!isOpen && (
        <div className="pointer-events-auto flex items-center">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Kanmani AI Civic Assistant"
            title={language === 'ta' ? 'கண்மணி AI வழிகாட்டி' : 'Kanmani AI Assistant'}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-linear-to-tr from-emerald-800 via-teal-700 to-emerald-600 hover:from-emerald-700 hover:to-teal-600 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-emerald-300/50 relative group glow-emerald"
          >
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
            <div className="relative">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
              <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </button>
        </div>
      )}

      {/* Expanded Helpbox (Kanmani AI) */}
      {isOpen && (
        <div className="pointer-events-auto w-[94vw] sm:w-[420px] h-[82vh] max-h-[580px] min-h-[420px] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Helpbox Header with Kanmani AI Icon & Branding */}
          <div className="bg-linear-to-r from-emerald-900 via-slate-900 to-teal-950 text-white p-3.5 sm:p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white border border-emerald-300/50 shadow-sm shrink-0 relative">
                <Bot className="w-5 h-5 text-white" />
                <Sparkles className="w-3 h-3 text-amber-300 absolute -top-0.5 -right-0.5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5 truncate">
                  <span className="truncate">{language === 'ta' ? 'கண்மணி AI' : 'Kanmani AI'}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-600/80 text-emerald-100 rounded-full font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    {language === 'ta' ? 'உதவியாளர்' : 'AI Helper'}
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-300 truncate">
                  {currentUser.panchayatName} • {currentUser.role.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Kanmani AI Helpbox"
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Action 1-Tap Direct Jump Bar */}
          <div className="bg-slate-50 p-2 border-b border-slate-200">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3 h-3 text-emerald-700" />
                {language === 'ta' ? 'விரைவு 1-தட்டல் வழிகாட்டி' : '1-Tap Quick Action Chips'}
              </span>
              <span className="text-[9px] text-emerald-700 font-semibold">
                {language === 'ta' ? 'உடனடி அணுகல்' : 'Instant Jump'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {quickActions.map((qa) => (
                <button
                  key={qa.id}
                  onClick={() => {
                    if (qa.directJump) {
                      onNavigate(qa.tab, qa.view);
                      setIsOpen(false);
                    } else {
                      handleSendMessage(qa.query);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 hover:text-emerald-900 text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all shadow-2xs shrink-0 flex items-center gap-1 active:scale-95"
                >
                  <span>{language === 'ta' ? qa.labelTa : qa.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-bold text-emerald-800">
                    <div className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                      <Bot className="w-2.5 h-2.5" />
                    </div>
                    <span>{language === 'ta' ? 'கண்மணி' : 'Kanmani'}</span>
                  </div>
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-[13px] leading-relaxed break-words overflow-hidden ${
                    msg.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-br-xs shadow-2xs font-medium'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line break-words">
                    {language === 'ta' && msg.textTa ? msg.textTa : msg.textEn}
                  </p>

                  {/* Interactive In-Message Quick Action Chips (e.g. for Initial Greeting or Suggestions) */}
                  {msg.quickChips && msg.quickChips.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {msg.quickChips.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (chip.direct && chip.tab) {
                              onNavigate(chip.tab, chip.view);
                              setIsOpen(false);
                            } else if (chip.query) {
                              handleSendMessage(chip.query);
                            }
                          }}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs hover:scale-[1.02] active:scale-95 text-left"
                        >
                          <Compass className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{language === 'ta' ? chip.labelTa : chip.labelEn}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Deep-Link Navigation Action Pill */}
                  {msg.action && (
                    <button
                      onClick={() => handleActionClick(msg.action)}
                      className="mt-2.5 w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold rounded-xl flex items-center justify-between gap-1.5 cursor-pointer transition-colors shadow-2xs text-left"
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="truncate">{language === 'ta' ? msg.action.labelTamil : msg.action.label}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-emerald-700 shrink-0 ml-1" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'bot' && (
                    <button
                      onClick={() => handleSpeak(msg)}
                      className="hover:text-emerald-700 cursor-pointer flex items-center gap-1"
                      title="Audio Speech"
                    >
                      {speakingMsgId === msg.id ? (
                        <VolumeX className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className="text-[9px]">Audio</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl max-w-[80%] text-xs text-slate-600 shadow-2xs">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                </div>
                <span>{language === 'ta' ? 'கண்மணி சிந்திக்கிறது...' : 'Kanmani is analyzing your request...'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Voice Controls */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleVoiceInput}
              aria-label="Voice Input"
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                isRecording 
                  ? 'bg-red-600 text-white border-red-700 animate-pulse' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-700" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === 'ta' ? 'கண்மணியிடம் கேட்கவும்...' : 'Ask Kanmani anything about village works...'}
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none min-w-0"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              aria-label="Send Message"
              className="p-2.5 sm:p-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl cursor-pointer transition-colors shrink-0 shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
