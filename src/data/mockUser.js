const mockUser = {
  profile: {
    name: "Carlos",
    age: 20,
    avatar: "💜",
  },
  wellbeing: 87,
  currentMood: "Feliz",
  streak: 12,
  weeklyGoal: 6,
  totalGoal: 7,
  emotions: [
    "😊",
    "😊",
    "😐",
    "😊",
    "😔",
    "😊",
    "😊",
  ],
  aiStatus: "Estable",
  notes: [
    {
      mood: "Feliz",
      text: "Me siento bien y con energía para el día.",
      timestamp: new Date().toISOString(),
    },
  ],
};

export default mockUser;
