import React from 'react';
import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebase";
import Navbar from "../../components/Navbar/Navbar";

const PageLayout = ({ children }) => {
    const { pathname } = useLocation(); 
    const [user, loading] = useAuthState(auth); 
    const canRenderNavbar = !user && !loading && pathname !== "/auth";
    const checkingUserIsAuth = !user && loading;

    if (checkingUserIsAuth) return <PageLayoutSpinner />;

    return ( 
        <Flex 
            flexDir="column" 
            h="100vh" 
            maxW="container.xl" 
            mx="auto"
        >
            {canRenderNavbar && <Navbar />}
            
            <Box flex={1} w="full" overflowY="auto">
                {children}
            </Box>
        </Flex>
    );
};

const PageLayoutSpinner = () => {
    return ( 
        <Flex 
            flexDir='column' 
            h='100vh' 
            alignItems='center' 
            justifyContent='center'
        > 
            <Spinner size='xl' /> 
        </Flex> 
    );
};

export default PageLayout;