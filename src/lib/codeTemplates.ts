/**
 * Language-specific code template generator for DSA questions.
 * Produces idiomatic starter code for Java, C++, Python, JavaScript, and SQL.
 */

export interface QuestionContext {
  id?: string;
  slug?: string;
  title: string;
  inputFormat?: string | null;
  outputFormat?: string | null;
  questionType?: string;
  starterCode?: Record<string, string> | null;
}

export function generateStarterCode(
  question: QuestionContext,
  language: string
): string {
  const lang = (language || "java").toLowerCase();
  let starterMap: Record<string, string> | null = null;
  if (typeof question.starterCode === "string") {
    try {
      starterMap = JSON.parse(question.starterCode);
    } catch {
      starterMap = null;
    }
  } else if (question.starterCode && typeof question.starterCode === "object") {
    starterMap = question.starterCode;
  }

  // If question already has specific starter code for this language, use it
  if (starterMap && starterMap[lang]) {
    return starterMap[lang];
  }

  // Derive function name from slug or title
  const rawName = (question.slug || question.title)
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map((word, idx) =>
      idx === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");

  const fnName = rawName || "solution";

  switch (lang) {
    case "javascript":
    case "js":
      return `/**
 * Problem: ${question.title}
 * @param {any} input
 * @return {any}
 */
function ${fnName}(input) {
  // Write your code here
  
}
`;

    case "python":
    case "py":
    case "python3":
      return `class Solution:
    """
    Problem: ${question.title}
    """
    def solve(self, input_data):
        # Write your code here
        pass

# Standalone function invocation
def ${fnName}(input_data):
    # Write your code here
    pass
`;

    case "java":
      return `import java.util.*;
import java.io.*;

public class Solution {
    /**
     * Problem: ${question.title}
     */
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Read input from standard input
        if (sc.hasNext()) {
            String input = sc.nextLine();
            // Implement solution logic
            System.out.println(solve(input));
        }
    }

    public static Object solve(String input) {
        // Write your solution here
        return null;
    }
}
`;

    case "cpp":
    case "c++":
      return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <sstream>

using namespace std;

/**
 * Problem: ${question.title}
 */
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string input;
    if (getline(cin, input)) {
        // Write your solution here
        
    }

    return 0;
}
`;

    case "sql":
      return `-- Problem: ${question.title}
-- Write your PostgreSQL / SQLite query below
SELECT 
`;

    default:
      return `// Solution for ${question.title}\n`;
  }
}
