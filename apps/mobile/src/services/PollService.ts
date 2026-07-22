import { api } from '@/lib/axios';

export interface PollOptionTally {
  option: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  expiresAt: string;
  userVotedOption: string | null;
  results: PollOptionTally[];
  totalVotes: number;
}

export interface EnhancedPoll extends Poll {
  isFeatured?: boolean;
  description?: string;
  expiresLabel?: string;
  icon?: string;
}

export class PollService {
  /**
   * 🗳️ Fetch all community polls for the resident's society
   */
  static async getPolls(): Promise<Poll[]> {
    const response = await api.get('/api/polls');
    return response.data?.polls || [];
  }

  /**
   * 🗳️ Cast a vote on a community poll option
   */
  static async votePoll(pollId: string, option: string): Promise<any> {
    const response = await api.post(`/api/polls/${pollId}/vote`, { option });
    return response.data;
  }
}
