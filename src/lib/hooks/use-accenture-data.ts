"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API types
interface McqQuestion {
  id: string;
  title: string;
  description: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: string;
}

interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Custom hooks for instant data fetching
export function useAccentureMcqs(category?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ["accenture-mcqs", category, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (category) params.append("category", category);
      
      const response = await fetch(`/api/accenture/mcqs?${params}`);
      if (!response.ok) throw new Error("Failed to fetch MCQs");
      return response.json() as Promise<PaginatedResponse<McqQuestion>>;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAccentureModules() {
  return useQuery({
    queryKey: ["accenture-modules"],
    queryFn: async () => {
      const response = await fetch("/api/accenture/modules");
      if (!response.ok) throw new Error("Failed to fetch modules");
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - modules rarely change
  });
}

export function useAccentureAnalytics(userId?: string) {
  return useQuery({
    queryKey: ["accenture-analytics", userId],
    queryFn: async () => {
      const params = userId ? `?userId=${userId}` : "";
      const response = await fetch(`/api/accenture/analytics${params}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds - analytics change frequently
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
}

// Mutation hooks for data updates
export function useSubmitAnswer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
      const response = await fetch("/api/accenture/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, answer }),
      });
      if (!response.ok) throw new Error("Failed to submit answer");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["accenture-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["accenture-progress"] });
    },
  });
}

export function useStartTest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (testConfig: any) => {
      const response = await fetch("/api/accenture/test/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testConfig),
      });
      if (!response.ok) throw new Error("Failed to start test");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accenture-analytics"] });
    },
  });
}