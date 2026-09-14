import { PgBoss } from "pg-boss";

let bossInstance: PgBoss | null = null;
let isStarted = false;

/**
 * Gets or creates the singleton instance of PgBoss backed by PostgreSQL.
 */
export function getBoss(): PgBoss {
  if (!bossInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not defined for pg-boss.");
    }

    bossInstance = new PgBoss({
      connectionString,
      schema: "pgboss",
      max: 10,
    });

    bossInstance.on("error", (err: unknown) => {
      console.error("[pg-boss] Error:", err);
    });
  }

  return bossInstance;
}

export const APPLICATION_QUEUE_NAME = "apply-job-queue";

export interface ApplicationJobPayload {
  applicationId: string;
  userId: string;
  jobId: string;
  resumeId?: string | null;
}

/**
 * Starts the PgBoss instance if not already active.
 */
export async function startBoss(): Promise<PgBoss> {
  const boss = getBoss();
  if (!isStarted) {
    try {
      await boss.start();
      isStarted = true;
      console.log("[pg-boss] Background queue started successfully.");
    } catch (err) {
      console.error("[pg-boss] Failed to start queue:", err);
      throw err;
    }
  }
  return boss;
}

/**
 * Enqueues an application job into pg-boss.
 * Uses `singletonKey` per user so jobs for the same user execute one-by-one sequentially.
 */
export async function enqueueApplicationJob(payload: ApplicationJobPayload): Promise<string | null> {
  const boss = await startBoss();

  const jobId = await boss.send(
    APPLICATION_QUEUE_NAME,
    payload,
    {
      singletonKey: `user_${payload.userId}`,
      retryLimit: 2,
      retryDelay: 10,
      expireInSeconds: 900,
    } as any
  );

  return jobId;
}
