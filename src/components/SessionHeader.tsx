import React, { useState } from 'react';
import { Copy, Check, Link2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSelector from './LanguageSelector';
import { useToast } from '@/hooks/use-toast';

interface SessionHeaderProps {
  sessionId: string;
  language: string;
  onLanguageChange: (language: string) => void;
  onRun: () => void;
  isRunning: boolean;
}

const SessionHeader: React.FC<SessionHeaderProps> = ({
  sessionId,
  language,
  onLanguageChange,
  onRun,
  isRunning,
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/session/${sessionId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Share this link with your interview candidate.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the URL manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">&lt;/&gt;</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground">CodeInterview</h1>
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>Live Session</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSelector value={language} onChange={onLanguageChange} />
        
        <Button
          variant="glow"
          onClick={onRun}
          disabled={isRunning || (language !== 'javascript' && language !== 'python')}
          className="min-w-24"
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </Button>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm">
            <Link2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground max-w-32 truncate font-mono text-xs">
              {sessionId.slice(0, 8)}...
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            className="shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default SessionHeader;
