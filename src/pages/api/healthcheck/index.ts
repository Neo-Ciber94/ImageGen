import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../../env.mjs";
import { db } from "../../../server/db/drizzle";
import { sql } from "drizzle-orm"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = req.headers.authorization;

  if (accessToken !== env.HEALTHCHECK_TOKEN) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  let isDatabaseHealthy = false;

  try {
    await db.execute(sql`SELECT 1;`)
    isDatabaseHealthy = true;
  }
  catch (err) {
    console.error(err);
  }

  res.json({
    isDatabaseHealthy,
  });
}
