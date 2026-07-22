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
      const now = new Date();
      const addTime = (days: number, hours: number) => {
        const d = new Date(now);
        d.setDate(d.getDate() + days);
        d.setHours(d.getHours() + hours);
        return d;
      };

      const defaults = [
        {
          question: "Should we upgrade the children's play area?",
          options: ["Yes, I support this", "No, not needed right now", "I'm not sure"],
          expiresAt: addTime(2, 14),
        },
        {
          question: "Should we implement visitor parking charges?",
          options: ["Yes", "No"],
          expiresAt: addTime(5, 8),
        },
        {
          question: "Should we install RO plants in the society?",
          options: ["Yes", "No"],
          expiresAt: addTime(7, 12),
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
 * 🗳️ Cast or update a vote on a poll option
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

    // Check if user has already voted on this poll
    const [existingVote] = await db
      .select()
      .from(pollVotes)
      .where(and(eq(pollVotes.pollId, id), eq(pollVotes.userId, req.user.id)))
      .limit(1);

    if (existingVote) {
      // Update existing vote (Change My Vote support)
      const [updatedVote] = await db
        .update(pollVotes)
        .set({ option })
        .where(and(eq(pollVotes.pollId, id), eq(pollVotes.userId, req.user.id)))
        .returning();

      return res.status(200).json({
        message: "Your vote has been updated successfully",
        vote: updatedVote,
      });
    }

    // Cast new vote
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

/**
 * 🗳️ Create a new poll (Admin)
 */
export async function createPoll(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { question, options, expiresInDays } = req.body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return res.status(400).json({ error: "Poll question is required" });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: "At least 2 options are required" });
    }

    const days = typeof expiresInDays === "number" && expiresInDays > 0 ? expiresInDays : 7;
    const expiresAt = new Date(Date.now() + days * 86400000);

    const [newPoll] = await db
      .insert(polls)
      .values({
        societyId: req.societyId,
        question: question.trim(),
        options: options.map((opt: string) => String(opt).trim()).filter(Boolean),
        expiresAt,
      })
      .returning();

    return res.status(201).json({
      message: "Poll created successfully",
      poll: newPoll,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🗳️ Delete a poll (Admin)
 */
export async function deletePoll(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Poll ID is required" });
    }

    // Delete associated votes first
    await db
      .delete(pollVotes)
      .where(eq(pollVotes.pollId, id));

    // Delete poll
    const [deleted] = await db
      .delete(polls)
      .where(and(eq(polls.id, id), eq(polls.societyId, req.societyId)))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: "Poll not found" });
    }

    return res.status(200).json({
      message: "Poll deleted successfully",
      poll: deleted,
    });
  } catch (error) {
    next(error);
  }
}
