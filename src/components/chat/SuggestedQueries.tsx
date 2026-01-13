import { Button } from '@/components/ui/button';
import { Pill, Search, HelpCircle } from 'lucide-react';

interface SuggestedQueriesProps {
  onSelect: (query: string) => void;
}

const suggestions = [
  {
    icon: Pill,
    label: 'Dolo 650',
    query: 'Tell me about Dolo 650',
  },
  {
    icon: Search,
    label: 'Pan D',
    query: 'What is Pan D used for?',
  },
  {
    icon: HelpCircle,
    label: 'Fever medicine',
    query: 'What medicines are used for fever?',
  },
];

const SuggestedQueries = ({ onSelect }: SuggestedQueriesProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 px-4 animate-fade-in">
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion.label}
          variant="outline"
          size="sm"
          onClick={() => onSelect(suggestion.query)}
          className="rounded-full border-primary/20 bg-accent/50 hover:bg-accent hover:border-primary/40 text-foreground transition-all"
        >
          <suggestion.icon className="w-3.5 h-3.5 mr-1.5 text-primary" />
          {suggestion.label}
        </Button>
      ))}
    </div>
  );
};

export default SuggestedQueries;
