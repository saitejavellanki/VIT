import React, { useState } from 'react';
import { Box, Flex, Text, Input, InputGroup, InputLeftElement, Heading, Wrap, WrapItem, Tag } from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

export const SearchAndTags = ({ popularTags, onSearchChange, onTagSelect, selectedTag }) => {
  const [showAllTags, setShowAllTags] = useState(false);
  const displayedTags = showAllTags ? popularTags : popularTags.slice(0, 20);

  return (
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
          onChange={(e) => onSearchChange(e.target.value)}
          size={{ base: "md", md: "lg" }}
        />
      </InputGroup>

      {popularTags.length > 0 && (
        <Box>
          <Flex align="center" justifyContent="space-between" mb={3}>
            <Heading size={{ base: "xs", md: "sm" }} color="gray.300">
              Popular Tags
            </Heading>
            {popularTags.length > 20 && (
              <Text
                color="blue.400"
                fontSize="sm"
                cursor="pointer"
                onClick={() => setShowAllTags(!showAllTags)}
                _hover={{ textDecoration: 'underline' }}
              >
                {showAllTags ? 'Show Less' : `Show All (${popularTags.length})`}
              </Text>
            )}
          </Flex>

          <Wrap spacing={{ base: 1, md: 2 }} justify="flex-start">
            {displayedTags.map(({ tag, likes }) => (
              <WrapItem key={tag}>
                <Tag
                  size={{ base: "sm", md: "md" }}
                  bg={selectedTag === tag ? 'blue.600' : 'blue.900'}
                  color="blue.200"
                  borderRadius="full"
                  px={3}
                  py={1}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ 
                    bg: 'blue.800',
                    transform: 'translateY(-2px)'
                  }}
                  onClick={() => onTagSelect(tag)}
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
};