# AI Agent Response Rules

## Response Style
- Keep responses extremely concise.
- Do not explain every step unless explicitly asked.
- Perform the requested task directly.
- Do not repeat the user's requirements.
- Do not provide unnecessary summaries.
- Avoid long reasoning or progress explanations.

## After Completing a Task
Report only:
1. Files changed
2. Key changes made
3. Tests/build commands run
4. Remaining errors, if any

If the task is completed successfully, keep the final response under 10 lines.

## Coding Behavior
- Inspect the relevant files before modifying them.
- Make the required changes directly.
- Preserve existing functionality.
- Do not modify unrelated files.
- Run appropriate tests/build/lint checks after changes.
- Fix errors caused by your changes before reporting completion.