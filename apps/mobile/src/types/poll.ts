export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: Record<number, number>;
}
