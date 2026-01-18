// Test script to generate comment translation keys from actual API responses
const testComments = [
  "useEffect dependencies caught me so many times when I was learning React. Wish I had read this earlier!",
  "Custom hooks are a game-changer. They make components so much cleaner and more reusable.",
  "Great article! I've been struggling with JavaScript concepts and this really helps clarify things.",
  "The project-based approach really works. I built three projects following this guide and learned so much!",
  "Great architecture tips for scalable APIs.",
  "Will apply these patterns in my next project.",
  "Finally a clear introduction to ML for developers!",
  "Very helpful for getting started with machine learning."
];

function generateCommentKey(body) {
  return body.substring(0, 50).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+$/, '');
}

console.log('Comment Translation Keys:');
console.log('========================\n');

testComments.forEach(comment => {
  const key = generateCommentKey(comment);
  console.log(`Original: "${comment.substring(0, 60)}${comment.length > 60 ? '...' : ''}"`);
  console.log(`Key:      "${key}"`);
  console.log('');
});
