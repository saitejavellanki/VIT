import React, { useState } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Avatar, 
  IconButton, 
  Image, 
  Tag, 
  Skeleton,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Textarea,
  VStack,
  useToast,
  Input
} from '@chakra-ui/react';
import { FiHeart, FiMessageCircle, FiRepeat, FiShare, FiSend } from 'react-icons/fi';
import { auth, firestore} from '../../firebase/firebase';
import { GenderSymbol } from './GenderSymbol';
import { formatTimestamp } from '../../utils/dateUtils';
import { addDoc, collection, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import Comment from '../Comment/Comment';

export const PostCard = ({ post, onLike }) => {
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [quickReplyText, setQuickReplyText] = useState(''); // New state for quick reply
  const [comments, setComments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const toast = useToast();
  
  const currentUser = auth.currentUser;
  const isLiked = post.likes?.includes(currentUser?.uid);

  // Subscribe to comments
  React.useEffect(() => {
    const commentsRef = collection(firestore, 'comments');
    const q = query(
      commentsRef,
      where('postId', '==', post.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [post.id]);

  const handleReplyClick = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to reply to posts",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsReplyModalOpen(true);
  };

  const handleCommentIconClick = (e) => {
    e.stopPropagation();
    setShowComments(!showComments);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to like posts",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onLike(post.id);
  };

  // New function to handle quick reply submission
  const handleQuickReply = async (e) => {
    e.preventDefault();
    if (!quickReplyText.trim()) return;
    
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to comment",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const commentData = {
        comment: quickReplyText,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        postId: post.id,
      };

      await addDoc(collection(firestore, 'comments'), commentData);
      setQuickReplyText('');
      setShowComments(true); // Show comments after posting
      toast({
        title: "Reply posted",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to comment",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const commentData = {
        comment: replyText,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        postId: post.id,
      };

      await addDoc(collection(firestore, 'comments'), commentData);
      setReplyText('');
      setIsReplyModalOpen(false);
      toast({
        title: "Comment added",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Box 
        borderBottom="1px"
        borderColor="whiteAlpha.200"
        bg="black"
        color="white"
        _hover={{ bg: 'rgba(255, 255, 255, 0.03)' }}
        transition="background 0.2s"
        cursor="pointer"
      >
        <Flex p={4}>
          <Avatar 
            size="md" 
            name={post.name} 
            src={post.avatarUrl} 
            mr={3}
          />

          <Box flex="1">
            <Flex align="center" gap={2} mb={1}>
              <Text fontWeight="bold" fontSize="15px">
                {post.name}
              </Text>
              {post.gender && <GenderSymbol gender={post.gender} />}
              <Text fontSize="15px" color="gray.500">
                @{post.username || post.name.toLowerCase().replace(/\s/g, '')}
              </Text>
              <Text fontSize="15px" color="gray.500">
                · {formatTimestamp(post.createdAt)}
              </Text>
            </Flex>

            {post.text && (
              <Text fontSize="15px" mb={2} wordBreak="break-word">
                {post.text}
              </Text>
            )}

            {post.imageUrl && (
              <Box 
                borderRadius="16px" 
                overflow="hidden" 
                mb={3}
                borderWidth="1px"
                borderColor="whiteAlpha.200"
              >
                <Image
                  src={post.imageUrl}
                  alt="Post content"
                  width="100%"
                  fallback={<Skeleton height="200px" />}
                />
              </Box>
            )}

            {post.tags && post.tags.length > 0 && (
              <Flex gap={2} mb={3} flexWrap="wrap">
                {post.tags.map((tag, index) => (
                  <Text
                    key={index}
                    color="blue.400"
                    fontSize="15px"
                  >
                    #{tag}
                  </Text>
                ))}
              </Flex>
            )}

            {/* Quick Reply Section */}
            <Flex mb={4} align="center" gap={2}>
              <Avatar size="sm" src={currentUser?.photoURL} />
              <form onSubmit={handleQuickReply} style={{ width: '100%' }}>
                <Flex gap={2} width="100%">
                  <Input
                    value={quickReplyText}
                    onChange={(e) => setQuickReplyText(e.target.value)}
                    placeholder="Write a reply ( your reply will be anonymous)"
                    size="sm"
                    bg="whiteAlpha.50"
                    border="none"
                    _focus={{
                      border: 'none',
                      bg: 'whiteAlpha.100'
                    }}
                  />
                  <IconButton
                    type="submit"
                    icon={<FiSend />}
                    size="sm"
                    colorScheme="twitter"
                    isLoading={isSubmitting}
                    isDisabled={!quickReplyText.trim()}
                    aria-label="Send reply"
                  />
                </Flex>
              </form>
            </Flex>

            <Flex justify="space-between" maxW="425px">
              <Flex align="center" color="gray.500" _hover={{ color: "blue.400" }}>
                <IconButton
                  icon={<FiMessageCircle />}
                  variant="ghost"
                  color="inherit"
                  aria-label="Comment"
                  size="sm"
                  _hover={{ bg: 'rgba(29, 155, 240, 0.1)' }}
                  onClick={handleCommentIconClick}
                />
                <Text fontSize="13px" ml={1}>
                  {comments.length}
                </Text>
              </Flex>

              {/* <Flex align="center" color="gray.500" _hover={{ color: "green.400" }}>
                <IconButton
                  icon={<FiRepeat />}
                  variant="ghost"
                  color="inherit"
                  aria-label="Retweet"
                  size="sm"
                  _hover={{ bg: 'rgba(0, 186, 124, 0.1)' }}
                />
                <Text fontSize="13px" ml={1}>
                  {post.retweets?.length || 0}
                </Text>
              </Flex> */}

              <Flex align="center" color={isLiked ? "red.400" : "gray.500"} _hover={{ color: "red.400" }}>
                <IconButton
                  icon={<FiHeart fill={isLiked ? "currentColor" : "none"} />}
                  variant="ghost"
                  color="inherit"
                  aria-label="Like"
                  onClick={handleLikeClick}
                  size="sm"
                  _hover={{ bg: 'rgba(249, 24, 128, 0.1)' }}
                />
                <Text fontSize="13px" ml={1}>
                  {post.likes?.length || 0}
                </Text>
              </Flex>

              {/* <Flex align="center" color="gray.500" _hover={{ color: "blue.400" }}>
                <IconButton
                  icon={<FiShare />}
                  variant="ghost"
                  color="inherit"
                  aria-label="Share"
                  size="sm"
                  _hover={{ bg: 'rgba(29, 155, 240, 0.1)' }}
                />
              </Flex> */}
            </Flex>

            {showComments && comments.length > 0 && (
              <VStack mt={4} spacing={4} align="stretch">
                {comments.map((comment) => (
                  <Box 
                    key={comment.id} 
                    p={3} 
                    borderRadius="md" 
                    bg="whiteAlpha.50"
                  >
                    <Text fontSize="14px" color="gray.300">
                      Anonymous • {formatTimestamp(comment.createdAt)}
                    </Text>
                    <Text mt={2}>{comment.comment}</Text>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </Flex>
      </Box>

      <Modal isOpen={isReplyModalOpen} onClose={() => setIsReplyModalOpen(false)}>
        <ModalOverlay />
        <ModalContent bg="black" color="white">
          <ModalHeader>Reply to {post.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex gap={4}>
              <Avatar size="sm" src={post.avatarUrl} name={post.name} />
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Tweet your reply"
                border="none"
                _focus={{ border: 'none', boxShadow: 'none' }}
                resize="none"
                minH="100px"
              />
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="twitter"
              isLoading={isSubmitting}
              onClick={handleReply}
              isDisabled={!replyText.trim()}
            >
              Reply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PostCard;