import { prisma } from "../src/lib/prisma";
import {
  CANONICAL_TOPICS,
  CANONICAL_TOPIC_LIST,
  resolveCanonicalTopic,
  getTopicPrismaFilter,
} from "../src/lib/canonicalTopics";
import { GET } from "../src/app/api/accenture/mcqs/route";
import { NextRequest } from "next/server";

async function runTopicIntegrityTests() {
  console.log("===============================================================");
  console.log("ACCENTURE MCQ TOPIC SEPARATION & INTEGRITY VERIFICATION");
  console.log("===============================================================\n");

  let allPassed = true;
  const topicCounts: Record<string, number> = {};

  // 1. Direct API tests for every canonical topic
  console.log("--- 1. Testing Every Canonical Topic via GET /api/accenture/mcqs ---");

  for (const topic of CANONICAL_TOPIC_LIST) {
    const url = `http://localhost:3000/api/accenture/mcqs?topic=${topic.slug}&limit=100`;
    const req = new NextRequest(url);
    const res = await GET(req);

    if (res.status !== 200) {
      console.error(`❌ FAILED for topic ${topic.id} (${topic.slug}): HTTP Status ${res.status}`);
      allPassed = false;
      continue;
    }

    const data = await res.json();
    topicCounts[topic.id] = data.total;

    console.log(`✓ Topic: ${topic.id.padEnd(22)} | DB Count: ${String(data.total).padStart(4)} | Returned: ${data.questions.length}`);

    // Verify all returned questions belong strictly to this canonical topic
    for (const q of data.questions) {
      const qCanonical = resolveCanonicalTopic(q.category);
      if (!qCanonical || qCanonical.id !== topic.id) {
        console.error(
          `❌ LEAK DETECTED in topic ${topic.id}: Question '${q.title}' has category '${q.category}' which resolved to '${qCanonical?.id}'!`
        );
        allPassed = false;
      }
    }
  }

  // 2. Cross-Topic Leakage Assertions
  console.log("\n--- 2. Testing Cross-Topic Strict Isolation ---");

  async function getQuestionsForTopic(topicSlug: string) {
    const req = new NextRequest(`http://localhost:3000/api/accenture/mcqs?topic=${topicSlug}&limit=100`);
    const res = await GET(req);
    const data = await res.json();
    return data.questions;
  }

  const netQuestions = await getQuestionsForTopic("networking");
  const cloudQuestions = await getQuestionsForTopic("cloud");
  const cyberQuestions = await getQuestionsForTopic("cybersecurity");
  const msOfficeQuestions = await getQuestionsForTopic("ms-office");

  // NETWORKING response must contain 0 CLOUD questions
  const netCloudLeak = netQuestions.filter((q: any) =>
    CANONICAL_TOPICS.CLOUD.dbCategories.some((c) => c.toLowerCase() === q.category?.toLowerCase())
  );
  if (netCloudLeak.length === 0) {
    console.log("✓ PASS: NETWORKING response contains 0 CLOUD questions.");
  } else {
    console.error(`❌ FAIL: NETWORKING response contains ${netCloudLeak.length} CLOUD questions!`);
    allPassed = false;
  }

  // CLOUD response must contain 0 NETWORKING questions
  const cloudNetLeak = cloudQuestions.filter((q: any) =>
    CANONICAL_TOPICS.NETWORKING.dbCategories.some((c) => c.toLowerCase() === q.category?.toLowerCase())
  );
  if (cloudNetLeak.length === 0) {
    console.log("✓ PASS: CLOUD response contains 0 NETWORKING questions.");
  } else {
    console.error(`❌ FAIL: CLOUD response contains ${cloudNetLeak.length} NETWORKING questions!`);
    allPassed = false;
  }

  // CYBERSECURITY response must contain 0 MS_OFFICE questions
  const cyberOfficeLeak = cyberQuestions.filter((q: any) =>
    CANONICAL_TOPICS.MS_OFFICE.dbCategories.some((c) => c.toLowerCase() === q.category?.toLowerCase())
  );
  if (cyberOfficeLeak.length === 0) {
    console.log("✓ PASS: CYBERSECURITY response contains 0 MS_OFFICE questions.");
  } else {
    console.error(`❌ FAIL: CYBERSECURITY response contains ${cyberOfficeLeak.length} MS_OFFICE questions!`);
    allPassed = false;
  }

  // 3. Testing Invalid / Missing Topic Handling (Must Return 400 and NEVER fall back to all questions)
  console.log("\n--- 3. Testing Invalid / Missing Topic Handling ---");

  const invalidReq = new NextRequest("http://localhost:3000/api/accenture/mcqs?topic=ABC_INVALID_TOPIC");
  const invalidRes = await GET(invalidReq);
  if (invalidRes.status === 400) {
    const errData = await invalidRes.json();
    console.log(`✓ PASS: Invalid topic returned controlled HTTP 400: "${errData.error}"`);
  } else {
    console.error(`❌ FAIL: Invalid topic returned HTTP ${invalidRes.status} instead of 400!`);
    allPassed = false;
  }

  const missingReq = new NextRequest("http://localhost:3000/api/accenture/mcqs");
  const missingRes = await GET(missingReq);
  if (missingRes.status === 400) {
    const errData = await missingRes.json();
    console.log(`✓ PASS: Missing topic returned controlled HTTP 400: "${errData.error}"`);
  } else {
    console.error(`❌ FAIL: Missing topic returned HTTP ${missingRes.status} instead of 400!`);
    allPassed = false;
  }

  // 4. Testing Search within Topic
  console.log("\n--- 4. Testing Search within Topic ---");

  const searchReq = new NextRequest("http://localhost:3000/api/accenture/mcqs?topic=networking&q=TCP");
  const searchRes = await GET(searchReq);
  const searchData = await searchRes.json();
  console.log(`✓ Networking search for 'TCP' returned ${searchData.total} questions (all Networking).`);

  for (const q of searchData.questions) {
    const qCanonical = resolveCanonicalTopic(q.category);
    if (qCanonical?.id !== "NETWORKING") {
      console.error(`❌ FAIL: Non-networking question leaked into networking search: ${q.title}`);
      allPassed = false;
    }
  }

  // 5. Pagination Test within Topic
  console.log("\n--- 5. Testing Pagination within Topic ---");
  const page1Req = new NextRequest("http://localhost:3000/api/accenture/mcqs?topic=networking&page=1&limit=10");
  const page2Req = new NextRequest("http://localhost:3000/api/accenture/mcqs?topic=networking&page=2&limit=10");
  const p1 = await (await GET(page1Req)).json();
  const p2 = await (await GET(page2Req)).json();

  if (p1.questions.length === 10 && p2.questions.length === 10) {
    const p1Ids = new Set(p1.questions.map((q: any) => q.id));
    const overlap = p2.questions.filter((q: any) => p1Ids.has(q.id));
    if (overlap.length === 0) {
      console.log("✓ PASS: Pagination correctly isolates pages without duplicate overlap.");
    } else {
      console.error(`❌ FAIL: Pagination had ${overlap.length} overlapping questions across pages.`);
      allPassed = false;
    }
  }

  console.log("\n===============================================================");
  console.log("TOPIC-WISE COUNTS FROM REAL DATABASE:");
  for (const [top, cnt] of Object.entries(topicCounts)) {
    console.log(`- ${top.padEnd(22)}: ${cnt}`);
  }
  console.log("===============================================================");

  if (allPassed) {
    console.log("\n🎉 ALL TOPIC SEPARATION AND INTEGRITY TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } else {
    console.error("\n💥 SOME TESTS FAILED! CHECK OUTPUT ABOVE.");
    process.exit(1);
  }
}

runTopicIntegrityTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
