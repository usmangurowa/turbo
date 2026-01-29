import { Hono } from "hono";

import type { AppContext } from "../context";

const app = new Hono<AppContext>();

export default app;

/*

/**
 * Valid period types for insights
 */
type InsightsPeriod = "week" | "month" | "all-time";

/**
 * Get date range for a period
 */
const getDateRangeForPeriod = (period: InsightsPeriod) => {
  import { Hono } from "hono";

  import type { AppContext } from "../context";

  const app = new Hono<AppContext>();

  export default app;
            ),
          )
          .groupBy(sql`DATE(${codingSession.startedAt})`)
          .orderBy(sql`DATE(${codingSession.startedAt})`),
      ]);

    // Calculate core metrics from heartbeats (most accurate for coding time)
    const metrics = calculateAllMetrics(heartbeats, timeoutOptions);
    const totalMinutes = Math.round(metrics.codingTimeSeconds / 60);

    // Calculate days in period for daily average
    const daysInPeriod = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const avgDailyMinutes = Math.round(totalMinutes / daysInPeriod);

    // Calculate time per language from sessions
    const languageTimeMap = new Map<string, number>();
    for (const session of sessions) {
      if (session.mainLanguage) {
        const durationMinutes = Math.round(
          (session.endedAt.getTime() - session.startedAt.getTime()) / 60000,
        );
        languageTimeMap.set(
          session.mainLanguage,
          (languageTimeMap.get(session.mainLanguage) ?? 0) + durationMinutes,
        );
      }
    }

    // Calculate time per project from sessions
    const projectTimeMap = new Map<string, number>();
    for (const session of sessions) {
      if (session.mainProject) {
        const durationMinutes = Math.round(
          (session.endedAt.getTime() - session.startedAt.getTime()) / 60000,
        );
        projectTimeMap.set(
          session.mainProject,
          (projectTimeMap.get(session.mainProject) ?? 0) + durationMinutes,
        );
      }
    }

    // Find top language
    let topLanguage: {
      name: string;
      minutes: number;
      percentage: number;
    } | null = null;
    let maxLangMinutes = 0;
    for (const [lang, minutes] of languageTimeMap) {
      if (minutes > maxLangMinutes) {
        maxLangMinutes = minutes;
        topLanguage = {
          name: lang,
          minutes,
          percentage:
            totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
        };
      }
    }

    // Find top project
    let topProject: { name: string; minutes: number } | null = null;
    let maxProjMinutes = 0;
    for (const [proj, minutes] of projectTimeMap) {
      if (minutes > maxProjMinutes) {
        maxProjMinutes = minutes;
        topProject = { name: proj, minutes };
      }
    }

    // Find longest session
    let longestSession: { minutes: number; date: string } | null = null;
    for (const session of sessions) {
      const durationMinutes = Math.round(
        (session.endedAt.getTime() - session.startedAt.getTime()) / 60000,
      );
      if (!longestSession || durationMinutes > longestSession.minutes) {
        const dateStr = session.startedAt.toISOString().split("T")[0];
        longestSession = {
          minutes: durationMinutes,
          date: dateStr ?? "",
        };
      }
    }

    // Calculate most active day of week
    const dayOfWeekCounts: Record<string, { total: number; count: number }> =
      {};
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (const session of sessions) {
      const dayName = dayNames[session.startedAt.getDay()] ?? "Unknown";
      const durationMinutes = Math.round(
        (session.endedAt.getTime() - session.startedAt.getTime()) / 60000,
      );
      dayOfWeekCounts[dayName] ??= { total: 0, count: 0 };
      dayOfWeekCounts[dayName].total += durationMinutes;
      dayOfWeekCounts[dayName].count += 1;
    }

    let mostActiveDay: { dayOfWeek: string; avgMinutes: number } | null = null;
    let maxAvg = 0;
    for (const [dayName, data] of Object.entries(dayOfWeekCounts)) {
      const avg = data.count > 0 ? data.total / data.count : 0;
      if (avg > maxAvg) {
        maxAvg = avg;
        mostActiveDay = { dayOfWeek: dayName, avgMinutes: Math.round(avg) };
      }
    }

    // Build language breakdown with percentages
    const languageBreakdown = languageStats
      .filter((l): l is typeof l & { language: string } => l.language !== null)
      .map((l) => {
        const minutes = languageTimeMap.get(l.language) ?? 0;
        return c.json({
          period,
          dateRange: {
            start: start.toISOString(),
            end: end.toISOString(),
          },
          totalMinutes,
          avgDailyMinutes,
          flowCount: metrics.flows,
          sessionCount: sessions.length,
          topLanguage,
          topProject,
          longestSession,
          mostActiveDay,
          languageBreakdown,
          projectBreakdown,
          dailyActivity,
        });
      });

    export default app;
    */
      .sort((a, b) => b.minutes - a.minutes);

    // Build daily activity array (calculate from sessions)
    const dailyMinutesMap = new Map<string, number>();
    for (const session of sessions) {
      const dateStr = session.startedAt.toISOString().split("T")[0];
      const date = dateStr ?? "";
      const durationMinutes = Math.round(
        (session.endedAt.getTime() - session.startedAt.getTime()) / 60000,
      );
      dailyMinutesMap.set(
        date,
        (dailyMinutesMap.get(date) ?? 0) + durationMinutes,
      );
    }

    const dailyActivity = dailyStats.map((d) => ({
      date: d.date,
      minutes: dailyMinutesMap.get(d.date) ?? 0,
    }));

    return c.json({
      period,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },

      // Core metrics
      totalMinutes,
      avgDailyMinutes,
      flowCount: metrics.flows,
      sessionCount: sessions.length,

      // Highlights
      topLanguage,
      topProject,
      longestSession,
      mostActiveDay,

      // Breakdowns
      languageBreakdown,
      projectBreakdown,
      dailyActivity,
    });
  });

export default app;
