import React, { useState, useEffect } from 'react';

// import { Box, Flex, Text, Avatar, IconButton, Image, Tag, Skeleton } from '@chakra-ui/react';

import {
  Box,
  Container,
  
  Text,
  IconButton,
  Avatar,
  Tag,
  Skeleton,
  useToast,
  Flex,
  Image,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputLeftElement,
  Heading,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FiHeart, FiSearch } from 'react-icons/fi';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { firestore, auth } from '../firebase/firebase';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [popularTags, setPopularTags] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const postsQuery = query(
      collection(firestore, 'posts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        likes: doc.data().likes || [],
      }));
      setPosts(postsData);
      calculatePopularTags(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const calculatePopularTags = (postsData) => {
    const tagCounts = {};
    postsData.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          if (!tagCounts[tag]) {
            tagCounts[tag] = 0;
          }
          tagCounts[tag] += post.likes?.length || 0;
        });
      }
    });

    const sortedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, likes]) => ({ tag, likes }));

    setPopularTags(sortedTags);
  };

  const handleLike = async (postId) => {
    if (!auth.currentUser) {
      toast({
        title: 'Not logged in',
        description: 'Please login to like posts',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const postRef = doc(firestore, 'posts', postId);
      const userId = auth.currentUser.uid;
      const post = posts.find(p => p.id === postId);
      
      if (post.likes.includes(userId)) {
        await updateDoc(postRef, {
          likes: arrayRemove(userId)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(userId)
        });
      }
    } catch (error) {
      console.error("Error updating like:", error);
      toast({
        title: 'Error',
        description: 'Failed to update like',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    let date;
    try {
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'object' && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }

      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return '';
    }
  };

  



const GenderSymbol = ({ gender }) => {
  if (!gender) return null;
  
  const symbols = {
    male: { symbol: "♂", color: "blue.400" },
    female: { symbol: "♀", color: "pink.400" },
    other: { symbol: "⚥", color: "purple.400" },
    "prefer-not-to-say": { symbol: "•", color: "gray.400" }
  };

  const symbolData = symbols[gender] || symbols["prefer-not-to-say"];

  return (
    <Text//
      fontSize="xl"
      fontWeight="bold"
      color={symbolData.color}
      ml={2}
      className="gender-symbol"
      sx={{
        animation: "pulse 2s infinite"
      }}
    >
      {symbolData.symbol}
    </Text>
  );
};

const PostCard = ({ post }) => {
  const isLiked = post.likes?.includes(auth.currentUser?.uid);

  return (
    <Box
      w="100%"
      bg="gray.900"
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="2xl"
      border="1px solid"
      borderColor="gray.800"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-4px)', boxShadow: '3xl' }}
      mb={8}
    >
      {/* Header Section */}
      <Flex 
        p={6}
        bg="gray.800"
        align="center"
        borderBottom="1px solid"
        borderColor="gray.700"
      >
        <Avatar
          size="lg"
          name={post.name}
          src={post.avatarUrl}
          border="3px solid"
          borderColor={post.gender === 'male' ? 'blue.400' : 'pink.400'}
        />
        <Box ml={4}>
          <Flex align="center">
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="white"
              bgGradient={post.gender === 'male' ? 
                "linear(to-r, blue.200, blue.400)" :
                "linear(to-r, pink.200, pink.400)"
              }
              bgClip="text"
            >
              {post.name}
            </Text>
            <GenderSymbol gender={post.gender} />
          </Flex>
          <Text color="gray.400" fontSize="sm" mt={1}>
            {formatTimestamp(post.createdAt)}
          </Text>
        </Box>
      </Flex>

      {/* Content Section */}
      {post.text && (
        <Box p={6} bg="gray.900">
          <Text
            fontSize="2xl"
            lineHeight="1.6"
            color="gray.100"
            fontWeight="medium"
            letterSpacing="wide"
          >
            {post.text}
          </Text>
        </Box>
      )}

      {/* Image Section */}
      {post.imageUrl && (
        <Box>
          <Image
            w="100%"
            maxH="600px"
            objectFit="cover"
            src={post.imageUrl}
            alt="Post content"
            fallback={
              <Skeleton
                h="400px"
                startColor="gray.800"
                endColor="gray.700"
              />
            }
          />
        </Box>
      )}

      {/* Footer Section */}
      <Box p={6} bg="gray.900">
        {/* Tags Section */}
        {post.tags && post.tags.length > 0 && (
          <Flex gap={2} flexWrap="wrap" mb={4}>
            {post.tags.map((tag, index) => (
              <Tag
                key={index}
                size="lg"
                bg={post.gender === 'male' ? 'blue.900' : 'pink.900'}
                color={post.gender === 'male' ? 'blue.200' : 'pink.200'}
                borderRadius="full"
                px={4}
                py={2}
                _hover={{
                  transform: 'translateY(-2px)',
                  bg: post.gender === 'male' ? 'blue.800' : 'pink.800'
                }}
                transition="all 0.2s"
                cursor="pointer"
              >
                #{tag}
              </Tag>
            ))}
          </Flex>
        )}

        {/* Likes Section */}
        <Flex justify="space-between" align="center" mt={4}>
          <Text 
            fontSize="lg" 
            color="gray.300"
            fontWeight="medium"
          >
            {post.likes?.length || 0} likes
          </Text>
          <IconButton
            icon={<FiHeart fill={isLiked ? '#F56565' : 'none'} />}
            variant="ghost"
            colorScheme={isLiked ? 'red' : 'gray'}
            aria-label="Like"
            onClick={() => handleLike(post.id)}
            color={isLiked ? 'red.400' : 'gray.400'}
            _hover={{ bg: 'gray.700', transform: 'scale(1.1)' }}
            size="lg"
            transition="all 0.2s"
          />
        </Flex>
      </Box>
    </Box>
  );
};





  const LoadingSkeleton = () => (
    <Box
      w="100%"
      bg="gray.900"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="2xl"
      border="1px solid"
      borderColor="gray.800"
    >
      <Grid templateColumns={{ base: "1fr", md: "250px 1fr" }} gap={0}>
        <GridItem bg="gray.800" p={{ base: 4, md: 6 }}>
          <Flex 
            direction={{ base: "row", md: "column" }} 
            align="center" 
            justify={{ base: "flex-start", md: "center" }}
            gap={{ base: 4, md: 0 }}
          >
            <Skeleton
              startColor="gray.800"
              endColor="gray.700"
              borderRadius="full"
              boxSize={{ base: "48px", md: "96px" }}
              mb={{ base: 0, md: 4 }}
            />
            <Box>
              <Skeleton
                startColor="gray.800"
                endColor="gray.700"
                h="24px"
                w="150px"
                mb={2}
              />
              <Skeleton
                startColor="gray.800"
                endColor="gray.700"
                h="16px"
                w="100px"
              />
            </Box>
          </Flex>
        </GridItem>
        <GridItem p={{ base: 4, md: 6 }}>
          <Skeleton
            startColor="gray.800"
            endColor="gray.700"
            h="120px"
            mb={6}
          />
          <Skeleton
            startColor="gray.800"
            endColor="gray.700"
            h={{ base: "200px", md: "300px" }}
            borderRadius="xl"
            mb={6}
          />
          <Skeleton
            startColor="gray.800"
            endColor="gray.700"
            h="40px"
          />
        </GridItem>
      </Grid>
    </Box>
  );

  const SearchAndTags = () => (
    <Box mb={{ base: 4, md: 8 }}>
      <InputGroup mb={{ base: 4, md: 6 }}>
        <InputLeftElement pointerEvents="none">
          <FiSearch color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Search posts by content or tags..."
          bg="gray.900"
          border="1px solid"
          borderColor="gray.700"
          color="white"
          _placeholder={{ color: 'gray.400' }}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedTag('');
          }}
          size={{ base: "md", md: "lg" }}
        />
      </InputGroup>

      {popularTags.length > 0 && (
        <Box>
          <Heading size={{ base: "xs", md: "sm" }} color="gray.300" mb={3}>
            Popular Tags
          </Heading>
          <Wrap spacing={{ base: 1, md: 2 }}>
            {popularTags.map(({ tag, likes }) => (
              <WrapItem key={tag}>
                <Tag
                  size={{ base: "sm", md: "md" }}
                  bg={selectedTag === tag ? 'blue.600' : 'blue.900'}
                  color="blue.200"
                  borderRadius="full"
                  px={3}
                  py={1}
                  cursor="pointer"
                  _hover={{ bg: 'blue.800' }}
                  onClick={() => {
                    setSelectedTag(selectedTag === tag ? '' : tag);
                    setSearchQuery('');
                  }}
                >
                  #{tag}
                  <Text as="span" ml={2} fontSize="xs" color="gray.400">
                    ({likes})
                  </Text>
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}
    </Box>
  );

  const getFilteredPosts = () => {
    return posts.filter(post => {
      const matchesSearch = searchQuery.toLowerCase().trim() === '' ||
        post.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag === '' ||
        post.tags?.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  };

  return (
    <Box bg="black" minH="100vh" py={{ base: 4, md: 8 }}>
      <Container maxW="6xl" px={{ base: 2, sm: 4, md: 8 }}>
        <SearchAndTags />
        <Flex direction="column" gap={{ base: 4, md: 8 }}>
          {loading
            ? Array.from({ length: 2 }).map((_, i) => (
                <LoadingSkeleton key={i} />
              ))
            : getFilteredPosts().map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
          {!loading && getFilteredPosts().length === 0 && (
            <Text 
              color="gray.400" 
              textAlign="center" 
              py={{ base: 4, md: 8 }}
              fontSize={{ base: "md", md: "lg" }}
            >
              No posts found matching your search criteria.
            </Text>
          )}
        </Flex>
      </Container>
    </Box>
  );
};

export default FeedPage;