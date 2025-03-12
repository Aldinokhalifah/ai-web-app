export const formatText = (text: string): string => {
    return text
      .replace(/\n\n+/g, '\n\n') // Replace multiple newlines with double newline
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing whitespace
};