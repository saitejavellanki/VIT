import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Avatar,
  Text,
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Flex,
  Stack,
  Skeleton,
  SimpleGrid,
  useToast,
  Divider
} from '@chakra-ui/react';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const currentUser = auth.currentUser;

        if (!currentUser) {
          toast({
            title: "Error",
            description: "No user logged in",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (!userDoc.exists()) {
          toast({
            title: "Error",
            description: "User profile not found",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        setUserProfile({
          id: userDoc.id,
          ...userDoc.data()
        });

        // Fetch user's posts
        const postsRef = collection(db, 'posts');
        const q = query(
          postsRef,
          where('authorId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

        const postsSnapshot = await getDocs(q);
        const postsData = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUserPosts(postsData);

      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp.toDate()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={4} align="stretch">
          <Skeleton height="150px" />
          <Skeleton height="200px" />
          <SimpleGrid columns={[1, 2, 3]} spacing={4}>
            <Skeleton height="200px" />
            <Skeleton height="200px" />
            <Skeleton height="200px" />
          </SimpleGrid>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Profile Header */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          <Flex gap={4} align="flex-start">
            <Avatar
              size="xl"
              name={userProfile?.displayName}
              src={userProfile?.photoURL}
            />
            <VStack align="flex-start" spacing={2} flex={1}>
              <Heading size="lg">{userProfile?.displayName}</Heading>
              <Text color="gray.500">@{userProfile?.customUsername}</Text>
              {userProfile?.bio && (
                <Text mt={2}>{userProfile.bio}</Text>
              )}
              
              <Text color="gray.500" fontSize="sm">
                Joined {formatDate(userProfile?.createdAt)}
              </Text>
            </VStack>
          </Flex>
        </Box>

        {/* Content Tabs */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Posts</Tab>
            <Tab>About</Tab>
          </TabList>

          <TabPanels>
            {/* Posts Tab */}
            <TabPanel px={0}>
              {userPosts.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500">No posts yet</Text>
                </Box>
              ) : (
                <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                  {userPosts.map(post => (
                    <Box 
                      key={post.id}
                      p={4}
                      bg="white"
                      borderRadius="md"
                      boxShadow="sm"
                    >
                      {post.content && (
                        <Text noOfLines={3}>{post.content}</Text>
                      )}
                      {post.imageUrl && (
                        <Box 
                          mt={2}
                          h="200px"
                          bgImage={`url(${post.imageUrl})`}
                          bgSize="cover"
                          bgPosition="center"
                          borderRadius="md"
                        />
                      )}
                      <Text 
                        mt={2}
                        fontSize="sm"
                        color="gray.500"
                      >
                        {formatDate(post.createdAt)}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>

            {/* About Tab */}
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold" mb={2}>Email</Text>
                  <Text>{userProfile?.email}</Text>
                </Box>
                <Divider />
                <Box>
                  <Text fontWeight="bold" mb={2}>Account Details</Text>
                  <Stack spacing={2}>
                    <Flex justify="space-between">
                      <Text color="gray.600">User ID</Text>
                      <Text>{userProfile?.id}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.600">Join Date</Text>
                      <Text>{formatDate(userProfile?.createdAt)}</Text>
                    </Flex>
                  </Stack>
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default UserProfile;