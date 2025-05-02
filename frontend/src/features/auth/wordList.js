let wordList = null;

const fetchWordList = async () => {
  if (wordList) return wordList;
  
  try {
    const response = await fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words.txt');
    const text = await response.text();
    wordList = text
      .split('\n')
      .filter(word => 
        word.length >= 4 && 
        word.length <= 8 && 
        /^[a-zA-Z]+$/.test(word)
      );
    return wordList;
  } catch (error) {
    console.error('Error fetching word list:', error);
    return [
      "apple", "beach", "cloud", "dance", "earth", "field", "glass", "house",
    ];
  }
};

const generateSeedPhrase = async () => {
  const words = await fetchWordList();
  const seedPhrase = [];
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    seedPhrase.push(words[randomIndex]);
  }

  return seedPhrase.join(" ");
};

export { generateSeedPhrase };