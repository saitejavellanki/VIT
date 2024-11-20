import React from 'react';
import { Text } from '@chakra-ui/react';

export const GenderSymbol = ({ gender }) => {
  if (!gender) return null;
  
  const symbols = {
    male: { symbol: "♂", color: "blue.400" },
    female: { symbol: "♀", color: "pink.400" },
    other: { symbol: "⚥", color: "purple.400" },
    "prefer-not-to-say": { symbol: "•", color: "gray.400" }
  };

  const symbolData = symbols[gender] || symbols["prefer-not-to-say"];

  return (
    <Text
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
