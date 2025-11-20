// Dynamic Mock Exam Service
// Generates personalized mock exams based on user performance
// IMPORTANT: Only uses REAL CBR questions - no generation, only filtering
// MAINTAINS CBR STRUCTURE: 25 questions (15 regular + 10 image), 30 minutes total

import { TestResult } from './aiCoach';
import { realExamQuestions, mockExamImageQuestions, RealExamQuestion } from '../question_data/realExamQuestions';
import { adaptiveDifficultyService } from './adaptiveDifficultyService';

export interface WeakArea {
  topic: string;
  score: number;
  count: number;
  urgency?: number; // Optional: urgency score for prioritization
  mastery?: number; // Mastery level (0-100%)
  improvement?: number; // Improvement trend (-100 to +100)
}

export interface QuestionHistory {
  questionId: string;
  seenCount: number;
  lastSeen: Date;
  correctCount: number;
  incorrectCount: number;
  averageTime: number;
  topics: string[];
  lastExamId?: string;
}

export interface RecentPerformance {
  averageScore: number;
  trend: 'improving' | 'declining' | 'stable';
  recentDifficulty: number;
  mockExamCount: number;
}

export interface DynamicExamConfig {
  examId: string;
  focusAreas: string[];
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  personalizationLevel: number; // 0-100%
  generatedAt: Date;
}

class DynamicMockExamService {
  // CBR Exam Structure Constants
  private readonly CBR_STRUCTURE = {
    TOTAL_QUESTIONS: 25,
    REGULAR_QUESTIONS: 15,
    IMAGE_QUESTIONS: 10,
    TOTAL_TIME_SECONDS: 1800, // 30 minutes
    AVERAGE_TIME_PER_QUESTION: 72, // seconds
    MAX_TIME_PER_QUESTION: 90 // seconds
  };

  // Map practice test IDs to real exam subjects
  private topicMapping: Record<string, string> = {
    'priority-rules': 'Priority Rules',
    'hazard-perception': 'Hazard Perception',
    'speed-safety': 'Speed Limits',
    'traffic-lights-signals': 'Traffic Lights',
    'road-signs': 'Road Signs',
    'motorway-rules': 'Motorway Rules',
    'roundabout-rules': 'Roundabout Rules',
    'bicycle-interactions': 'Bicycle Interactions',
    'tram-interactions': 'Tram Interactions',
    'pedestrian-crossings': 'Pedestrian Crossings',
    'construction-zones': 'Construction Zones',
    'weather-conditions': 'Weather Conditions',
    'vehicle-knowledge': 'Vehicle Knowledge',
    'parking-rules': 'Parking Rules',
    'environmental': 'Environmental Zones',
    'technology-safety': 'Technology & Safety',
    'alcohol-drugs': 'Alcohol & Drugs',
    'fatigue-rest': 'Fatigue & Rest',
    'emergency-procedures': 'Emergency Procedures',
  };

  // Get question history for user (prevents repeats)
  private getQuestionHistory(userId?: string): QuestionHistory[] {
    try {
      const key = userId ? `questionHistory_${userId}` : 'questionHistory';
      const stored = localStorage.getItem(key);
      if (stored) {
        const history = JSON.parse(stored);
        // Convert date strings back to Date objects
        return history.map((h: any) => ({
          ...h,
          lastSeen: new Date(h.lastSeen)
        }));
      }
    } catch (error) {
      console.error('Error loading question history:', error);
    }
    return [];
  }

  // Save question history
  private saveQuestionHistory(history: QuestionHistory[], userId?: string): void {
    try {
      const key = userId ? `questionHistory_${userId}` : 'questionHistory';
      localStorage.setItem(key, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving question history:', error);
    }
  }

  // Update question history after exam
  updateQuestionHistory(questionIds: string[], examId: string, userId?: string): void {
    const history = this.getQuestionHistory(userId);
    const now = new Date();

    questionIds.forEach(qId => {
      const existing = history.find(h => h.questionId === qId);
      if (existing) {
        existing.seenCount += 1;
        existing.lastSeen = now;
        existing.lastExamId = examId;
      } else {
        // Get question to extract topics
        const allQuestions = [...realExamQuestions, ...mockExamImageQuestions];
        const question = allQuestions.find(q => q.id === qId);
        history.push({
          questionId: qId,
          seenCount: 1,
          lastSeen: now,
          correctCount: 0,
          incorrectCount: 0,
          averageTime: 0,
          topics: question ? [question.subject] : [],
          lastExamId: examId
        });
      }
    });

    this.saveQuestionHistory(history, userId);
  }

  // Filter out recently seen questions
  private filterUnseenQuestions(
    questions: RealExamQuestion[],
    userId?: string,
    minDaysSinceSeen: number = 7,
    maxSeenCount: number = 3
  ): RealExamQuestion[] {
    const history = this.getQuestionHistory(userId);
    const seenQuestionIds = new Set(history.map(h => h.questionId));
    const now = Date.now();

    return questions.filter(q => {
      const questionHistory = history.find(h => h.questionId === q.id);
      
      // Never seen - always include
      if (!questionHistory) return true;
      
      // Seen too many times - exclude
      if (questionHistory.seenCount >= maxSeenCount) return false;
      
      // Check if seen recently
      const daysSinceSeen = (now - questionHistory.lastSeen.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceSeen >= minDaysSinceSeen;
    });
  }

  // Get recent performance (last 7 days or last 5 mock exams)
  getRecentPerformance(userHistory: TestResult[]): RecentPerformance {
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    // Filter recent tests (last 7 days)
    const recentTests = userHistory.filter(test => {
      const testDate = new Date(test.date).getTime();
      return testDate >= sevenDaysAgo;
    });

    // Get mock exams specifically (testId contains 'mock' or 'exam')
    const mockExams = userHistory.filter(test => 
      test.testId.toLowerCase().includes('mock') || 
      test.testId.toLowerCase().includes('exam')
    ).slice(-5); // Last 5 mock exams

    const averageScore = recentTests.length > 0
      ? recentTests.reduce((sum, t) => sum + t.percentage, 0) / recentTests.length
      : 0;

    // Calculate trend
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentTests.length >= 2) {
      const firstHalf = recentTests.slice(0, Math.floor(recentTests.length / 2));
      const secondHalf = recentTests.slice(Math.floor(recentTests.length / 2));
      const firstAvg = firstHalf.reduce((sum, t) => sum + t.percentage, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, t) => sum + t.percentage, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 5) trend = 'improving';
      else if (secondAvg < firstAvg - 5) trend = 'declining';
    }

    // Calculate recent difficulty
    const recentDifficulty = adaptiveDifficultyService.calculateDifficultyLevel(recentTests);

    return {
      averageScore,
      trend,
      recentDifficulty,
      mockExamCount: mockExams.length
    };
  }

  // Track topic improvement
  private trackTopicImprovement(topic: string, userHistory: TestResult[]): {
    currentMastery: number;
    previousMastery: number;
    improvement: number;
    trend: 'improving' | 'declining' | 'stable';
  } {
    // Get tests for this topic
    const topicTests = userHistory.filter(test => {
      const subject = this.topicMapping[test.testId] || test.testId;
      return subject === topic;
    });

    if (topicTests.length < 2) {
      const mastery = topicTests.length > 0 ? topicTests[0].percentage : 0;
      return {
        currentMastery: mastery,
        previousMastery: mastery,
        improvement: 0,
        trend: 'stable'
      };
    }

    // Split into recent and older
    const recentCount = Math.ceil(topicTests.length / 2);
    const recentTests = topicTests.slice(-recentCount);
    const olderTests = topicTests.slice(0, topicTests.length - recentCount);

    const currentMastery = recentTests.reduce((sum, t) => sum + t.percentage, 0) / recentTests.length;
    const previousMastery = olderTests.reduce((sum, t) => sum + t.percentage, 0) / olderTests.length;
    const improvement = currentMastery - previousMastery;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (improvement > 10) trend = 'improving';
    else if (improvement < -10) trend = 'declining';

    return {
      currentMastery,
      previousMastery,
      improvement,
      trend
    };
  }

  // Analyze weak areas from user history (ENHANCED with mastery and improvement)
  analyzeWeakAreas(userHistory: TestResult[]): WeakArea[] {
    // Group by topic
    const topicScores: Record<string, { scores: number[]; count: number; dates: string[] }> = {};

    userHistory.forEach(test => {
      const subject = this.topicMapping[test.testId] || test.testId;
      if (!topicScores[subject]) {
        topicScores[subject] = { scores: [], count: 0, dates: [] };
      }
      topicScores[subject].scores.push(test.percentage);
      topicScores[subject].count += 1;
      topicScores[subject].dates.push(test.date);
    });

    // Calculate averages and identify weak areas (<60%)
    const weakAreas: WeakArea[] = [];
    Object.entries(topicScores).forEach(([topic, data]) => {
      const average = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      
      // Enhanced: Calculate urgency score
      // Factor 1: Average score (lower = more urgent)
      const scoreUrgency = Math.max(0, 60 - average);
      
      // Factor 2: Consistency (high variance = unstable = more urgent)
      const mean = average;
      const variance = data.scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / data.scores.length;
      const consistencyUrgency = Math.min(20, variance / 10);
      
      // Factor 3: Trend (declining = more urgent)
      let trendUrgency = 0;
      if (data.scores.length >= 2) {
        const firstHalf = data.scores.slice(0, Math.floor(data.scores.length / 2));
        const secondHalf = data.scores.slice(Math.floor(data.scores.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const trend = firstAvg - secondAvg; // Positive = declining
        trendUrgency = Math.max(0, trend); // Declining = more urgent
      }
      
      // Factor 4: Recent performance (recent tests weighted more)
      const recentWeight = 1.5;
      const oldWeight = 1.0;
      let weightedAverage = average;
      if (data.scores.length >= 2) {
        const recentScores = data.scores.slice(-Math.ceil(data.scores.length / 2));
        const oldScores = data.scores.slice(0, Math.floor(data.scores.length / 2));
        const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        const oldAvg = oldScores.length > 0 ? oldScores.reduce((a, b) => a + b, 0) / oldScores.length : average;
        weightedAverage = (recentAvg * recentWeight + oldAvg * oldWeight) / (recentWeight + oldWeight);
      }
      
      // Identify weak areas (<60% average or <60% weighted average)
      if (average < 60 || weightedAverage < 60) {
        const urgency = scoreUrgency + consistencyUrgency + trendUrgency;
        
        // Get mastery and improvement tracking
        const mastery = Math.round(weightedAverage);
        const improvement = this.trackTopicImprovement(topic, userHistory);
        
        // Adjust urgency based on improvement
        let adjustedUrgency = urgency;
        if (improvement.trend === 'improving' && improvement.improvement > 10) {
          // User is improving - reduce urgency slightly
          adjustedUrgency = urgency * 0.7;
        } else if (improvement.trend === 'declining') {
          // User is declining - increase urgency
          adjustedUrgency = urgency * 1.3;
        }
        
        weakAreas.push({
          topic,
          score: mastery,
          count: data.count,
          urgency: Math.round(adjustedUrgency * 10) / 10,
          mastery: mastery,
          improvement: improvement.improvement
        } as WeakArea);
      }
    });

    // Sort by urgency (worst + declining + unstable = highest priority)
    return weakAreas.sort((a, b) => {
      const aUrgency = a.urgency || 0;
      const bUrgency = b.urgency || 0;
      if (aUrgency !== bUrgency) return bUrgency - aUrgency;
      // Tie-breaker: lower mastery first
      const aMastery = a.mastery || a.score;
      const bMastery = b.mastery || b.score;
      return aMastery - bMastery;
    });
  }

  // Generate personalized mock exam FROM REAL CBR QUESTIONS ONLY
  // MAINTAINS CBR STRUCTURE: 25 questions (15 regular + 10 image)
  generatePersonalizedExam(
    examId: string,
    userHistory: TestResult[],
    difficultyLevel?: number,
    userId?: string
  ): { questions: RealExamQuestion[]; config: DynamicExamConfig } {
    // Step 1: Get ALL real exam questions
    const allRealQuestions: RealExamQuestion[] = [
      ...realExamQuestions,
      ...mockExamImageQuestions
    ];

    // Step 2: Filter out recently seen questions (prevent repeats)
    const availableQuestions = this.filterUnseenQuestions(allRealQuestions, userId);

    // Step 3: Analyze weak areas (with mastery and improvement tracking)
    const weakAreas = this.analyzeWeakAreas(userHistory);
    const focusAreas = weakAreas.slice(0, 3).map(area => area.topic);

    // Step 4: Get recent performance for difficulty adjustment
    const recentPerformance = this.getRecentPerformance(userHistory);
    
    // Step 5: Adjust difficulty based on recent performance
    let adjustedDifficulty = difficultyLevel || recentPerformance.recentDifficulty;
    if (recentPerformance.trend === 'improving') {
      adjustedDifficulty = Math.min(10, adjustedDifficulty + 1);
    } else if (recentPerformance.trend === 'declining') {
      adjustedDifficulty = Math.max(1, adjustedDifficulty - 1);
    }

    // Step 6: Filter available questions by weak areas (enhanced matching)
    // Weight by mastery: lower mastery = higher priority
    const weakAreaQuestions = availableQuestions.filter(q => {
      const questionSubject = q.subject || '';
      return focusAreas.some(area => {
        // Exact match
        if (questionSubject === area) return true;
        // Partial match (case insensitive)
        if (questionSubject.toLowerCase().includes(area.toLowerCase()) ||
            area.toLowerCase().includes(questionSubject.toLowerCase())) {
          return true;
        }
        // Check if question has topics array
        if ((q as any).topics && Array.isArray((q as any).topics)) {
          return (q as any).topics.some((topic: string) => 
            topic.toLowerCase().includes(area.toLowerCase()) ||
            area.toLowerCase().includes(topic.toLowerCase())
          );
        }
        return false;
      });
    });

    // Step 7: Weight questions by mastery level
    const weightedWeakQuestions = weakAreaQuestions.map(q => {
      const questionTopic = q.subject || '';
      const weakArea = weakAreas.find(wa => 
        wa.topic === questionTopic ||
        questionTopic.toLowerCase().includes(wa.topic.toLowerCase()) ||
        wa.topic.toLowerCase().includes(questionTopic.toLowerCase())
      );
      
      // Lower mastery = higher weight (30% mastery = 70 weight, 55% mastery = 45 weight)
      const mastery = weakArea?.mastery || weakArea?.score || 50;
      const weight = 100 - mastery;
      
      return { question: q, weight, mastery };
    }).sort((a, b) => b.weight - a.weight); // Highest weight first

    // Step 8: Get medium/strong area questions (also from available pool)
    const mediumAreaQuestions = availableQuestions.filter(q => {
      const questionSubject = q.subject || '';
      return !focusAreas.some(area => 
        questionSubject === area ||
        questionSubject.toLowerCase().includes(area.toLowerCase())
      );
    });

    // Step 9: Smart distribution based on weak area count and mastery
    // Weight distribution: Lower mastery topics get more questions
    const weakAreaCount = weakAreas.length;
    let weakPercentage = 0.5; // Default 50%
    
    if (weakAreaCount === 1) {
      weakPercentage = 0.7; // 70% from weak area if only one
    } else if (weakAreaCount <= 3) {
      weakPercentage = 0.6; // 60% from weak areas if 2-3
    }
    // else 50% if 4+ weak areas (balanced)
    
    // Calculate distribution maintaining CBR structure (15 regular + 10 image)
    const totalWeakCount = Math.floor(this.CBR_STRUCTURE.TOTAL_QUESTIONS * weakPercentage);
    
    // Distribute weak area questions: 60% regular, 40% image (maintains CBR ratio)
    const regularFromWeakCount = Math.floor(totalWeakCount * 0.6);
    const imageFromWeakCount = totalWeakCount - regularFromWeakCount;
    
    // Select from weighted questions (highest weight = lowest mastery = priority)
    const regularFromWeak = weightedWeakQuestions
      .filter(wq => !wq.question.imageUrl)
      .slice(0, regularFromWeakCount)
      .map(wq => wq.question);

    const imageFromWeak = weightedWeakQuestions
      .filter(wq => wq.question.imageUrl)
      .slice(0, imageFromWeakCount)
      .map(wq => wq.question);

    // Step 10: Fill remaining slots to maintain CBR structure (15 regular + 10 image = 25 total)
    const regularNeeded = this.CBR_STRUCTURE.REGULAR_QUESTIONS - regularFromWeak.length;
    const imageNeeded = this.CBR_STRUCTURE.IMAGE_QUESTIONS - imageFromWeak.length;
    
    let regularQuestions = [...regularFromWeak];
    if (regularNeeded > 0) {
      const fillFrom = mediumAreaQuestions
        .filter(q => !q.imageUrl)
        .slice(0, regularNeeded);
      regularQuestions = [...regularQuestions, ...fillFrom];
    }

    let imageQuestions = [...imageFromWeak];
    if (imageNeeded > 0) {
      const fillFrom = mediumAreaQuestions
        .filter(q => q.imageUrl)
        .slice(0, imageNeeded);
      imageQuestions = [...imageQuestions, ...fillFrom];
    }

    // Step 11: Balance difficulty based on adjusted difficulty (considers recent performance)
    let finalQuestions: RealExamQuestion[] = [...regularQuestions, ...imageQuestions];
    
    if (adjustedDifficulty) {
      finalQuestions = this.balanceDifficulty(finalQuestions, adjustedDifficulty);
    }

    // Step 12: Ensure CBR structure is maintained (15 regular + 10 image = 25 total)
    // Re-verify structure after difficulty balancing
    const finalRegular = finalQuestions.filter(q => !q.imageUrl);
    const finalImage = finalQuestions.filter(q => q.imageUrl);
    
    // If structure is broken, fix it
    if (finalRegular.length !== this.CBR_STRUCTURE.REGULAR_QUESTIONS || 
        finalImage.length !== this.CBR_STRUCTURE.IMAGE_QUESTIONS) {
      // Rebuild maintaining structure
      const neededRegular = this.CBR_STRUCTURE.REGULAR_QUESTIONS - finalRegular.length;
      const neededImage = this.CBR_STRUCTURE.IMAGE_QUESTIONS - finalImage.length;
      
      if (neededRegular > 0) {
        const fillRegular = availableQuestions
          .filter(q => !q.imageUrl && !finalQuestions.includes(q))
          .slice(0, neededRegular);
        finalQuestions = [...finalRegular, ...finalImage, ...fillRegular];
      }
      
      if (neededImage > 0) {
        const fillImage = availableQuestions
          .filter(q => q.imageUrl && !finalQuestions.includes(q))
          .slice(0, neededImage);
        finalQuestions = [...finalQuestions, ...fillImage];
      }
      
      // Limit to exactly 25
      finalQuestions = finalQuestions.slice(0, this.CBR_STRUCTURE.TOTAL_QUESTIONS);
    }

    // Step 13: Shuffle to randomize order (maintains CBR structure)
    finalQuestions = this.shuffleArray(finalQuestions);

    // Calculate personalization level
    const personalizationLevel = Math.min(100, 
      Math.round((regularFromWeak.length + imageFromWeak.length) / 25 * 100)
    );

    // Create config
    const config: DynamicExamConfig = {
      examId,
      focusAreas,
      difficultyDistribution: this.calculateDifficultyDistribution(finalQuestions),
      personalizationLevel,
      generatedAt: new Date()
    };

    return { questions: finalQuestions, config };
  }

  // Balance difficulty distribution (MAINTAINS CBR STRUCTURE: 15 regular + 10 image)
  private balanceDifficulty(
    questions: RealExamQuestion[],
    difficultyLevel: number
  ): RealExamQuestion[] {
    // Separate by difficulty AND type (regular vs image)
    const easyRegular = questions.filter(q => q.difficulty === 'easy' && !q.imageUrl);
    const easyImage = questions.filter(q => q.difficulty === 'easy' && q.imageUrl);
    const mediumRegular = questions.filter(q => q.difficulty === 'medium' && !q.imageUrl);
    const mediumImage = questions.filter(q => q.difficulty === 'medium' && q.imageUrl);
    const hardRegular = questions.filter(q => q.difficulty === 'hard' && !q.imageUrl);
    const hardImage = questions.filter(q => q.difficulty === 'hard' && q.imageUrl);

    // Target distribution based on difficulty level
    // Always maintain: 15 regular + 10 image = 25 total
    let targetEasyRegular = 0, targetEasyImage = 0;
    let targetMediumRegular = 0, targetMediumImage = 0;
    let targetHardRegular = 0, targetHardImage = 0;

    if (difficultyLevel <= 3) {
      // Beginner: More easy questions
      targetEasyRegular = 8; targetEasyImage = 4; // 12 easy total
      targetMediumRegular = 7; targetMediumImage = 6; // 13 medium total
      targetHardRegular = 0; targetHardImage = 0; // 0 hard
    } else if (difficultyLevel <= 6) {
      // Intermediate: Balanced
      targetEasyRegular = 3; targetEasyImage = 2; // 5 easy total
      targetMediumRegular = 9; targetMediumImage = 6; // 15 medium total
      targetHardRegular = 3; targetHardImage = 2; // 5 hard total
    } else if (difficultyLevel <= 8) {
      // Advanced: More hard questions
      targetEasyRegular = 1; targetEasyImage = 1; // 2 easy total
      targetMediumRegular = 6; targetMediumImage = 6; // 12 medium total
      targetHardRegular = 8; targetHardImage = 3; // 11 hard total
    } else {
      // Expert: Mostly hard
      targetEasyRegular = 0; targetEasyImage = 0; // 0 easy
      targetMediumRegular = 4; targetMediumImage = 3; // 7 medium total
      targetHardRegular = 11; targetHardImage = 7; // 18 hard total
    }

    const selected: RealExamQuestion[] = [];
    
    // Select maintaining CBR structure (15 regular + 10 image)
    selected.push(...this.shuffleArray(easyRegular).slice(0, Math.min(targetEasyRegular, easyRegular.length)));
    selected.push(...this.shuffleArray(easyImage).slice(0, Math.min(targetEasyImage, easyImage.length)));
    selected.push(...this.shuffleArray(mediumRegular).slice(0, Math.min(targetMediumRegular, mediumRegular.length)));
    selected.push(...this.shuffleArray(mediumImage).slice(0, Math.min(targetMediumImage, mediumImage.length)));
    selected.push(...this.shuffleArray(hardRegular).slice(0, Math.min(targetHardRegular, hardRegular.length)));
    selected.push(...this.shuffleArray(hardImage).slice(0, Math.min(targetHardImage, hardImage.length)));

    // Fill remaining to maintain CBR structure
    const selectedRegular = selected.filter(q => !q.imageUrl);
    const selectedImage = selected.filter(q => q.imageUrl);
    
    const regularNeeded = this.CBR_STRUCTURE.REGULAR_QUESTIONS - selectedRegular.length;
    const imageNeeded = this.CBR_STRUCTURE.IMAGE_QUESTIONS - selectedImage.length;

    // Fill regular questions
    if (regularNeeded > 0) {
      const allRegular = [...easyRegular, ...mediumRegular, ...hardRegular]
        .filter(q => !selected.includes(q));
      selected.push(...this.shuffleArray(allRegular).slice(0, regularNeeded));
    }

    // Fill image questions
    if (imageNeeded > 0) {
      const allImage = [...easyImage, ...mediumImage, ...hardImage]
        .filter(q => !selected.includes(q));
      selected.push(...this.shuffleArray(allImage).slice(0, imageNeeded));
    }

    // Final check: ensure exactly 15 regular + 10 image
    const finalRegular = selected.filter(q => !q.imageUrl);
    const finalImage = selected.filter(q => q.imageUrl);
    
    if (finalRegular.length !== this.CBR_STRUCTURE.REGULAR_QUESTIONS || 
        finalImage.length !== this.CBR_STRUCTURE.IMAGE_QUESTIONS) {
      // Rebuild to maintain structure
      const allAvailable = [...easyRegular, ...easyImage, ...mediumRegular, ...mediumImage, ...hardRegular, ...hardImage]
        .filter(q => !selected.includes(q));
      
      // Take first 15 regular and 10 image from available
      const neededRegular = this.CBR_STRUCTURE.REGULAR_QUESTIONS - finalRegular.length;
      const neededImage = this.CBR_STRUCTURE.IMAGE_QUESTIONS - finalImage.length;
      
      const fillRegular = allAvailable.filter(q => !q.imageUrl).slice(0, neededRegular);
      const fillImage = allAvailable.filter(q => q.imageUrl).slice(0, neededImage);
      
      return [...finalRegular, ...finalImage, ...fillRegular, ...fillImage].slice(0, this.CBR_STRUCTURE.TOTAL_QUESTIONS);
    }

    return selected.slice(0, this.CBR_STRUCTURE.TOTAL_QUESTIONS);
  }

  // Calculate difficulty distribution
  private calculateDifficultyDistribution(questions: RealExamQuestion[]): {
    easy: number;
    medium: number;
    hard: number;
  } {
    return {
      easy: questions.filter(q => q.difficulty === 'easy').length,
      medium: questions.filter(q => q.difficulty === 'medium').length,
      hard: questions.filter(q => q.difficulty === 'hard').length
    };
  }

  // Get focus areas for display
  getFocusAreas(userHistory: TestResult[]): string[] {
    const weakAreas = this.analyzeWeakAreas(userHistory);
    return weakAreas.slice(0, 3).map(area => area.topic);
  }

  // Analyze exam results
  analyzeExamResults(
    examResults: { score: number; total: number; answers: Record<number, { correct: boolean; topic: string }> },
    userHistory: TestResult[]
  ): { summary: string; recommendations: string[] } {
    const percentage = Math.round((examResults.score / examResults.total) * 100);
    const weakAreas = this.analyzeWeakAreas(userHistory);

    let summary = '';
    if (percentage >= 80) {
      summary = 'Excellent performance! You\'re well prepared for the real exam.';
    } else if (percentage >= 60) {
      summary = 'Good progress! Keep practicing to improve your weak areas.';
    } else {
      summary = 'Keep practicing! Focus on your weak areas to improve.';
    }

    const recommendations: string[] = [];
    if (weakAreas.length > 0) {
      recommendations.push(`Focus on: ${weakAreas[0].topic} (current: ${weakAreas[0].score}%)`);
    }
    if (percentage < 60) {
      recommendations.push('Take more practice tests before attempting the real exam');
    }
    if (percentage >= 60 && percentage < 80) {
      recommendations.push('Take 1-2 more mock exams to build confidence');
    }

    return { summary, recommendations };
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

export const dynamicMockExamService = new DynamicMockExamService();

