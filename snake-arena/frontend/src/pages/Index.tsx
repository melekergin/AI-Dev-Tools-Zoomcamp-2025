import React, { useState } from 'react';
import Header from '@/components/Header';
import SnakeGame from '@/components/SnakeGame';
import Leaderboard from '@/components/Leaderboard';
import LivePlayers from '@/components/LivePlayers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, Trophy, Users } from 'lucide-react';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState('play');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 bg-muted/50 border border-border/50">
            <TabsTrigger 
              value="play" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Play
            </TabsTrigger>
            <TabsTrigger 
              value="leaderboard"
              className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Rankings
            </TabsTrigger>
            <TabsTrigger 
              value="watch"
              className="data-[state=active]:bg-neon-pink data-[state=active]:text-background"
            >
              <Users className="w-4 h-4 mr-2" />
              Watch
            </TabsTrigger>
          </TabsList>

          <TabsContent value="play" className="mt-0">
            <div className="flex justify-center">
              <SnakeGame />
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-0">
            <div className="max-w-lg mx-auto">
              <Leaderboard />
            </div>
          </TabsContent>

          <TabsContent value="watch" className="mt-0">
            <div className="max-w-lg mx-auto">
              <LivePlayers />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="py-4 text-center text-muted-foreground text-sm border-t border-border/30">
        <p>Use arrow keys or WASD to control the snake</p>
      </footer>
    </div>
  );
};

export default Index;
