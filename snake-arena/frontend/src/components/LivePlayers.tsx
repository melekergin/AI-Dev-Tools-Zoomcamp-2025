import React, { useEffect, useState } from 'react';
import { LivePlayer } from '@/types/game';
import api from '@/lib/api';
import LivePlayerCard from './LivePlayerCard';
import WatchPlayer from './WatchPlayer';
import { Users } from 'lucide-react';

const LivePlayers: React.FC = () => {
  const [players, setPlayers] = useState<LivePlayer[]>([]);
  const [watchingPlayerId, setWatchingPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      const response = await api.getLivePlayers();
      if (response.success && response.data) {
        setPlayers(response.data);
      }
      setIsLoading(false);
    };
    fetchPlayers();

    // Refresh every 5 seconds
    const interval = setInterval(fetchPlayers, 5000);
    return () => clearInterval(interval);
  }, []);

  if (watchingPlayerId) {
    return (
      <WatchPlayer
        playerId={watchingPlayerId}
        onBack={() => setWatchingPlayerId(null)}
      />
    );
  }

  return (
    <div className="bg-card/50 border border-border/50 rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4 justify-center">
        <Users className="w-5 h-5 text-secondary" />
        <h2 className="text-2xl font-bold neon-text-cyan">Live Players</h2>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : players.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No players online right now
        </div>
      ) : (
        <div className="space-y-3">
          {players.map(player => (
            <LivePlayerCard
              key={player.id}
              player={player}
              onWatch={setWatchingPlayerId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LivePlayers;
