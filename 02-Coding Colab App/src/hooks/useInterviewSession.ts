import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InterviewSession {
  id: string;
  code: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export const useInterviewSession = (sessionId: string | null) => {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const isLocalUpdate = useRef(false);

  // Fetch session data
  const fetchSession = useCallback(async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSession(data);
      } else {
        setError('Session not found');
      }
    } catch (err) {
      console.error('Error fetching session:', err);
      setError('Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Create a new session
  const createSession = async (initialCode: string = '// Start coding here\n', language: string = 'javascript') => {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .insert({ code: initialCode, language })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating session:', err);
      toast({
        title: 'Error',
        description: 'Failed to create session',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update session code
  const updateCode = useCallback(async (newCode: string) => {
    if (!sessionId || !session) return;

    isLocalUpdate.current = true;
    
    // Optimistic update
    setSession(prev => prev ? { ...prev, code: newCode } : null);

    try {
      const { error } = await supabase
        .from('interview_sessions')
        .update({ code: newCode })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating code:', err);
    } finally {
      setTimeout(() => {
        isLocalUpdate.current = false;
      }, 100);
    }
  }, [sessionId, session]);

  // Update session language
  const updateLanguage = useCallback(async (newLanguage: string) => {
    if (!sessionId || !session) return;

    isLocalUpdate.current = true;
    setSession(prev => prev ? { ...prev, language: newLanguage } : null);

    try {
      const { error } = await supabase
        .from('interview_sessions')
        .update({ language: newLanguage })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating language:', err);
    } finally {
      setTimeout(() => {
        isLocalUpdate.current = false;
      }, 100);
    }
  }, [sessionId, session]);

  // Set up real-time subscription
  useEffect(() => {
    if (!sessionId) return;

    fetchSession();

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'interview_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          // Only update if it's not our own change
          if (!isLocalUpdate.current) {
            console.log('Received real-time update:', payload);
            setSession(payload.new as InterviewSession);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, fetchSession]);

  return {
    session,
    loading,
    error,
    createSession,
    updateCode,
    updateLanguage,
  };
};
