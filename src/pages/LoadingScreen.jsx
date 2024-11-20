import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  keyframes,
  useColorModeValue,
  ScaleFade,
} from "@chakra-ui/react";
import { MessageCircle } from 'lucide-react';

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const LoadingScreen = () => {
  const [show, setShow] = useState(true);
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtleColor = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000); // Adjust duration as needed

    return () => clearTimeout(timer);
  }, []);

  const fadeInAnimation = `${fadeIn} 0.6s ease-out`;
  const pulseAnimation = `${pulse} 2s infinite`;

  return (
    <ScaleFade in={show} initialScale={0.9}>
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg={bgColor}
        zIndex="9999"
      >
        <Flex
          height="100vh"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={4}
        >
          <Box
            animation={pulseAnimation}
            mb={4}
          >
            <MessageCircle size={48} />
          </Box>
          
          <Text
            fontSize="4xl"
            fontWeight="bold"
            color={textColor}
            animation={fadeInAnimation}
            textAlign="center"
          >
            VITConnect
          </Text>

          <Box
            animation={`${fadeInAnimation} 0.6s ease-out 0.3s forwards`}
            opacity="0"
          >
            <Text
              fontSize="lg"
              color={subtleColor}
              textAlign="center"
            >
              Chat Anonymously
            </Text>
          </Box>

          <Box
            animation={`${fadeInAnimation} 0.6s ease-out 0.6s forwards`}
            opacity="0"
          >
            <Text
              fontSize="sm"
              color={subtleColor}
              textAlign="center"
            >
              Exclusively for VIT-AP Campus Community
            </Text>
          </Box>
        </Flex>
      </Box>
    </ScaleFade>
  );
};

export default LoadingScreen;