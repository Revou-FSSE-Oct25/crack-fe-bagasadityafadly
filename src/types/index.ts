export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Booking {
  id: string;
  type: 'GYM' | 'CLASS' | 'PT';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  bookingDate: string;
  notes: string | null;
  googleEventId: string | null;
  createdAt: string;
  schedule?: {
    id: string;
    startTime: string;
    endTime: string;
    roomOrZone: string | null;
    class: { name: string; durationMinutes: number; capacity: number };
    trainer: { name: string } | null;
  };
  trainer?: { id: string; name: string } | null;
}

export interface GymClass {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  capacity: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  caloriesEstimate: number | null;
  isActive: boolean;
}

export interface UserXp {
  xpTotal: number;
  level: number;
  streakCount: number;
  bronzeBorderUnlocked: boolean;
  canApplyAsPT: boolean;
  history: Array<{
    source: string;
    amount: number;
    description: string | null;
    createdAt: string;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  xpTotal: number;
  level: number;
  avatarUrl: string | null;
  streakCount: number;
}

export interface Recommendation {
  hasAssessment: boolean;
  classes: Array<{
    classId: string;
    name: string;
    difficulty: string;
    durationMinutes: number;
    score: number;
    reason: string;
  }>;
  recovery: {
    advice: string;
    checkInsLast7Days: number;
  };
  challenge: {
    id: string;
    name: string;
    description: string | null;
    xpReward: number;
    target: number;
  } | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  xpReward: number;
}

export interface UserBadge {
  id: string;
  earnedAt: string;
  badge: Pick<Badge, 'name' | 'description' | 'iconUrl' | 'xpReward'>;
}
