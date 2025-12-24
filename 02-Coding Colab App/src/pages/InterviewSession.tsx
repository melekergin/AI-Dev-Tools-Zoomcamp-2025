import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import OutputConsole from '@/components/OutputConsole';
import SessionHeader from '@/components/SessionHeader';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { executeJavaScript, executePython } from '@/utils/codeExecutor';
import { useToast } from '@/hooks/use-toast';

interface OutputLine {
  type: 'log' | 'error' | 'warn' | 'info';
  content: string;
  timestamp: Date;
}

const InterviewSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, loading, error, updateCode, updateLanguage } = useInterviewSession(sessionId || null);
  
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Session not found',
        description: 'This interview session does not exist.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [error, navigate, toast]);

  const handleCodeChange = useCallback((newCode: string) => {
    updateCode(newCode);
  }, [updateCode]);

  const handleLanguageChange = useCallback((newLanguage: string) => {
    updateLanguage(newLanguage);
  }, [updateLanguage]);

  const handleRunCode = useCallback(async () => {
    if (!session) {
      return;
    }

    if (session.language !== 'javascript' && session.language !== 'python') {
      toast({
        title: 'Execution not available',
        description: 'Only JavaScript and Python can be executed in the browser.',
        variant: 'destructive',
      });
      return;
    }

    setIsRunning(true);
    setOutput([]);

    try {
      const result =
        session.language === 'python'
          ? await executePython(session.code)
          : await executeJavaScript(session.code);
      setOutput(result);
    } catch (err) {
      setOutput([{
        type: 'error',
        content: 'Failed to execute code',
        timestamp: new Date(),
      }]);
    } finally {
      setIsRunning(false);
    }
  }, [session, toast]);

  const handleClearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <SessionHeader
        sessionId={session.id}
        language={session.language}
        onLanguageChange={handleLanguageChange}
        onRun={handleRunCode}
        isRunning={isRunning}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor Panel */}
        <div className="flex-1 p-4">
          <CodeEditor
            code={session.code}
            language={session.language}
            onChange={handleCodeChange}
          />
        </div>

        {/* Output Panel */}
        <div className="w-96 border-l border-border p-4">
          <OutputConsole output={output} onClear={handleClearOutput} />
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
