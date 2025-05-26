export class GetExamSetDto {
  id: string;
  name: string;
  description?: string;
  questions: {
    id: string;
    content: string;
    subcontent?: string;
    image?: string;
    sequence?: number;
    answerOptions: {
      id: string;
      content: string;
      isCorrect: boolean;
    }[];
  }[];
}
