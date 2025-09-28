/**
 * Utility function for parsing markdown-style bold text (**text**)
 * @param text - The text containing **bold** markdown
 * @returns Parsed text segments with bold indicators
 */
export function parseMarkdownBold(text: string): Array<{ text: string; isBold: boolean }> {
  if (!text) return [{ text, isBold: false }];
  
  const parts: Array<{ text: string; isBold: boolean }> = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the bold part
    if (match.index > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, match.index),
        isBold: false
      });
    }
    
    // Add the bold part
    parts.push({
      text: match[1],
      isBold: true
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after the last bold part
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      isBold: false
    });
  }
  
  return parts.length > 0 ? parts : [{ text, isBold: false }];
}