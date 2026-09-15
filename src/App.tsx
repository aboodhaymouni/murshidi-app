import { Routes, Route } from 'react-router-dom';
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
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <div className="min-h-screen bg-gov-bg text-gov-ink antialiased">
      <Routes>
        <Route path="/" element={<Splash />} />
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
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default App;
