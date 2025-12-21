import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import { LogIn, LogOut, User, Trophy } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <header className="w-full border-b border-border/30 bg-card/30 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center neon-box">
            <span className="font-pixel text-lg text-primary-foreground">🐍</span>
          </div>
          <h1 className="font-bold text-xl md:text-2xl neon-text tracking-wider">
            NEON SNAKE
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg border border-border/50">
                <User className="w-4 h-4 text-secondary" />
                <span className="text-foreground font-medium">{user.username}</span>
                <div className="w-px h-4 bg-border" />
                <Trophy className="w-4 h-4 text-primary" />
                <span className="font-pixel text-sm text-primary">{user.highScore}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Button variant="neonCyan" onClick={() => setShowAuthModal(true)}>
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  );
};

export default Header;
