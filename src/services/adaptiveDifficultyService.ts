// Adaptive Difficulty Service
// Calculates user's difficulty level and selects appropriate questions

import { TestResult } from './aiCoach';
import type { Question } from '../types';

export interface QuestionPerformance {
  questionId: string;
  wasCorrect: boolean;
  timeSpent: number;
  difficulty: number;
  topic: string;
}

export interface AdaptiveLearningState {
  currentDifficulty: number; // 1-10
  topicMastery: Record<string, number>; // 0-100%
  questionHistory: QuestionPerformance[];
  lastAdjustment: Date;
}

class AdaptiveDifficultyService {
  // Calculate user's current difficulty level (1-10 scale)
  calculateDifficultyLevel(userHistory: TestResult[]): number {
    if (userHistory.length === 0) {
      return 3; // Start at beginner-intermediate
    }

    // Get last 5 tests for recent performance
    const recentTests = userHistory.slice(-5);
    const scores = recentTests.map(test => test.percentage);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Base difficulty from average score
    let baseDifficulty = 3;
    if (averageScore >= 90) baseDifficulty = 9;
    else if (averageScore >= 80) baseDifficulty = 7;
    else if (averageScore >= 70) baseDifficulty = 5;
    else if (averageScore >= 60) baseDifficulty = 4;
    else if (averageScore >= 50) baseDifficulty = 3;
    else baseDifficulty = 2;

    // Adjust for consistency
    const variance = this.calculateVariance(scores);
    if (variance < 100) {
      baseDifficulty += 1; // Consistent scores = ready for harder
    } else if (variance > 400) {
      baseDifficulty -= 1; // High variance = unstable, go easier
    }

    // Adjust for improvement trend
    if (recentTests.length >= 3) {
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 5) {
        baseDifficulty += 1; // Improving
      } else if (secondAvg < firstAvg - 5) {
        baseDifficulty -= 1; // Declining
      }
    }

    // Clamp between 1 and 10
    return Math.max(1, Math.min(10, baseDifficulty));
  }

  // Calculate variance of scores
  private calculateVariance(scores: number[]): number {
    if (scores.length === 0) return 0;
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    return variance;
  }

  // Get user's mastery per topic (0-100%)
  getTopicMastery(testId: string, userHistory: TestResult[]): number {
    const topicTests = userHistory.filter(test => test.testId === testId);
    if (topicTests.length === 0) return 0;
    
    const average = topicTests.reduce((sum, test) => sum + test.percentage, 0) / topicTests.length;
    return Math.round(average);
  }

  // Calculate question difficulty if not tagged (public for use in components)
  calculateQuestionDifficulty(question: Question): 'easy' | 'medium' | 'hard' {
    // If already tagged, use it
    if ((question as any).difficulty) {
      return (question as any).difficulty;
    }

    // Heuristic-based difficulty calculation
    let score = 0;
    
    // Factor 1: Text length (longer = potentially harder)
    const textLength = question.text.length;
    if (textLength > 200) score += 2;
    else if (textLength > 150) score += 1;
    
    // Factor 2: Options complexity
    const hasLongOptions = question.options.some(opt => opt.text.length > 60);
    if (hasLongOptions) score += 1;
    
    // Factor 3: Number of options (more = potentially harder)
    if (question.options.length > 3) score += 1;
    
    // Factor 4: Explanation length (longer = more complex concept)
    const explanationLength = question.explanation?.length || 0;
    if (explanationLength > 250) score += 1;
    else if (explanationLength > 150) score += 0.5;
    
    // Factor 5: Subject complexity (some topics are inherently harder)
    const complexSubjects = ['Hazard Perception', 'Priority Rules', 'Roundabout Rules'];
    if (complexSubjects.includes((question as any).subject || '')) {
      score += 0.5;
    }
    
    // Map score to difficulty
    if (score <= 1) return 'easy';
    if (score <= 3) return 'medium';
    return 'hard';
  }

  // Select questions based on difficulty level
  selectAdaptiveQuestions(
    allQuestions: Question[],
    difficultyLevel: number,
    count: number,
    weakTopics?: string[] // Optional: prioritize weak topics
  ): Question[] {
    // Calculate difficulty for all questions if not tagged
    const questionsWithDifficulty = allQuestions.map(q => ({
      question: q,
      difficulty: this.calculateQuestionDifficulty(q)
    }));

    // Filter questions by difficulty
    const easyQuestions = questionsWithDifficulty
      .filter(q => q.difficulty === 'easy')
      .map(q => q.question);
    const mediumQuestions = questionsWithDifficulty
      .filter(q => q.difficulty === 'medium')
      .map(q => q.question);
    const hardQuestions = questionsWithDifficulty
      .filter(q => q.difficulty === 'hard')
      .map(q => q.question);

    let selected: Question[] = [];

    // Difficulty mapping
    if (difficultyLevel <= 3) {
      // Beginner: Only easy
      selected = this.shuffleArray([...easyQuestions]).slice(0, count);
    } else if (difficultyLevel <= 6) {
      // Intermediate: Mix easy (40%) + medium (60%)
      const easyCount = Math.floor(count * 0.4);
      const mediumCount = count - easyCount;
      selected = [
        ...this.shuffleArray([...easyQuestions]).slice(0, easyCount),
        ...this.shuffleArray([...mediumQuestions]).slice(0, mediumCount)
      ];
    } else if (difficultyLevel <= 8) {
      // Advanced: Mix medium (50%) + hard (50%)
      const mediumCount = Math.floor(count * 0.5);
      const hardCount = count - mediumCount;
      selected = [
        ...this.shuffleArray([...mediumQuestions]).slice(0, mediumCount),
        ...this.shuffleArray([...hardQuestions]).slice(0, hardCount)
      ];
    } else {
      // Expert: Only hard
      selected = this.shuffleArray([...hardQuestions]).slice(0, count);
    }

    // Prioritize weak topics if provided
    if (weakTopics && weakTopics.length > 0) {
      const weakTopicQuestions = selected.filter(q => {
        const subject = (q as any).subject || '';
        return weakTopics.some(topic => 
          subject.toLowerCase().includes(topic.toLowerCase()) ||
          topic.toLowerCase().includes(subject.toLowerCase())
        );
      });
      
      const otherQuestions = selected.filter(q => !weakTopicQuestions.includes(q));
      
      // 60% from weak topics, 40% from others
      const weakCount = Math.floor(count * 0.6);
      const otherCount = count - weakCount;
      
      selected = [
        ...this.shuffleArray(weakTopicQuestions).slice(0, weakCount),
        ...this.shuffleArray(otherQuestions).slice(0, otherCount)
      ];
    }

    // If not enough questions, fill with available
    if (selected.length < count) {
      const remaining = count - selected.length;
      const allAvailable = [...easyQuestions, ...mediumQuestions, ...hardQuestions]
        .filter(q => !selected.includes(q));
      selected = [...selected, ...this.shuffleArray(allAvailable).slice(0, remaining)];
    }

    return this.shuffleArray(selected).slice(0, count);
  }

  // Adjust difficulty after each answer
  adjustDifficultyAfterAnswer(
    currentLevel: number,
    wasCorrect: boolean,
    timeSpent: number,
    questionDifficulty?: 'easy' | 'medium' | 'hard' // Optional: consider question difficulty
  ): number {
    let adjustment = 0;

    // Base adjustment from correctness and time
    if (wasCorrect) {
      if (timeSpent < 30) {
        adjustment = 0.5; // Fast and correct = getting better
      } else if (timeSpent < 60) {
        adjustment = 0.2; // Medium time = correct but unsure
      } else {
        adjustment = 0; // Slow but correct = no change
      }
    } else {
      if (timeSpent < 30) {
        adjustment = -0.5; // Fast and wrong = rushing, need easier
      } else {
        adjustment = -0.3; // Slow and wrong = struggling, need easier
      }
    }

    // Enhanced: Weight adjustment by question difficulty
    if (questionDifficulty) {
      const difficultyWeight = {
        'easy': 0.7,    // Easy questions = less impact on difficulty
        'medium': 1.0,  // Medium = normal impact
        'hard': 1.3     // Hard questions = more impact
      };
      
      adjustment *= difficultyWeight[questionDifficulty];
    }

    const newLevel = currentLevel + adjustment;
    // Clamp between 1 and 10
    return Math.max(1, Math.min(10, Math.round(newLevel * 10) / 10));
  }

  // Get difficulty label for display
  getDifficultyLabel(level: number): string {
    if (level <= 3) return 'Beginner';
    if (level <= 6) return 'Intermediate';
    if (level <= 8) return 'Advanced';
    return 'Expert';
  }

  // Shuffle array
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export const adaptiveDifficultyService = new AdaptiveDifficultyService();

