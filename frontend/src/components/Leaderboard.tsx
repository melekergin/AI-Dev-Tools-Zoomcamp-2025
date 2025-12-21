import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, GameMode } from '@/types/game';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, Zap, Shield } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<GameMode | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      const response = await api.getLeaderboard(filter === 'all' ? undefined : filter);
      if (response.success && response.data) {
        setEntries(response.data);
      }
      setIsLoading(false);
    };
    fetchLeaderboard();
  }, [filter]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-muted-foreground">{rank}</span>;
    }
  };

  const getModeIcon = (mode: GameMode) => {
    return mode === 'walls' 
      ? <Shield className="w-4 h-4 text-primary" />
      : <Zap className="w-4 h-4 text-secondary" />;
  };

  return (
    <div className="bg-card/50 border border-border/50 rounded-lg p-6 backdrop-blur-sm">
      <h2 className="text-2xl font-bold neon-text-cyan mb-4 text-center">Leaderboard</h2>

      {/* Filter Buttons */}
      <div className="flex gap-2 justify-center mb-6">
        <Button
          variant={filter === 'all' ? 'neon' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'walls' ? 'neon' : 'outline'}
          size="sm"
          onClick={() => setFilter('walls')}
        >
          <Shield className="w-4 h-4 mr-1" />
          Walls
        </Button>
        <Button
          variant={filter === 'pass-through' ? 'neonCyan' : 'outline'}
          size="sm"
          onClick={() => setFilter('pass-through')}
        >
          <Zap className="w-4 h-4 mr-1" />
          Portal
        </Button>
      </div>

      {/* Leaderboard Table */}
      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : (
        <div className="space-y-2">
          {entries.slice(0, 10).map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                index < 3 
                  ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <div className="w-8 flex justify-center">
                {getRankIcon(index + 1)}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${index < 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {entry.username}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getModeIcon(entry.mode)}
                <span className={`font-pixel text-sm ${index < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {entry.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
