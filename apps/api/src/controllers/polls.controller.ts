import { type Request, type Response, type NextFunction } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { polls, pollVotes } from "../models/schema.js";

/**
 * 🗳️ Get Polls with live vote aggregations
 */
export async function getPolls(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }

    const list = await db
      .select()
      .from(polls)
      .where(eq(polls.societyId, req.societyId))
      .orderBy(desc(polls.createdAt));

    // Aggregate votes for each poll
    const pollsWithVotes = await Promise.all(
      list.map(async (poll) => {
        const votesResult = await db
          .select({
            option: pollVotes.option,
            count: sql<number>`count(*)::int`,
          })
          .from(pollVotes)
          .where(eq(pollVotes.pollId, poll.id))
          .groupBy(pollVotes.option);

        const votesMap: Record<string, number> = {};
        poll.options.forEach((opt) => {
          votesMap[opt] = 0;
        });
        votesResult.forEach((v) => {
          votesMap[v.option] = v.count;
        });

        const totalVotes = votesResult.reduce((sum, v) => sum + v.count, 0);

        return {
          id: poll.id,
          question: poll.question,
          options: poll.options,
          expiresAt: poll.expiresAt,
          createdAt: poll.createdAt,
          votes: votesMap,
          totalVotes,
        };
      })
    );

    return res.status(200).json({ polls: pollsWithVotes });
  } catch (error) {
    next(error);
  }
}

/**
 * ✍️ Create a Poll (Admin Only)
 */
export async function createPoll(req: Request, res: Response, next: NextFunction) {
  try {
    const { question, options, expiresInDays } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ 
        error: "Question and at least 2 options are required" 
      });
    }

    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }

    const days = parseInt(expiresInDays) || 3; // Default 3 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const [newPoll] = await db
      .insert(polls)
      .values({
        societyId: req.societyId,
        question: question.trim(),
        options: options.map(opt => opt.trim()).filter(opt => opt.length > 0),
        expiresAt,
      })
      .returning();

    if (!newPoll) {
      return res.status(500).json({ error: "Failed to create poll" });
    }

    return res.status(201).json({
      message: "Poll published successfully",
      poll: {
        ...newPoll,
        votes: newPoll.options.reduce((map, opt) => ({ ...map, [opt]: 0 }), {}),
        totalVotes: 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🗑️ Delete a Poll (Admin Only)
 */
export async function deletePoll(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Poll ID is required" });
    }

    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }

    // 1. Delete associated votes to maintain foreign key integrity
    await db.delete(pollVotes).where(eq(pollVotes.pollId, id));

    // 2. Delete the poll
    const [deletedPoll] = await db
      .delete(polls)
      .where(
        and(
          eq(polls.id, id),
          eq(polls.societyId, req.societyId)
        )
      )
      .returning();

    if (!deletedPoll) {
      return res.status(404).json({ error: "Poll not found or unauthorized" });
    }

    return res.status(200).json({
      message: "Poll deleted successfully",
      poll: deletedPoll,
    });
  } catch (error) {
    next(error);
  }
}
