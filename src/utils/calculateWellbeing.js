export default function calculateWellbeing(history = []) {

  if (!history.length) return 100;

  const total = history.reduce((sum, emotion) => {
    return sum + emotion.score;
  }, 0);

  return Math.round(total / history.length);
}