import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Music2 } from 'lucide-react';
import { signIn, signUp } from '../utils/auth';
import { toast } from 'sonner@2.0.3';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(loginEmail, loginPassword);
      toast.success('Login realizado com sucesso!');
      onAuthSuccess();
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signUp(signupEmail, signupPassword, signupName);
      // Fazer login automaticamente após o registro
      await signIn(signupEmail, signupPassword);
      toast.success('Conta criada com sucesso!');
      onAuthSuccess();
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <Music2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white mb-2">Timeline Musical</h1>
          <p className="text-purple-200">
            Crie e compartilhe suas histórias através da música
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Bem-vindo</CardTitle>
            <CardDescription className="text-purple-200">
              Entre ou crie uma conta para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5">
                <TabsTrigger value="login" className="data-[state=active]:bg-white/20 text-white">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-white/20 text-white">
                  Criar Conta
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-white">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-white">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-white">Nome</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Criando...' : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
