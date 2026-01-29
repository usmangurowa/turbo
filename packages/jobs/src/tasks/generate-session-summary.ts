export interface GenerateSessionSummaryPayload {
  sessionId: string;
  userId: string;
}

export const generateSessionSummaryTask = {
  id: "generate-session-summary",
  run: async (_payload: GenerateSessionSummaryPayload) => undefined,
};

/*

/**
 * Queue for AI operations with strict concurrency to avoid rate limits.
 * Only 1 AI call runs at a time globally across all workers.
 */
const aiQueue = queue({
  name: "ai-operations",
  concurrencyLimit: 1,
});

/**
 * Payload for the session summary generation task.
 */
export interface GenerateSessionSummaryPayload extends SessionSummaryInput {
  sessionId: string;
  userId: string;
}

/**
 * Background task to generate AI-powered title and summary for a coding session.
 *
 * This task is triggered when a session is "closed" (user went idle for 15+ minutes).
 * It delegates to @turbo/ai for the actual AI generation.
 */
export const generateSessionSummaryTask = task({
  id: "generate-session-summary",
  queue: aiQueue,
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 60_000,
    factor: 2,
  },
  run: async (payload: GenerateSessionSummaryPayload) => {
    const { sessionId, userId, ...aiInput } = payload;

    // Call the AI function from @turbo/ai
    const result = await generateSessionSummary(aiInput);

    // Update the session in the database with the generated title/summary and mark as completed
    await db
      .update(codingSession)
      .set({
        title: result.title,
        summary: result.summary,
        status: SESSION_STATUS.COMPLETED,
      })
      .where(eq(codingSession.id, sessionId));

    // Track analytics
    trackServerEvent({
      distinctId: userId,
      event: ANALYTICS_EVENTS.SESSION_CLOSED,
      properties: {
        sessionId,
        title: result.title,
        summary: result.summary,
      },
    });

    return {
      sessionId,
      ...result,
    };
  },
});
*/
