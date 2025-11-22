import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NewLandingPage from './pages/NewLandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import { ToastProvider } from './components/ui/toast';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NewLandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/room/:shortId" element={<RoomPage />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
