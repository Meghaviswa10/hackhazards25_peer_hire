import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import JobListing from "./pages/JobListing";
import JobDetails from "./pages/JobDetails";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ProfileSettings from "./pages/ProfileSettings";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import PostJob from "./pages/PostJob";
import Contracts from "./pages/Contracts";
import Payments from "./pages/Payments";
import ProjectDetails from "./pages/ProjectDetails";
import WorkVerification from "./pages/WorkVerification";
import ScreenRecording from "./pages/ScreenRecording";
import Proposals from "./pages/Proposals";
import ProposalEdit from "./pages/ProposalEdit";
import ActiveJobs from "./pages/ActiveJobs";
import Notifications from "./pages/Notifications";
import HelpCenter from "./pages/HelpCenter";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import Blog from "./pages/Blog";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Security from "./pages/Security";
import CodeOfConduct from "./pages/CodeOfConduct";
import Contact from "./pages/Contact";
import Enterprise from "./pages/Enterprise";
import Portfolio from "./pages/Portfolio";
import SuccessStories from "./pages/SuccessStories";
import MobileApp from "./pages/MobileApp";
import FreelancerListing from "./pages/FreelancerListing";
import GroqChatButton from "@/components/GroqChatButton";
import { RoleToggle } from "./components/RoleToggle";
import { DashboardSidebar } from "./components/layout/DashboardSidebar";
import FloatingNavbar from "./components/layout/FloatingNavbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoadingScreen } from './components/LoadingScreen';
import axios from 'axios';
import PostedJobs from '@/pages/PostedJobs';

const queryClient = new QueryClient();

const App = () => {
  let [isLoading, setIsLoading] = useState(false);
  let [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;

  useEffect(() => {
    // Log frontend environment variables
    console.log('Frontend Environment Configuration:');
    console.log('------------------------');
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('VITE_AUTH_STORAGE_KEY:', import.meta.env.VITE_AUTH_STORAGE_KEY);
    console.log('VITE_ENABLE_CHAT_FEATURE:', import.meta.env.VITE_ENABLE_CHAT_FEATURE);
    console.log('VITE_ENABLE_SCREEN_RECORDING:', import.meta.env.VITE_ENABLE_SCREEN_RECORDING);
    console.log('------------------------');

    const checkBackend = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/spinup`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (response.status >= 200 && response.status < 300) {
          setIsLoading(false);
          setRetryCount(0);
        }
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          setIsLoading(true);
          setRetryCount(prev => prev + 1);
          // Exponential backoff: 2s, 4s, 8s
          setTimeout(checkBackend, Math.pow(2, retryCount + 1) * 1000);
        } else {
          // After max retries, show the app anyway
          setIsLoading(false);
          console.warn('Backend health check failed, but continuing to load app');
        }
      }
    };

    // Only run health check in production
    if (import.meta.env.PROD) {
      checkBackend();
    }
  }, [retryCount]);

  // Only show LoadingScreen during initial backend check attempts
  if (isLoading && retryCount < MAX_RETRIES) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router>
            <FloatingNavbar />
            <Routes>
              {/* Public Marketing Pages */}
              <Route path="/" element={isLoading == true ? <LoadingScreen /> : <Home />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/enterprise" element={<Enterprise />} />

              {/* Auth Pages */}
              <Route path="/auth">
                <Route path="login" element={<AuthPage type="login" />} />
                <Route path="signup" element={<AuthPage type="signup" />} />
                <Route path="freelancer-signup" element={<AuthPage type="freelancer-signup" />} />
                <Route path="client-signup" element={<AuthPage type="client-signup" />} />
              </Route>

              {/* Legal & Info Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/security" element={<Security />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/code-of-conduct" element={<CodeOfConduct />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/success-stories" element={<SuccessStories />} />
              <Route path="/mobile-app" element={<MobileApp />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                {/* Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Job Management */}
                <Route path="/post-job" element={<PostJob />} />
                <Route path="/jobs/posted" element={<PostedJobs />} />
                <Route path="/jobs" element={<JobListing />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/proposals" element={<Proposals />} />
                <Route path="/proposals/edit/:id" element={<ProposalEdit />} />
                <Route path="/jobs/active" element={<ActiveJobs />} />
                <Route path="/freelancers" element={<FreelancerListing />} />

                {/* Projects & Contracts */}
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
                <Route path="/work-verification/:id" element={<WorkVerification />} />

                {/* User Profile & Settings */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/settings" element={<ProfileSettings />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/settings" element={<Settings />} />

                {/* Communication */}
                <Route path="/messages" element={<Messages />} />
                <Route path="/notifications" element={<Notifications />} />

                {/* Tools */}
                <Route path="/screen-recording" element={<ScreenRecording />} />

                {/* Finance */}
                <Route path="/payments" element={<Payments />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <GroqChatButton />
            <RoleToggle />
          </Router>
          <Toaster />
          <SonnerToaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
