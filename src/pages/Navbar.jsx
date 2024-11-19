import React from 'react';
import { 
    Flex, 
    Text, 
    Button, 
    useColorModeValue, 
    Avatar,
    Tooltip,
    useToast
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { MessageCircle } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const [user] = useAuthState(auth);
    const toast = useToast();

    const handleChatNavigation = () => {
        if (user) {
            navigate("/upload");
        } else {
            toast({
                title: "Authentication Required",
                description: "Please login to access chat features",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top"
            });
            navigate("/auth");
        }
    };

    const handleAuth = () => {
        if (user) {
            signOut(auth);
        } else {
            navigate("/auth");
        }
    };

    return (
        <Flex
            w="full"
            py={3}
            px={6}
            alignItems="center"
            justifyContent="space-between"
            bg={useColorModeValue('white', 'gray.800')}
            borderBottom="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
            <Text
                fontWeight="bold"
                fontSize="2xl"
                color={useColorModeValue('gray.800', 'white')}
                cursor="pointer"
                onClick={() => navigate("/")}
            >
                JustChat
            </Text>

            <Flex alignItems="center" gap={4}>
                <Tooltip 
                    label={user ? "Upload" : "Login to Upload"}
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

                {user ? (
                    <Avatar 
                        size="sm" 
                        name={user.displayName || "User"} 
                        src={user.photoURL || undefined} 
                        onClick={() => navigate("/profile")}
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
            </Flex>
        </Flex>
    );
};

export default Navbar;