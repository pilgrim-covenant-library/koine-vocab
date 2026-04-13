export interface ReviewQuestion {
  id: string;
  question: string;
  greek?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

export interface ReviewWeek {
  week: number;
  title: string;
  subtitle: string;
  description: string;
  hwCovered: string;
  topics: string[];
  inClass: ReviewQuestion[];
  homework: ReviewQuestion[];
}
