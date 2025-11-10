export type DemoUser = {
  name: string;
  handle: string;
  title: string;
  location: string;
  bio: string;
  avatarColor: string;
};

export type DemoThreadPost = {
  id: string;
  author: string;
  role: string;
  avatarColor: string;
  timestamp: string;
  body: string;
  sentiment?: "positive" | "neutral" | "warning";
};

export type DemoThread = {
  id: string;
  title: string;
  summary: string;
  author: string;
  authorRole: string;
  category: string;
  createdAt: string;
  replies: number;
  views: number;
  status: "approved" | "pending" | "flagged";
  tags: string[];
  sentiment: "celebration" | "insight" | "caution" | "growth";
  trending: boolean;
  posts: DemoThreadPost[];
};

export type DemoNotification = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "mention" | "moderation" | "system" | "insight";
  isNew?: boolean;
};

export type DemoModerationItem = {
  id: string;
  author: string;
  excerpt: string;
  flaggedAt: string;
  reason: string;
  status: "pending" | "actioned";
  confidence: number;
};

export type DemoSecurityEvent = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  detectedAt: string;
  description: string;
  status: "investigating" | "resolved" | "monitoring";
};

export type DemoTeamMember = {
  id: string;
  name: string;
  role: string;
  region: string;
  status: "active" | "away" | "offline";
  contributions: number;
};

export const demoUser: DemoUser = {
  name: "Amina Rahman",
  handle: "amina",
  title: "Community Experience Lead",
  location: "Dhaka, Bangladesh",
  bio: "Designing conversations that feel safe, warm, and culturally aware. Passionate about second-language communities and storytelling.",
  avatarColor: "from-sky-500 to-blue-600",
};

export const demoThreads: DemoThread[] = [
  {
    id: "onboarding-celebrations",
    title: "Celebrating 200 successful onboardings this month 🎉",
    summary:
      "Sharing highlights from our redesigned onboarding journey and what helped teams feel supported in their first 30 days.",
    author: "Amina Rahman",
    authorRole: "Community Lead",
    category: "Wins",
    createdAt: "2 hours ago",
    replies: 28,
    views: 486,
    status: "approved",
    tags: ["onboarding", "community", "growth"],
    sentiment: "celebration",
    trending: true,
    posts: [
      {
        id: "p1",
        author: "Amina Rahman",
        role: "Community Lead",
        avatarColor: "from-sky-500 to-blue-600",
        timestamp: "Today • 09:45 AM",
        body: "We've crossed 200 onboardings this month with an 89% satisfaction score. Huge gratitude to everyone sharing cultural onboarding stories—we used 14 of them directly in the new starter kit.",
        sentiment: "positive",
      },
      {
        id: "p2",
        author: "Farhan Chowdhury",
        role: "Moderator",
        avatarColor: "from-purple-500 to-indigo-600",
        timestamp: "Today • 10:02 AM",
        body: "Love seeing the real stories woven into the walkthrough. The voice notes in Bangla made a massive difference—new members have mentioned feeling more seen.",
      },
      {
        id: "p3",
        author: "Nabila Karim",
        role: "CX Strategist",
        avatarColor: "from-emerald-500 to-teal-600",
        timestamp: "Today • 10:24 AM",
        body: "Started pairing mentors with the reflection prompts this week. Early signal: 3 folks mentioned feeling confident enough to lead their first discussions after day 5.",
      },
    ],
  },
  {
    id: "moderation-playbook",
    title: "Drafting the new nuance-first moderation playbook",
    summary:
      "Working session exploring how we guide AI + human moderators to balance empathy with firm boundaries across cultures.",
    author: "Imran Hossain",
    authorRole: "Safety Team",
    category: "Moderation",
    createdAt: "5 hours ago",
    replies: 17,
    views: 372,
    status: "pending",
    tags: ["moderation", "policy", "ai"],
    sentiment: "insight",
    trending: true,
    posts: [
      {
        id: "p1",
        author: "Imran Hossain",
        role: "Safety Team",
        avatarColor: "from-amber-500 to-orange-600",
        timestamp: "Today • 06:15 AM",
        body: "Draft v2 includes a 'pause & reflect' prompt before escalations. Looking for stories where tone or cultural nuance shifted the response path—we want the playbook to encourage those checks.",
      },
      {
        id: "p2",
        author: "Sadia Nawar",
        role: "Elder Moderator",
        avatarColor: "from-rose-500 to-pink-600",
        timestamp: "Today • 08:03 AM",
        body: "Flagging threads where empathy is needed with an amber badge has helped. Maybe AI can suggest that badge when sentiment analysis spots delicate language?",
        sentiment: "positive",
      },
    ],
  },
  {
    id: "empathy-lab-program",
    title: "Launching the empathy lab facilitator program",
    summary:
      "Piloting facilitator coaching circles to keep human warmth high even as conversations scale across timezones.",
    author: "Sadia Nawar",
    authorRole: "Elder Moderator",
    category: "Programs",
    createdAt: "1 day ago",
    replies: 34,
    views: 618,
    status: "approved",
    tags: ["empathy", "facilitators", "training"],
    sentiment: "growth",
    trending: false,
    posts: [
      {
        id: "p1",
        author: "Sadia Nawar",
        role: "Elder Moderator",
        avatarColor: "from-rose-500 to-pink-600",
        timestamp: "Yesterday • 04:42 PM",
        body: "We paired facilitators in triads with weekly reflective prompts. Early insight: when they record low-fi audio reflections, retention of nuance increases by 22%.",
      },
      {
        id: "p2",
        author: "Imran Hossain",
        role: "Safety Team",
        avatarColor: "from-amber-500 to-orange-600",
        timestamp: "Yesterday • 05:15 PM",
        body: "Appreciate the checklist for difficult conversations. Might we include a quick escalation hotline for facilitators working late hours?",
      },
    ],
  },
  {
    id: "language-room-updates",
    title: "Language room updates: what's resonating this week",
    summary:
      "Quick pulse on language room experiments—especially the Bangla + English paired sessions and how people react.",
    author: "Farhan Chowdhury",
    authorRole: "Moderator",
    category: "Experiments",
    createdAt: "2 days ago",
    replies: 21,
    views: 295,
    status: "approved",
    tags: ["language", "community", "experiments"],
    sentiment: "insight",
    trending: false,
    posts: [
      {
        id: "p1",
        author: "Farhan Chowdhury",
        role: "Moderator",
        avatarColor: "from-purple-500 to-indigo-600",
        timestamp: "2 days ago • 11:08 AM",
        body: "Paired sessions where we rotate storytellers every 7 minutes are doing well. Folks say the AI note-taker catches the 'in-between' translations nicely.",
      },
      {
        id: "p2",
        author: "Taslima Noor",
        role: "Community Host",
        avatarColor: "from-fuchsia-500 to-purple-600",
        timestamp: "2 days ago • 01:36 PM",
        body: "Would love to highlight a few of these stories in the newsletter. Signal-to-noise is high, so we can curate 3 per week easily.",
      },
    ],
  },
];

export const demoNotifications: DemoNotification[] = [
  {
    id: "n1",
    title: "Nabila mentioned you in “Celebrating onboardings”",
    description: "“Can you share the story about the Chittagong onboarding circle? It resonated with mentors.”",
    timestamp: "5m ago",
    type: "mention",
    isNew: true,
  },
  {
    id: "n2",
    title: "Moderation queue needs review",
    description: "2 threads flagged for tone check after late-night escalation. Confidence medium.",
    timestamp: "18m ago",
    type: "moderation",
    isNew: true,
  },
  {
    id: "n3",
    title: "Weekly warmth index available",
    description: "Engagement up 12%. Sentiment steady with 3 conversations highlighted for celebration.",
    timestamp: "1h ago",
    type: "insight",
  },
  {
    id: "n4",
    title: "System update – empathy prompts refreshed",
    description: "Playbook prompts now adapt tone per language room. No action needed.",
    timestamp: "3h ago",
    type: "system",
  },
];

export const demoModerationQueue: DemoModerationItem[] = [
  {
    id: "mq-1",
    author: "Lucas P.",
    excerpt: "“I don’t think their experience really matters in this project...”",
    flaggedAt: "Just now",
    reason: "Dismissive tone flagged by AI",
    status: "pending",
    confidence: 0.78,
  },
  {
    id: "mq-2",
    author: "Sara K.",
    excerpt: "“We revisited the conversation and it feels so much lighter now.”",
    flaggedAt: "12m ago",
    reason: "AI suggested highlight",
    status: "actioned",
    confidence: 0.92,
  },
  {
    id: "mq-3",
    author: "Imran H.",
    excerpt: "“Sharing a quick story about why tone breaks trust.”",
    flaggedAt: "29m ago",
    reason: "Awaiting context approval",
    status: "pending",
    confidence: 0.64,
  },
];

export const demoSecurityEvents: DemoSecurityEvent[] = [
  {
    id: "se-1",
    title: "New login from Singapore workspace",
    severity: "medium",
    detectedAt: "14m ago",
    description: "2FA passed but first login from device. Monitoring session for unusual activity.",
    status: "monitoring",
  },
  {
    id: "se-2",
    title: "API token rotation completed",
    severity: "low",
    detectedAt: "3h ago",
    description: "Service tokens for moderation assistant rotated successfully.",
    status: "resolved",
  },
  {
    id: "se-3",
    title: "Multiple password attempts blocked",
    severity: "high",
    detectedAt: "6h ago",
    description: "5 attempts from Lagos workspace. Account temporarily locked and user contacted.",
    status: "investigating",
  },
];

export const demoTeamMembers: DemoTeamMember[] = [
  {
    id: "tm-1",
    name: "Farhan Chowdhury",
    role: "Moderator",
    region: "Dhaka · GMT+6",
    status: "active",
    contributions: 148,
  },
  {
    id: "tm-2",
    name: "Taslima Noor",
    role: "Community Host",
    region: "Chittagong · GMT+6",
    status: "away",
    contributions: 92,
  },
  {
    id: "tm-3",
    name: "Imran Hossain",
    role: "Safety Analyst",
    region: "Singapore · GMT+8",
    status: "active",
    contributions: 211,
  },
  {
    id: "tm-4",
    name: "Sadia Nawar",
    role: "Elder Moderator",
    region: "Sylhet · GMT+6",
    status: "offline",
    contributions: 305,
  },
];


