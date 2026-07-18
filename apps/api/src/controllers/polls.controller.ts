import { type Request, type Response, type NextFunction } from "express";
import { eq, and, desc, count } from "drizzle-orm";
import { db } from "../db/index.js";
import { polls, pollVotes } from "../models/schema.js";

/**
 * 🗳️ Get all society polls (Seeds default polls if empty)
 */
export async function getPolls(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    let list = await db
      .select()
      .from(polls)
      .where(eq(polls.societyId, req.societyId))
      .orderBy(desc(polls.createdAt));

    // Seed default community polls if empty
    if (list.length === 0) {
      const defaults = [
        {
          question: "Should we implement security EV patrol vehicles in the basement?",
          options: ["Yes, immediately", "No, keep guards on foot", "Neutral / Unsure"],
          expiresAt: new Date(Date.now() + 86400000 * 7), // 7 days
        },
        {
          question: "Select the preferred timing for society clubhouse tennis court lights shutdown:",
          options: ["9:00 PM", "10:00 PM", "11:00 PM"],
          expiresAt: new Date(Date.now() + 86400000 * 3), // 3 days
        },
      ];

      await db.insert(polls).values(
        defaults.map((p) => ({
          societyId: req.societyId!,
          ...p,
        }))
      );

      list = await db
        .select()
        .from(polls)
        .where(eq(polls.societyId, req.societyId))
        .orderBy(desc(polls.createdAt));
    }

    // Map each poll and append user vote status & option tallies
    const formattedPolls = await Promise.all(
      list.map(async (p) => {
        // 1. Fetch user's cast vote if any
        const [userVote] = await db
          .select({ option: pollVotes.option })
          .from(pollVotes)
          .where(and(eq(pollVotes.pollId, p.id), eq(pollVotes.userId, req.user!.id)))
          .limit(1);

        // 2. Fetch total tally count for options
        const voteTallies = await Promise.all(
          p.options.map(async (option) => {
            const [tally] = await db
              .select({ val: count() })
              .from(pollVotes)
              .where(and(eq(pollVotes.pollId, p.id), eq(pollVotes.option, option)));
            return { option, votes: tally?.val || 0 };
          })
        );

        return {
          id: p.id,
          question: p.question,
          options: p.options,
          expiresAt: p.expiresAt,
          createdAt: p.createdAt,
          userVotedOption: userVote?.option || null,
          results: voteTallies,
          totalVotes: voteTallies.reduce((sum, current) => sum + current.votes, 0),
        };
      })
    );

    return res.status(200).json({ polls: formattedPolls });
  } catch (error) {
    next(error);
  }
}

/**
 * 🗳️ Cast a vote on a poll option
 */
export async function votePoll(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const { option } = req.body;

    if (!id || !option) {
      return res.status(400).json({ error: "Poll ID and chosen option are required" });
    }

    // Verify user has not already voted on this poll
    const [existingVote] = await db
      .select()
      .from(pollVotes)
      .where(and(eq(pollVotes.pollId, id), eq(pollVotes.userId, req.user.id)))
      .limit(1);

    if (existingVote) {
      return res.status(409).json({ error: "You have already voted on this community poll" });
    }

    // Cast vote
    const [newVote] = await db
      .insert(pollVotes)
      .values({
        pollId: id,
        userId: req.user.id,
        option,
      })
      .returning();

    return res.status(201).json({
      message: "Your vote has been cast successfully",
      vote: newVote,
    });
  } catch (error) {
    next(error);
  }
}
