import { Message } from '@/types/medicine';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';
import MedicineCard from './MedicineCard';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 animate-fade-in',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-accent text-accent-foreground'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex flex-col max-w-[85%] sm:max-w-[75%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Text Bubble */}
        {message.content && (
          <div
            className={cn(
              'px-4 py-2.5 rounded-2xl shadow-chat',
              isUser
                ? 'bg-chat-user text-chat-user-foreground rounded-br-md'
                : 'bg-chat-assistant text-chat-assistant-foreground rounded-bl-md border border-border/50'
            )}
          >
            {message.isTyping ? (
              <div className="flex items-center gap-1 py-1">
                <span className="w-2 h-2 rounded-full bg-current animate-pulse-gentle" />
                <span className="w-2 h-2 rounded-full bg-current animate-pulse-gentle" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 rounded-full bg-current animate-pulse-gentle" style={{ animationDelay: '0.4s' }} />
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
        )}

        {/* Medicine Card */}
        {message.medicineData && (
          <div className="mt-3">
            <MedicineCard medicine={message.medicineData} />
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1.5 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
