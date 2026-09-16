import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Splash from './pages/Splash';
import Home from './pages/Home';
import ROICalculator from './pages/ROICalculator';
import Compare from './pages/Compare';
import Market from './pages/Market';
import Simulate from './pages/Simulate';
import Personality from './pages/Personality';
import Stories from './pages/Stories';
import Chat from './pages/Chat';
import Future from './pages/Future';
import Scholarships from './pages/Scholarships';
import Alternatives from './pages/Alternatives';
import MyField from './pages/MyField';
import Profile, { ProfileEdit } from './pages/Profile';
import Auth from './pages/Auth';
import BottomNav from './components/BottomNav';
import RequireAuth from './components/RequireAuth';
import { useAuth } from './context/AuthContext';
import { recordVisit } from './lib/activity';

/**
 * Counts the tools this visitor actually opens, so the profile can show a real
 * number instead of a decorative one. Nothing leaves the device.
 */
function UsageTracker() {
  const { pathname } = useLocation();
  const { ready, user, isGuest } = useAuth();

  useEffect(() => {
    if (!ready || (!user && !isGuest)) return;
    recordVisit(pathname);
  }, [pathname, ready, user, isGuest]);

  return null;
}

function App() {
  return (
    <div className="min-h-screen bg-gov-bg text-gov-ink antialiased">
      <UsageTracker />
      <Routes>
        {/* Open: the brand splash and the three doors. */}
        <Route path="/" element={<Splash />} />
        <Route path="/auth" element={<Auth />} />

        {/* Needs an identity — signed in or an explicit guest choice. */}
        <Route element={<RequireAuth><Outlet /></RequireAuth>}>
          <Route path="/home" element={<Home />} />
          <Route path="/roi" element={<ROICalculator />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/market" element={<Market />} />
          <Route path="/simulate" element={<Simulate />} />
          <Route path="/personality" element={<Personality />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/future" element={<Future />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/alternatives" element={<Alternatives />} />
          <Route path="/field" element={<MyField />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Needs a real account: editing a profile writes data a guest has nowhere to keep. */}
        <Route element={<RequireAuth mode="account"><Outlet /></RequireAuth>}>
          <Route path="/profile/edit" element={<ProfileEdit />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default App;
