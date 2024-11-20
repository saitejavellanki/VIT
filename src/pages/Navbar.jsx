import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  useColorModeValue,
  Avatar,
  Tooltip,
  useToast,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  HStack,
  Container
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { MessageCircle, Menu } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  const handleChatNavigation = () => {
    if (user) {
      navigate("/upload");
    } else {
      toast({
        title: "Chat Options Available",
        description: "Login to chat or continue anonymously",
        status: "info",
        duration: 5000,
        isClosable: true,
        position: "top",
        render: ({ onClose }) => (
          <Box
            color="white"
            p={3}
            bg={useColorModeValue("blue.500", "blue.200")}
            borderRadius="md"
          >
            <VStack align="stretch" spacing={3}>
              <Text fontWeight="bold">Chat Options Available</Text>
              <Text>Login to chat or continue anonymously</Text>
              <HStack spacing={3}>
                <Button size="sm" colorScheme="whiteAlpha" onClick={() => {
                  navigate("/auth");
                  onClose();
                }}>
                  Login
                </Button>
                <Button size="sm" variant="outline" colorScheme="whiteAlpha" onClick={() => {
                  navigate("/anonymous-chat");
                  onClose();
                }}>
                  Chat Anonymously
                </Button>
              </HStack>
            </VStack>
          </Box>
        )
      });
    }
  };

  const handleAuth = () => {
    if (user) {
      signOut(auth);
    } else {
      navigate("/auth");
    }
  };

  const ChatButton = () => (
    <Tooltip 
      label={user ? "Start chatting" : "Login or chat anonymously"}
      hasArrow
    >
      <Button
        variant="ghost"
        onClick={handleChatNavigation}
        leftIcon={<MessageCircle size={20} />}
      >
        Chat
      </Button>
    </Tooltip>
  );

  const NavContent = () => (
    <VStack spacing={4} align="stretch">
      {user ? (
        <HStack spacing={4} justify="center">
          <Avatar
            size="sm"
            name={user.displayName || "User"}
            src={user.photoURL || undefined}
            onClick={() => navigate("/profile")}
            cursor="pointer"
          />
          <Button
            onClick={handleAuth}
            colorScheme="red"
            variant="solid"
          >
            Logout
          </Button>
        </HStack>
      ) : (
        <Button
          onClick={handleAuth}
          colorScheme="blue"
          variant="solid"
        >
          Login
        </Button>
      )}
    </VStack>
  );

  return (
    <Box
      as="nav"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg={useColorModeValue('white', 'gray.800')}
      borderBottom="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      backdropFilter="blur(10px)"
      backdropBlur="md"
    >
      <Container maxW="container.xl">
        <Flex
          h="16"
          alignItems="center"
          justifyContent="space-between"
        >
          <HStack spacing={4}>
            <Text
              fontWeight="bold"
              fontSize="2xl"
              cursor="pointer"
              onClick={() => navigate("/")}
            >
              VITConnect
            </Text>
            <Text
              fontSize="xs"
              color={useColorModeValue('gray.500', 'gray.400')}
              display={{ base: 'none', md: 'block' }}
            >
              Exclusively for VIT-AP Campus Community
            </Text>
          </HStack>

          {/* Desktop Navigation */}
          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
            <ChatButton />
            {user ? (
              <Avatar
                size="sm"
                name={user.displayName || "User"}
                src={user.photoURL || undefined}
                // onClick={() => navigate("/profile")}
                cursor="pointer"
              />
            ) : null}
            <Button
              onClick={handleAuth}
              colorScheme={user ? "red" : "blue"}
              variant="solid"
            >
              {user ? "Logout" : "Login"}
            </Button>
          </HStack>

          {/* Mobile Navigation */}
          <HStack spacing={2} display={{ base: 'flex', md: 'none' }}>
            <ChatButton />
            <IconButton
              ref={btnRef}
              onClick={onOpen}
              variant="ghost"
              aria-label="Open menu"
              icon={<Menu size={24} />}
            />
          </HStack>

          {/* Mobile Navigation Drawer */}
          <Drawer
            isOpen={isOpen}
            placement="right"
            onClose={onClose}
            finalFocusRef={btnRef}
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
              <DrawerBody>
                <NavContent />
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;