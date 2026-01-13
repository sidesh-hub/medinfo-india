import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ImagePlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  onImageUpload?: (file: File) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const ChatInput = ({ 
  onSend, 
  onImageUpload, 
  isLoading = false,
  placeholder = "Ask about any medicine..." 
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
    e.target.value = '';
  };

  return (
    <div className="p-3 sm:p-4 border-t border-border bg-card">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-2 sm:gap-3 p-2 sm:p-3 rounded-2xl bg-muted/50 border border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          {/* Image Upload Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleImageClick}
            disabled={isLoading}
            className="flex-shrink-0 h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="sr-only">Upload image</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Text Input */}
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className={cn(
              "flex-1 min-h-[40px] max-h-32 resize-none border-0 bg-transparent",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-muted-foreground/60 text-sm"
            )}
          />

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            size="icon"
            className={cn(
              "flex-shrink-0 h-10 w-10 rounded-xl transition-all",
              "gradient-primary hover:opacity-90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-2">
          Type a medicine name like "Dolo 650", "Azithromycin", or "Pan D"
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
