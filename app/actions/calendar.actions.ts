"use server";

import { auth } from "@/auth";

/**
 * Server Action: Compiles all tasks of a study plan into a standard iCalendar (.ics) string.
 */
export async function exportStudyPlanToICSAction(planId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const plan = await prisma.studyPlan.findFirst({
      where: { id: planId, userId },
      include: {
        tasks: {
          orderBy: { dayNumber: "asc" },
        },
      },
    });

    if (!plan) {
      return { success: false, error: "Study plan not found." };
    }

    // Start compiling iCal format text
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//StudyTestAI//NONSGML Study Planner Calendar Feed//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    const formatDateToICS = (dateObj: Date) => {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}${month}${day}`;
    };

    for (const task of plan.tasks) {
      const startStr = formatDateToICS(new Date(task.date));
      
      // End date for a full day event is the next day
      const nextDay = new Date(task.date);
      nextDay.setDate(nextDay.getDate() + 1);
      const endStr = formatDateToICS(nextDay);

      // Clean special characters for descriptions
      const cleanDesc = task.description
        .replace(/[,;]/g, "\\$&")
        .replace(/\n/g, "\\n");

      const uid = `task-${plan.id}-${task.id}@studytest.ai`;

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${startStr}T000000Z`,
        `DTSTART;VALUE=DATE:${startStr}`,
        `DTEND;VALUE=DATE:${endStr}`,
        `SUMMARY:Study: ${task.topic}`,
        `DESCRIPTION:${cleanDesc}\\nEstimated time: ${task.estimatedMinutes} minutes`,
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
        "END:VEVENT"
      );
    }

    icsContent.push("END:VCALENDAR");

    return {
      success: true,
      icsString: icsContent.join("\r\n"),
      filename: `study_plan_${plan.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.ics`,
    };
  } catch (error) {
    console.error("Failed to generate iCal feed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to compile calendar sync data.",
    };
  }
}

/**
 * Server Action: Synchronizes study plan tasks directly to the user's primary Google Calendar via REST.
 */
export async function syncPlanToGoogleCalendarAction(planId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    // 1. Fetch user's Google Account tokens
    const account = await prisma.account.findFirst({
      where: { userId, provider: "google" },
    });

    if (!account || !account.access_token) {
      return {
        success: false,
        code: "MISSING_OAUTH",
        error: "Google Calendar connection missing. Please sign in again using Google.",
      };
    }

    let accessToken = account.access_token;
    const expiresAt = account.expires_at ? account.expires_at * 1000 : 0;

    // 2. Refresh Google Access Token if expired
    if (expiresAt && Date.now() > expiresAt - 60000 && account.refresh_token) {
      console.log("Google access token expired, refreshing...");
      try {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.AUTH_GOOGLE_ID || "",
            client_secret: process.env.AUTH_GOOGLE_SECRET || "",
            grant_type: "refresh_token",
            refresh_token: account.refresh_token,
          }),
        });

        const data = await tokenRes.json();
        if (data.access_token) {
          accessToken = data.access_token;
          await prisma.account.update({
            where: { id: account.id },
            data: {
              access_token: data.access_token,
              expires_at: data.expires_in ? Math.floor(Date.now() / 1000 + data.expires_in) : account.expires_at,
            },
          });
          console.log("Successfully refreshed Google access token.");
        } else {
          console.error("Token refresh response error:", data);
        }
      } catch (refreshErr) {
        console.error("Failed to refresh Google token:", refreshErr);
      }
    }

    // 3. Fetch plan details and tasks
    const plan = await prisma.studyPlan.findFirst({
      where: { id: planId, userId },
      include: {
        tasks: {
          orderBy: { dayNumber: "asc" },
        },
      },
    });

    if (!plan || plan.tasks.length === 0) {
      return { success: false, error: "No tasks found in study plan." };
    }

    // 4. Submit events to Google Calendar REST API
    let successCount = 0;

    let lastErrorDetails = "";

    for (const task of plan.tasks) {
      const start = new Date(task.date);
      // Start study daily block at 9 AM local/UTC
      start.setHours(9, 0, 0, 0);

      const end = new Date(start);
      end.setMinutes(end.getMinutes() + task.estimatedMinutes);

      const event = {
        summary: `Study: ${task.topic}`,
        description: `${task.description}\n\nEstimated study duration: ${task.estimatedMinutes} minutes.\nSync key: studytest-${task.id}`,
        start: {
          dateTime: start.toISOString(),
        },
        end: {
          dateTime: end.toISOString(),
        },
      };

      const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      if (response.ok) {
        successCount++;
      } else {
        lastErrorDetails = await response.text();
        console.error(`Failed to add Google Calendar event for task ID ${task.id}:`, lastErrorDetails);
      }
    }

    if (successCount === 0) {
      let errMsg = "Google Calendar rejected calendar inserts. Please sign out and sign back in to re-authorize scopes.";
      if (lastErrorDetails) {
        try {
          const parsed = JSON.parse(lastErrorDetails);
          if (parsed.error?.message) {
            errMsg = `Google API Error: ${parsed.error.message}`;
            if (parsed.error.message.toLowerCase().includes("api has not been used") || parsed.error.message.toLowerCase().includes("disabled")) {
              errMsg += " Please go to Google Cloud Console and enable the 'Google Calendar API' for your project.";
            }
          }
        } catch (e) {
          errMsg = `Google API Error: ${lastErrorDetails.slice(0, 150)}`;
        }
      }
      return {
        success: false,
        error: errMsg,
      };
    }

    return {
      success: true,
      count: successCount,
    };
  } catch (err: any) {
    console.error("Google Calendar Sync failed:", err);
    return {
      success: false,
      error: err.message || "Failed to push study events directly.",
    };
  }
}
