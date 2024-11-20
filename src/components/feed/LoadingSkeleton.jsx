import React from 'react';
import { Box, Grid, GridItem, Flex, Skeleton } from '@chakra-ui/react';

export const LoadingSkeleton = () => (
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
        <Skeleton startColor="gray.800" endColor="gray.700" h="120px" mb={6} />
        <Skeleton startColor="gray.800" endColor="gray.700" h={{ base: "200px", md: "300px" }} borderRadius="xl" mb={6} />
        <Skeleton startColor="gray.800" endColor="gray.700" h="40px" />
      </GridItem>
    </Grid>
  </Box>
);