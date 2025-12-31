import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { getCurrentUser } from './utils/auth';
import type { User } from './utils/auth';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={checkUser} />;
  }

  return <Dashboard user={user} onSignOut={() => setUser(null)} />;
}
