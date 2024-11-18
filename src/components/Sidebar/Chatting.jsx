import { Link as RouterLink } from "react-router-dom";
import { Link, HStack, Text, Box } from "@chakra-ui/react";

const Chatting = () => {
  return (
    <Link
      as={RouterLink}
      to="/"
      _hover={{ bg: "gray.100" }}
      width="full"
      display="block"
      textDecoration="none"
    >
      <HStack spacing={4} p={3} borderRadius="lg" transition="background 0.2s">
        <Text fontSize="xl">💬</Text>
        <Text fontSize="lg" display={{ base: "none", md: "block" }}>
          Just Chatting
        </Text>
      </HStack>
    </Link>
  );
};

export default Chatting;