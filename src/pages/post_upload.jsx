import React, { useState, useEffect } from 'react';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  AlertIcon,
  Alert,
} from '@chakra-ui/react';
import { collection, addDoc, doc, getDoc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  // State management
  const [formData, setFormData] = useState({
    gender: '',
    text: '',
    tags: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [customUsername, setCustomUsername] = useState('');
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const toast = useToast();

  // Theme colors
  const bgColor = useColorModeValue('gray.800', 'gray.900');
  const cardBg = useColorModeValue('gray.700', 'gray.800');
  const inputBg = useColorModeValue('gray.600', 'gray.700');
  const textColor = useColorModeValue('white', 'gray.100');
  const borderColor = useColorModeValue('blue.400', 'blue.500');

  // Check for existing username on component mount
  useEffect(() => {
    checkExistingUsername();
  }, []);

  const checkExistingUsername = async () => {
    if (!auth.currentUser) return;

    try {
      const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
      if (!userDoc.exists() || !userDoc.data().customUsername) {
        setIsUsernameModalOpen(true);
      } else {
        setCustomUsername(userDoc.data().customUsername);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      toast({
        title: 'Error checking username',
        description: 'Please try refreshing the page',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const validateUsername = (username) => {
    if (username.length < 3) return 'Username must be at least 3 characters long';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    return '';
  };

  const checkUsernameAvailability = async (username) => {
    const usernamesRef = collection(firestore, 'usernames');
    const q = query(usernamesRef, where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  const handleUsernameSubmit = async () => {
    const validationError = validateUsername(customUsername);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError('');

    try {
      const isAvailable = await checkUsernameAvailability(customUsername);
      if (!isAvailable) {
        setUsernameError('This username is already taken');
        return;
      }

      // Save username in users collection
      await setDoc(doc(firestore, 'users', auth.currentUser.uid), {
        customUsername: customUsername.toLowerCase(),
        email: auth.currentUser.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Save in usernames collection for uniqueness check
      await setDoc(doc(firestore, 'usernames', customUsername.toLowerCase()), {
        uid: auth.currentUser.uid,
        username: customUsername.toLowerCase(),
        createdAt: new Date(),
      });

      setIsUsernameModalOpen(false);
      toast({
        title: 'Welcome aboard! 🎉',
        description: `Your username @${customUsername} has been set successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      setUsernameError('Error setting username. Please try again.');
      console.error('Error setting username:', error);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customUsername) {
      setIsUsernameModalOpen(true);
      return;
    }
    
    setLoading(true);

    try {
      let imageUrl = '';
      if (formData.image) {
        const storage = getStorage();
        const storageRef = ref(storage, `post-images/${Date.now()}-${formData.image.name}`);
        await uploadBytes(storageRef, formData.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      const postData = {
        username: customUsername,
        gender: formData.gender,
        text: formData.text,
        tags: formData.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag),
        imageUrl,
        createdAt: new Date(),
        userId: auth.currentUser.uid,
        likes: [],
        updatedAt: new Date(),
      };

      const postsCollectionRef = collection(firestore, 'posts');
      await addDoc(postsCollectionRef, postData);

      setFormData({
        gender: '',
        text: '',
        tags: '',
        image: null,
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
    const tags = formData.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
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
          },
        }}
      >
        #{tag}
      </Tag>
    ));
  };

  return (
    <>
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

            {customUsername && (
              <Alert status="success" borderRadius="lg">
                <AlertIcon />
                Posting as @{customUsername}
              </Alert>
            )}

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

            <FormControl>
              <FormLabel color={textColor}>📷 Upload Image</FormLabel>
              <Input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
                bg={inputBg}
                color={textColor}
                borderColor={borderColor}
                _hover={{ borderColor: 'blue.300' }}
                _focus={{ borderColor: 'blue.300', boxShadow: 'none' }}
                borderRadius="xl"
              />
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
              textTransform="uppercase"
            >
              ✨ Create Post
            </Button>
          </VStack>
        </Box>
      </Container>

      <Modal 
        isOpen={isUsernameModalOpen} 
        onClose={() => {}}
        closeOnOverlayClick={false}
        isCentered
      >
        <ModalOverlay />
        <ModalContent bg={cardBg} color={textColor}>
          <ModalHeader>Choose Your Username</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <Text>Pick a unique username that will identify you in the community</Text>
              <FormControl isInvalid={!!usernameError}>
                <Input
                  placeholder="Enter your desired username"
                  value={customUsername}
                  onChange={(e) => {
                    setCustomUsername(e.target.value);
                    setUsernameError('');
                  }}
                  bg={inputBg}
                  borderColor={borderColor}
                />
                {usernameError && (
                  <Text color="red.300" fontSize="sm" mt={2}>
                    {usernameError}
                  </Text>
                )}
                <Text fontSize="sm" color="gray.400" mt={2}>
                  Username must be 3-20 characters long and can only contain letters, numbers, and underscores.
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={handleUsernameSubmit}
              isLoading={isCheckingUsername}
              width="full"
              bgGradient="linear(to-r, blue.400, purple.500)"
              _hover={{
                bgGradient: 'linear(to-r, blue.500, purple.600)',
              }}
            >
              Set Username
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PostUpload;