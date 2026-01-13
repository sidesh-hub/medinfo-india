import { Pill, Shield, Info } from 'lucide-react';

const ChatHeader = () => {
  return (
    <header className="gradient-header px-4 py-4 sm:px-6 sm:py-5">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
            <Pill className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-lg sm:text-xl font-bold text-primary-foreground">
              MedInfo India
            </h1>
            <p className="text-xs sm:text-sm text-primary-foreground/80">
              Your trusted medicine information assistant
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-primary-foreground/70">
            <Shield className="w-4 h-4" />
            <span>Informational Only</span>
          </div>
        </div>
        
        <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-primary-foreground/10 backdrop-blur-sm">
          <Info className="w-4 h-4 text-primary-foreground/80 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-primary-foreground/90 leading-relaxed">
            This assistant provides medicine information only. Always consult a licensed medical professional for prescriptions and medical advice.
          </p>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
