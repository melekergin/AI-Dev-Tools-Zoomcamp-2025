import React from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OutputLine {
  type: 'log' | 'error' | 'warn' | 'info';
  content: string;
  timestamp: Date;
}

interface OutputConsoleProps {
  output: OutputLine[];
  onClear: () => void;
}

const OutputConsole: React.FC<OutputConsoleProps> = ({ output, onClear }) => {
  const getLineStyles = (type: OutputLine['type']) => {
    switch (type) {
      case 'error':
        return 'text-destructive';
      case 'warn':
        return 'text-warning';
      case 'info':
        return 'text-primary';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Terminal className="w-4 h-4" />
          <span className="text-sm font-medium">Output Console</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
      <div className="flex-1 p-4 overflow-auto font-mono text-sm">
        {output.length === 0 ? (
          <p className="text-muted-foreground italic">
            Run your code to see output here...
          </p>
        ) : (
          <div className="space-y-1">
            {output.map((line, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 ${getLineStyles(line.type)} animate-fade-in`}
              >
                <span className="text-muted-foreground text-xs opacity-50 select-none">
                  {line.timestamp.toLocaleTimeString()}
                </span>
                <pre className="whitespace-pre-wrap break-all">{line.content}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;
