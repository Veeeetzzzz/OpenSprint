import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { API_BASE_URL } from '@/lib/config';

interface DemoConfig {
  demoMode: boolean;
  demoCredentials?: {
    username: string;
    password: string;
    email: string;
  };
}

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoConfig, setDemoConfig] = useState<DemoConfig | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();

  // Fetch demo configuration on component mount
  useEffect(() => {
    const fetchDemoConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/config`);
        if (response.ok) {
          const data = await response.json();
          setDemoConfig(data.data);
        }
      } catch (error) {
        console.log('Failed to fetch demo config:', error);
      }
    };

    fetchDemoConfig();
  }, []);

  const handleDemoLogin = async () => {
    if (!demoConfig?.demoCredentials) return;
    
    setIsLoading(true);
    setError('');

    try {
      await login(demoConfig.demoCredentials.email, demoConfig.demoCredentials.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    if (!demoConfig?.demoCredentials) return;

    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    
    if (emailInput && passwordInput) {
      emailInput.value = demoConfig.demoCredentials.email;
      passwordInput.value = demoConfig.demoCredentials.password;
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const name = formData.get('name') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await register(email, password, name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome to OpenSprint</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
          {demoConfig?.demoMode && demoConfig.demoCredentials && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <div className="font-medium">Try the Demo!</div>
                <div className="text-sm text-muted-foreground">
                  Use these credentials to explore OpenSprint:
                </div>
                <div className="font-mono text-sm space-y-1">
                  <div>Email: {demoConfig.demoCredentials.email}</div>
                  <div className="flex items-center gap-2">
                    Password: 
                    {showPassword ? (
                      <span>{demoConfig.demoCredentials.password}</span>
                    ) : (
                      <span>••••</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-auto p-1"
                    >
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              {demoConfig?.demoMode && demoConfig.demoCredentials && (
                <div className="space-y-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    🚀 Quick Demo Login
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or enter manually
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                {demoConfig?.demoMode && demoConfig.demoCredentials && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={fillDemoCredentials}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    Fill demo credentials
                  </Button>
                )}
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder="Create a password (min 8 characters)"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    required
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 