import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Users, Zap, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInterviewSession } from '@/hooks/useInterviewSession';

const defaultCode = `// Welcome to CodeInterview!
// Write your code here and collaborate in real-time

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Test the function
console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(\`fib(\${i}) = \${fibonacci(i)}\`);
}
`;

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { createSession } = useInterviewSession(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async () => {
    setIsCreating(true);
    const session = await createSession(defaultCode, 'javascript');
    if (session) {
      navigate(`/session/${session.id}`);
    }
    setIsCreating(false);
  };

  const features = [
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description: 'Multiple users can edit code simultaneously with instant sync',
    },
    {
      icon: Code2,
      title: 'Syntax Highlighting',
      description: 'Support for JavaScript, Python, TypeScript and more',
    },
    {
      icon: Zap,
      title: 'In-Browser Execution',
      description: 'Run JavaScript code directly in the browser',
    },
    {
      icon: Globe,
      title: 'Shareable Links',
      description: 'Create a link and share it instantly with candidates',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center animate-slide-up">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center glow">
              <span className="gradient-text font-bold text-2xl">&lt;/&gt;</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground">CodeInterview</h1>
          </div>

          {/* Tagline */}
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Collaborative Coding
            <br />
            <span className="gradient-text">Made Simple</span>
          </h2>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Create an interview session, share the link, and code together in real-time.
            Perfect for technical interviews and pair programming.
          </p>

          {/* CTA Button */}
          <Button
            variant="glow"
            size="lg"
            onClick={handleCreateSession}
            disabled={isCreating}
            className="text-lg px-8 py-6 animate-pulse-glow"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Session...
              </>
            ) : (
              <>
                Start New Interview
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-6xl mx-auto px-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass rounded-xl p-6 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>Built for seamless technical interviews</p>
      </footer>
    </div>
  );
};

export default Index;
