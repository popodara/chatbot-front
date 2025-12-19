import React from 'react';
import { Message } from '../types';
import { User, Bot, Database, ArrowRight, Lightbulb, Table2, Columns, Copy, Download, Check, BotMessageSquare, Play, Pause } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown'
import { API_ROUTE } from '../../config';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [audioElement, setAudioElement] = React.useState<HTMLAudioElement | null>(null);

  console.log('Rendering ChatMessage:', message.id, message.role, message.content);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadData = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const cell = row[header]?.toString() || '';
        return cell.includes(',') ? `"${cell}"` : cell;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  React.useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, []);

  const handleTextToSpeech = async () => {
    if (!message?.result?.info?.natural_response) return;
    
    setIsLoading(true);
    try {
      const currentLanguage = localStorage.getItem('i18nextLng') || 'en';

      const response = await fetch(`${API_ROUTE}api/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message?.result?.info?.natural_response,
          language:currentLanguage
        }),
      });

      if (!response.ok) {
        throw new Error('Speech synthesis failed');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      
      audio.onended = () => {
        setAudioUrl(null);
        setAudioElement(null);
        URL.revokeObjectURL(url);
      };

      setAudioUrl(url);
      setAudioElement(audio);
      audio.play().catch(error => {
        console.error('Audio playback failed:', error);
      });

    } catch (error) {
      console.error('Text-to-speech error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioToggle = () => {
    if (audioElement && audioUrl) {
      audioElement.pause();
      audioElement.src = '';
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setAudioElement(null);
    } else {
      handleTextToSpeech();
    }
  };

  return (
    <div className={`flex gap-4 p-4 transition-all duration-300 
      ${message.role === 'assistant' 
        ? 'bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl' 
        : 'hover:bg-white/5 backdrop-blur-sm'
      } border-b border-white/5`}>
      
      <div className="flex-shrink-0">
        {message.role === 'user' ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 
            backdrop-blur-xl border border-blue-500/20 flex items-center justify-center
            shadow-lg shadow-blue-500/10">
            <User className="w-5 h-5 text-blue-400" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 
            backdrop-blur-xl border border-emerald-500/20 flex items-center justify-center
            shadow-lg shadow-purple-500/10">
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3">
        {/* Message Header */}
        <div className="flex justify-between items-start">
          <div className="text-xs text-gray-400">
            <span className="font-medium capitalize text-gray-300">
              {t(`chat.message.roles.${message.role}`)}
            </span>
            <span className="mx-2">•</span>
            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          </div>

          {message.role === "assistant" && message?.result?.info?.natural_response && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAudioToggle}
                disabled={isLoading}
                className="group px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                  backdrop-blur-xl border border-blue-500/20 hover:border-blue-500/40
                  text-blue-400 hover:text-blue-300 transition-all duration-300
                  hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs"
              >
                {audioUrl ? (
                  <>
                    <Pause className="w-3 h-3" />
                    {t('chat.message.audio.stop')}
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    {isLoading ? t('chat.message.audio.loading') : t('chat.message.audio.listen')}
                  </>
                )}
              </button>
              
              {audioUrl && (
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-gradient-to-t from-blue-400 to-purple-400 rounded-full 
                        animate-[pulse_1s_ease-in-out_infinite]"
                      style={{
                        height: `${8 + (i % 3) * 4}px`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Content */}
          <ReactMarkdown
                              components={{
                                p: ({ children }) => (
                                  <p className="mb-2 text-sm leading-relaxed text-white">
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-inside list-disc space-y-1 text-sm text-white">
                                    {children}
                                  </ul>
                                ),
                                li: ({ children }) => (
                                  <li className="text-sm text-white">{children}</li>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-bold text-white-500">
                                    {children}
                                  </strong>
                                ),
                              }}
                            >
                       {message.content || message?.result?.bot }
                            </ReactMarkdown>
   

        {/* {message?.result && (
          <div className="space-y-4">
            {message?.result?.info?.error ? (
              <div className="p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 
                backdrop-blur-xl border border-red-500/20 text-red-400">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                  {t('chat.message.query.error', { message: message.result.info.error })}
                </div>
              </div>
            ) : (
              <>
          
                {message?.result?.info?.reasoning && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/5 to-blue-500/5 
                    backdrop-blur-xl border border-green-500/20">
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl 
                        p-3 rounded-xl border border-blue-500/20">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20">
                            <BotMessageSquare className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-green-400 font-medium mb-2 text-sm">AI Analysis</h4>
                            <ReactMarkdown components={{
                              p: ({children}) => <p className="text-sm text-blue-200 mb-2 leading-relaxed">{children}</p>,
                              ul: ({children}) => <ul className="text-blue-200 list-disc list-inside space-y-1 text-sm">{children}</ul>,
                              li: ({children}) => <li className="text-blue-200 text-sm">{children}</li>,
                              strong: ({children}) => <strong className="text-blue-300 font-medium">{children}</strong>
                            }}>
                              {message?.result?.info?.natural_response || ''}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              
              </>
            )}
          </div>
        )} */}
      </div>
    </div>
  );
}