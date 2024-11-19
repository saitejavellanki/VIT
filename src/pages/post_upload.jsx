import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Tag,
  HStack,
  Select,
  useToast,
  useColorModeValue,
  keyframes,
  Text,
} from '@chakra-ui/react';
import { collection, addDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebase/firebase';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px #3182ce; }
  50% { box-shadow: 0 0 20px #3182ce; }
  100% { box-shadow: 0 0 5px #3182ce; }
`;

const PostUpload = () => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    text: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Theme colors
  const bgColor = useColorModeValue('gray.800', 'gray.900');
  const cardBg = useColorModeValue('gray.700', 'gray.800');
  const inputBg = useColorModeValue('gray.600', 'gray.700');
  const textColor = useColorModeValue('white', 'gray.100');
  const borderColor = useColorModeValue('blue.400', 'blue.500');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
   
    try {
      const postData = {
        name: formData.name,
        gender: formData.gender,
        text: formData.text,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: new Date(),
        userId: auth.currentUser.uid,
        likes: [],
      };
   
      const postsCollectionRef = collection(firestore, 'posts');
      await addDoc(postsCollectionRef, postData);
   
      // Reset form
      setFormData({
        name: '',
        gender: '',
        text: '',
        tags: '',
      });
      
      toast({
        title: '🎉 Post created',
        description: 'Your post has been successfully uploaded',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } catch (err) {
      console.error('Upload error:', err);
      toast({
        title: '❌ Error',
        description: err.message || 'Failed to upload post',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
   };

  const renderTags = () => {
    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    return tags.map((tag, index) => (
      <Tag 
        key={index} 
        colorScheme="blue" 
        size="md"
        borderRadius="full"
        animation={`${float} 3s ease-in-out infinite`}
        sx={{
          '&:hover': {
            transform: 'scale(1.1)',
            transition: 'transform 0.2s',
          }
        }}
      >
        #{tag}
      </Tag>
    ));
  };

  return (
    <Container maxW="2xl" py={8} bg={bgColor} minH="100vh">
      <Box
        as="form"
        onSubmit={handleSubmit}
        borderWidth="2px"
        borderRadius="2xl"
        p={8}
        boxShadow="2xl"
        bg={cardBg}
        borderColor={borderColor}
        animation={`${glow} 3s infinite`}
        transition="transform 0.3s ease"
        _hover={{ transform: 'scale(1.01)' }}
      >
        <VStack spacing={8}>
          <Text
            fontSize="3xl"
            fontWeight="bold"
            color={textColor}
            textAlign="center"
            bgGradient="linear(to-r, blue.400, purple.400)"
            bgClip="text"
            animation={`${float} 3s ease-in-out infinite`}
          >
            ✨ Create New Post ✨
          </Text>

          <FormControl isRequired>
            <FormLabel color={textColor}>👤 Name</FormLabel>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              bg={inputBg}
              color={textColor}
              borderColor={borderColor}
              _hover={{ borderColor: 'blue.300' }}
              _focus={{ borderColor: 'blue.300', boxShadow: 'none' }}
              borderRadius="xl"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color={textColor}>⚧ Gender</FormLabel>
            <Select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              placeholder="Select gender"
              bg={inputBg}
              color={textColor}
              borderColor={borderColor}
              _hover={{ borderColor: 'blue.300' }}
              _focus={{ borderColor: 'blue.300', boxShadow: 'none' }}
              borderRadius="xl"
            >
              <option value="male">👨 Male</option>
              <option value="female">👩 Female</option>
              <option value="other">🌟 Other</option>
              <option value="prefer-not-to-say">🤐 Prefer not to say</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel color={textColor}>📝 Content</FormLabel>
            <Textarea
              name="text"
              value={formData.text}
              onChange={handleInputChange}
              placeholder="Write your post content here..."
              minH="200px"
              bg={inputBg}
              color={textColor}
              borderColor={borderColor}
              _hover={{ borderColor: 'blue.300' }}
              _focus={{ borderColor: 'blue.300', boxShadow: 'none' }}
              borderRadius="xl"
            />
          </FormControl>

          <FormControl>
            <FormLabel color={textColor}>🏷️ Tags</FormLabel>
            <Input
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Enter tags separated by commas"
              bg={inputBg}
              color={textColor}
              borderColor={borderColor}
              _hover={{ borderColor: 'blue.300' }}
              _focus={{ borderColor: 'blue.300', boxShadow: 'none' }}
              borderRadius="xl"
            />
            <HStack mt={4} spacing={3} wrap="wrap">
              {renderTags()}
            </HStack>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            width="full"
            isLoading={loading}
            loadingText="✨ Creating Magic..."
            borderRadius="xl"
            bgGradient="linear(to-r, blue.400, purple.500)"
            _hover={{
              bgGradient: 'linear(to-r, blue.500, purple.600)',
              transform: 'scale(1.02)',
            }}
            _active={{
              bgGradient: 'linear(to-r, blue.600, purple.700)',
            }}
            transition="all 0.2s"
          >
            {loading ? '✨ Creating Magic...' : '🚀 Create Post'}
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default PostUpload;