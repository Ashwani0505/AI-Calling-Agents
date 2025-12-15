import { useState, useEffect } from 'react';
import { Settings, Home, Clock, Menu, X } from 'lucide-react';
import type { NavigationState } from './types';
import Dashboard from './components/Dashboard';
import SettingsPage from './components/SettingsPage';
import ConversationPage from './components/ConversationPage';
import HistoryPage from './components/HistoryPage';

function App() {
  const [navigation, setNavigation] = useState<NavigationState>(() => {
    const saved = localStorage.getItem('navigation');
    return saved ? JSON.parse(saved) : { page: 'dashboard' };
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminMode, setAdminMode] = useState(() => {
    return localStorage.getItem('adminMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('navigation', JSON.stringify(navigation));
  }, [navigation]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        const newAdminMode = !adminMode;
        setAdminMode(newAdminMode);
        localStorage.setItem('adminMode', String(newAdminMode));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [adminMode]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const clicks = Number(localStorage.getItem('logoClicks') || '0') + 1;
    localStorage.setItem('logoClicks', String(clicks));

    if (clicks >= 3) {
      const newAdminMode = !adminMode;
      setAdminMode(newAdminMode);
      localStorage.setItem('adminMode', String(newAdminMode));
      localStorage.setItem('logoClicks', '0');
    }

    setTimeout(() => {
      localStorage.setItem('logoClicks', '0');
    }, 1000);
  };

  const navigateTo = (page: NavigationState['page'], agentId?: string, conversationId?: string) => {
    const newState = { page, agentId, conversationId };
    setNavigation(newState);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" style={{ pointerEvents: 'none' }} />

      {navigation.page !== 'conversation' && (
        <nav className="relative bg-black/60 backdrop-blur-sm border-b border-cyan-500/20 shadow-[0_0_30px_rgba(0,255,255,0.1)] sticky top-0" style={{ zIndex: 50 }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-4 lg:space-x-10">
                <h1
                  onMouseDown={handleLogoClick}
                  className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 font-['Orbitron'] tracking-wider uppercase glitch cursor-pointer select-none"
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                >
                  NEURAL LINK
                </h1>

                <div className="hidden lg:flex space-x-2">
                  <button
                    onClick={() => navigateTo('dashboard')}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all font-['Rajdhani'] font-semibold text-base uppercase tracking-wide ${
                      navigation.page === 'dashboard'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.3)]'
                        : 'text-cyan-600 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30'
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    <span>Hub</span>
                  </button>
                  <button
                    onClick={() => navigateTo('history')}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all font-['Rajdhani'] font-semibold text-base uppercase tracking-wide ${
                      navigation.page === 'history'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.3)]'
                        : 'text-cyan-600 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30'
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                    <span>History</span>
                  </button>
                  {adminMode && (
                    <button
                      onClick={() => navigateTo('settings')}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all font-['Rajdhani'] font-semibold text-base uppercase tracking-wide ${
                        navigation.page === 'settings'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.3)]'
                          : 'text-cyan-600 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30'
                      }`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Config</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,0,0.8)]" />
                  <span className="text-green-400 font-['Share_Tech_Mono'] text-sm font-bold uppercase">SYSTEM ONLINE</span>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-3 text-cyan-300 hover:text-cyan-100 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-all border-2 border-cyan-400/70 shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:shadow-[0_0_25px_rgba(0,255,255,0.6)]"
                >
                  {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                </button>
              </div>
            </div>

            {mobileMenuOpen && (
              <div className="lg:hidden pb-4 space-y-2 animate-in slide-in-from-top duration-200">
                <button
                  onClick={() => navigateTo('dashboard')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all font-['Rajdhani'] font-semibold text-base uppercase tracking-wide ${
                    navigation.page === 'dashboard'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.3)]'
                      : 'text-cyan-600 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Hub</span>
                </button>
                <button
                  onClick={() => navigateTo('history')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all font-['Rajdhani'] font-semibold text-base uppercase tracking-wide ${
                    navigation.page === 'history'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.3)]'
                      : 'text-cyan-600 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span>History</span>
                </button>
                {adminMode && (
                  <button
                    onClick={() => navigateTo('settings')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all font-['Rajdhani'] font-semibold text-base uppercase tracking-wide ${
                      navigation.page === 'settings'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.3)]'
                        : 'text-cyan-600 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Config</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>
      )}

      <main className="relative" style={{ zIndex: 10 }}>
        {navigation.page === 'dashboard' && (
          <Dashboard onAgentClick={(agentId, conversationId) => navigateTo('conversation', agentId, conversationId)} />
        )}
        {navigation.page === 'history' && (
          <HistoryPage onConversationClick={(agentId, conversationId) => navigateTo('conversation', agentId, conversationId)} />
        )}
        {navigation.page === 'settings' && <SettingsPage />}
        {navigation.page === 'conversation' && navigation.agentId && (
          <ConversationPage
            agentId={navigation.agentId}
            conversationId={navigation.conversationId}
            onBack={() => navigateTo('dashboard')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
