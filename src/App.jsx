import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from "react-router-dom";
import { Box, Text, Flex, keyframes } from "@chakra-ui/react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/firebase";
import { MessageCircle } from 'lucide-react';

// Pages
import HomePage from "./pages/HomePage/HomePage";
import AuthPage from "./pages/AuthPage/AuthPage";
import ProfilePage from "./pages/profileJust";
import PostUpload from "./pages/post_upload";
import FeedPage from "./pages/postfeeds";
import Navbar from "./pages/Navbar";
import UserProfile from './pages/profileJust';

// Loading Screen Component
const LoadingScreen = () => {
  const fadeIn = keyframes`
    0% { opacity: 0; transform: translateY(40px); }
    100% { opacity: 1; transform: translateY(0); }
  `;

  const glowPulse = keyframes`
    0% { text-shadow: 0 0 20px rgba(255,255,255,0.1); }
    50% { text-shadow: 0 0 40px rgba(255,255,255,0.3); }
    100% { text-shadow: 0 0 20px rgba(255,255,255,0.1); }
  `;

  const iconPulse = keyframes`
    0% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(255,255,255,0.1)); }
    50% { transform: scale(1.1); filter: drop-shadow(0 0 40px rgba(255,255,255,0.3)); }
    100% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(255,255,255,0.1)); }
  `;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="black"
      zIndex="9999"
    >
      <Flex
        height="100vh"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={6}
        px={4}
      >
        <Box
          animation={`${iconPulse} 2s infinite ease-in-out`}
          mb={6}
          color="white"
        >
          <MessageCircle size={64} strokeWidth={1.5} />
        </Box>
        
        <Text
          fontSize={{ base: "5xl", md: "7xl" }}
          fontWeight="bold"
          color="white"
          animation={`${fadeIn} 0.8s ease-out, ${glowPulse} 2s infinite`}
          letterSpacing="tight"
          textAlign="center"
          mb={2}
        >
          VITConnect
        </Text>

        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          color="whiteAlpha.800"
          opacity="0"
          textAlign="center"
          animation={`${fadeIn} 0.8s ease-out 0.3s forwards`}
          fontWeight="light"
          letterSpacing="wider"
          mb={4}
        >
          Chat Anonymously
        </Text>

        <Text
          fontSize={{ base: "sm", md: "md" }}
          color="whiteAlpha.600"
          textAlign="center"
          opacity="0"
          animation={`${fadeIn} 0.8s ease-out 0.6s forwards`}
          letterSpacing="wide"
          fontWeight="light"
        >
          Exclusively for VIT-AP Campus Community
        </Text>
      </Flex>
    </Box>
  );
};

function App() {
  const [authUser] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Increased to 3 seconds to better showcase the animations

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box>
      {isLoading && <LoadingScreen />}
      <Navbar />
      <Routes>
        <Route path='/auth' element={!authUser ? <AuthPage /> : <Navigate to='/' />} />
        <Route path='/upload' element={<PostUpload />} />
        <Route path='/' element={<FeedPage />} />
		<Route path="/profile/:userId" element={<UserProfile/>} />
      </Routes>
    </Box>
  );
}

export default App;