"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

type Metric = { label: string; value: string; detail: string };
type Faq = { question: string; answer: string };

type HomePageData = {
  metrics: Metric[];
  faqs: Faq[];
};

const data: HomePageData = {
  metrics: [
    { label: "Warmth index", value: "84%", detail: "Avg conversation tone across all circles" },
    { label: "Turnaround", value: "1h 42m", detail: "Median moderation response time" },
    { label: "Stories amplified", value: "3.2k", detail: "Moments surfaced to leadership this quarter" },
  ],
  faqs: [
    {
      question: "How do we keep AI from sounding robotic?",
      answer:
        "Every prompt is tuned for empathy-first responses. Humans can override tone instantly, and cultural context is preserved through story archives.",
    },
    {
      question: "Do moderators lose control?",
      answer:
        "Never. AI spots signals; humans decide. The studio gives you approve, pause, or escalate controls with transparent rationale.",
    },
    {
      question: "Can we plug into our existing tools?",
      answer:
        "Yes. Webhooks and an upcoming REST SDK keep summaries, prompts, and status updates flowing into your current stack.",
    },
  ],
};

const HomePageContext = createContext<HomePageData>(data);

export function HomePageProvider({ children }: { children: ReactNode }) {
  return <HomePageContext.Provider value={data}>{children}</HomePageContext.Provider>;
}

export function useHomePageContext() {
  return useContext(HomePageContext);
}


