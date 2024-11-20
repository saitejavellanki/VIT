import React, { useState } from 'react';
import { Box, Container, Text, useToast } from '@chakra-ui/react';
import { PostCard } from '../components/feed/PostCard';
import { SearchAndTags } from '../components/feed/SearchAndTags';
import { LoadingSkeleton } from '../components/feed/LoadingSkeleton';
import { useFeedData } from '../hooks/useFeedData';
import { postActions } from '../utils/postActions'; // Updated import
import { auth } from '../firebase/firebase';

const FeedPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const { posts, loading, popularTags } = useFeedData();
  const toast = useToast();

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedTag('');
  };

  const handleTagSelect = (tag) => {
    setSelectedTag(selectedTag === tag ? '' : tag);
    setSearchQuery('');
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
      await postActions.handleLike(postId, auth.currentUser.uid); // Updated function call
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
        <SearchAndTags 
          popularTags={popularTags}
          onSearchChange={handleSearch}
          onTagSelect={handleTagSelect}
          selectedTag={selectedTag}
        />
        
        <Box>
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <LoadingSkeleton key={i} />
            ))
          ) : (
            <>
              {getFilteredPosts().length > 0 ? (
                getFilteredPosts().map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post}
                    onLike={handleLike}
                  />
                ))
              ) : (
                <Text 
                  color="gray.400" 
                  textAlign="center" 
                  py={{ base: 4, md: 8 }}
                  fontSize={{ base: "md", md: "lg" }}
                >
                  No posts found matching your search criteria.
                </Text>
              )}
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default FeedPage;