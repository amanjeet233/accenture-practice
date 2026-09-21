import { NextResponse } from "next/server";

// Streaming response utility for faster initial responses
export function createStreamResponse<T>(data: T, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Transfer-Encoding": "chunked",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}

// Progressive streaming for large datasets
export async function* streamData<T>(items: T[], chunkSize = 10) {
  for (let i = 0; i < items.length; i += chunkSize) {
    yield items.slice(i, i + chunkSize);
    // Small delay to prevent overwhelming the client
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}