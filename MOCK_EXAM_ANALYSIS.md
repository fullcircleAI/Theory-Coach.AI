# Dynamic Mock Exam Generator - Requirements vs Current Implementation

## 📋 REQUIREMENTS

1. **Pull questions weighted by user's weak areas (topics with low mastery)**
2. **Match real CBR structure:** Same number of questions, difficulty mix, and timing
3. **Avoid repeats** - Don't show same questions in multiple mocks
4. **Adjust difficulty based on recent performance**
5. **Every mock is unique** and increasingly aligned to user's needs
6. **Use real CBR exam questions as much as possible**

---

## ✅ CURRENT IMPLEMENTATION ANALYSIS

### ✅ **What's Working:**

1. **Uses Real CBR Questions Only** ✅
   - Only pulls from `realExamQuestions` and `mockExamImageQuestions`
   - No question generation
   - All questions are real exam questions

2. **Weak Area Analysis** ✅
   - Analyzes user history to identify weak areas (< 60%)
   - Uses urgency scoring (score, consistency, trend, weighted averages)
   - Sorts by urgency (worst first)

3. **CBR Structure** ✅
   - 25 questions total (15 regular + 10 image)
   - Difficulty distribution based on user level
   - Matches real exam format

4. **Difficulty Balancing** ✅
   - Adjusts based on user's difficulty level (1-10)
   - Distributes easy/medium/hard based on level

5. **Personalization** ✅
   - Focuses on weak areas (50-70% from weak areas)
   - Uses topic mapping to match practice tests to exam subjects

---

## ❌ **GAPS IDENTIFIED:**

### **1. No Repeat Prevention** ❌
**Problem:** Same questions can appear in multiple mock exams
- No tracking of previously shown questions
- User might see same question multiple times
- Reduces uniqueness

**Impact:**
- User memorizes answers instead of learning
- Not truly unique mocks
- Poor learning experience

### **2. Not Weighted by Mastery** ⚠️
**Problem:** Uses weak areas but doesn't weight by mastery level
- Currently: Uses weak areas (< 60%) equally
- Should: Weight by mastery level (lower mastery = more questions)
- Example: 30% mastery should get more questions than 55% mastery

**Impact:**
- Doesn't prioritize worst areas enough
- Equal distribution across weak areas regardless of severity

### **3. No Recent Performance Tracking** ⚠️
**Problem:** Difficulty adjustment doesn't consider recent trends
- Uses overall difficulty level
- Doesn't track if user is improving/declining recently
- Should adjust based on last 3-5 mock exams

**Impact:**
- Difficulty might be too easy/hard if user improved recently
- Doesn't adapt to rapid changes in performance

### **4. Timing Not Considered** ❌
**Problem:** CBR has time limits per question, but not enforced
- Real CBR: 72 seconds per question average
- Current: No time limit tracking or enforcement
- Should: Match real exam timing structure

**Impact:**
- Doesn't match real exam experience
- User might not be prepared for time pressure

### **5. Not Increasingly Aligned** ⚠️
**Problem:** Doesn't track improvement over time
- Same weak areas recommended even if user improved
- Should: Reduce focus on areas user is improving in
- Should: Increase focus on areas still struggling

**Impact:**
- Doesn't adapt as user improves
- Stuck on same topics even after improvement

### **6. No Question History Tracking** ❌
**Problem:** No system to track which questions user has seen
- Can't prevent repeats
- Can't track question performance
- Can't identify questions user struggles with

**Impact:**
- Same questions appear multiple times
- Can't personalize based on question-level performance

---

## 🎯 IMPROVEMENT PLAN

### **Phase 1: Repeat Prevention & Question History**

#### **1.1 Track Question History**
```typescript
interface QuestionHistory {
  questionId: string;
  seenCount: number;
  lastSeen: Date;
  correctCount: number;
  incorrectCount: number;
  averageTime: number;
  topics: string[];
}

// Store in localStorage or user profile
getQuestionHistory(userId: string): QuestionHistory[]
```

#### **1.2 Filter Previously Seen Questions**
```typescript
generatePersonalizedExam() {
  // Get question history
  const questionHistory = this.getQuestionHistory(userId);
  const seenQuestionIds = new Set(questionHistory.map(q => q.questionId));
  
  // Filter out recently seen questions (within last 3 mocks)
  const availableQuestions = allRealQuestions.filter(q => {
    const history = questionHistory.find(h => h.questionId === q.id);
    if (!history) return true; // Never seen
    if (history.seenCount >= 3) return false; // Seen too many times
    // Don't show if seen in last 2 mocks
    const daysSinceLastSeen = (Date.now() - new Date(history.lastSeen).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastSeen > 7; // At least 7 days ago
  });
}
```

### **Phase 2: Mastery-Weighted Selection**

#### **2.1 Calculate Mastery Per Topic**
```typescript
getTopicMastery(topic: string, userHistory: TestResult[]): number {
  // Use adaptiveDifficultyService.getTopicMastery()
  // Returns 0-100% mastery
}
```

#### **2.2 Weight Questions by Mastery**
```typescript
weightQuestionsByMastery(questions: RealExamQuestion[], weakAreas: WeakArea[]): RealExamQuestion[] {
  return questions.map(q => {
    const topic = q.subject;
    const weakArea = weakAreas.find(wa => wa.topic === topic);
    const mastery = weakArea ? weakArea.score : 100;
    
    // Lower mastery = higher weight
    const weight = 100 - mastery; // 0% mastery = 100 weight, 60% mastery = 40 weight
    
    return { question: q, weight };
  }).sort((a, b) => b.weight - a.weight);
}
```

### **Phase 3: Recent Performance Tracking**

#### **3.1 Track Recent Performance**
```typescript
getRecentPerformance(userHistory: TestResult[], days: number = 7): {
  averageScore: number;
  trend: 'improving' | 'declining' | 'stable';
  recentDifficulty: number;
} {
  const recentTests = userHistory.filter(test => {
    const testDate = new Date(test.date);
    const daysAgo = (Date.now() - testDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= days;
  });
  
  // Calculate trend
  if (recentTests.length >= 2) {
    const firstHalf = recentTests.slice(0, Math.floor(recentTests.length / 2));
    const secondHalf = recentTests.slice(Math.floor(recentTests.length / 2));
    const firstAvg = firstHalf.reduce((sum, t) => sum + t.percentage, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, t) => sum + t.percentage, 0) / secondHalf.length;
    const trend = secondAvg > firstAvg + 5 ? 'improving' : 
                  secondAvg < firstAvg - 5 ? 'declining' : 'stable';
  }
  
  return { averageScore, trend, recentDifficulty };
}
```

#### **3.2 Adjust Difficulty Based on Recent Performance**
```typescript
adjustDifficultyForRecentPerformance(baseDifficulty: number, recentPerformance: RecentPerformance): number {
  if (recentPerformance.trend === 'improving') {
    return Math.min(10, baseDifficulty + 1); // Increase difficulty
  } else if (recentPerformance.trend === 'declining') {
    return Math.max(1, baseDifficulty - 1); // Decrease difficulty
  }
  return baseDifficulty;
}
```

### **Phase 4: Timing Structure**

#### **4.1 Match CBR Timing**
```typescript
interface CBRTiming {
  totalTime: number; // 30 minutes = 1800 seconds
  timePerQuestion: number; // 72 seconds average
  timeLimit: number; // Hard limit per question
}

const CBR_TIMING: CBRTiming = {
  totalTime: 1800, // 30 minutes
  timePerQuestion: 72, // Average
  timeLimit: 90 // Max per question
};
```

#### **4.2 Apply Timing to Questions**
```typescript
// Each RealExamQuestion already has timeLimit property
// Use it in MockExam component to enforce timing
```

### **Phase 5: Increasing Alignment**

#### **5.1 Track Improvement Per Topic**
```typescript
trackTopicImprovement(topic: string, userHistory: TestResult[]): {
  currentMastery: number;
  previousMastery: number;
  improvement: number;
  trend: 'improving' | 'declining' | 'stable';
} {
  // Compare recent vs older performance
  // Identify if user is improving in this topic
}
```

#### **5.2 Adjust Focus Based on Improvement**
```typescript
adjustFocusAreas(weakAreas: WeakArea[], userHistory: TestResult[]): WeakArea[] {
  return weakAreas.map(area => {
    const improvement = this.trackTopicImprovement(area.topic, userHistory);
    
    // Reduce weight if improving
    if (improvement.trend === 'improving' && improvement.improvement > 10) {
      area.urgency = area.urgency * 0.7; // Reduce urgency
    }
    
    // Increase weight if declining
    if (improvement.trend === 'declining') {
      area.urgency = area.urgency * 1.3; // Increase urgency
    }
    
    return area;
  }).sort((a, b) => b.urgency - a.urgency);
}
```

---

## 📊 IMPLEMENTATION PRIORITY

### **High Priority (Must Have):**
1. ✅ Repeat prevention (question history tracking)
2. ✅ Mastery-weighted selection
3. ✅ Recent performance tracking

### **Medium Priority (Should Have):**
4. ⚠️ Timing structure matching
5. ⚠️ Increasing alignment (improvement tracking)

### **Low Priority (Nice to Have):**
6. ⚠️ Advanced analytics
7. ⚠️ Question-level performance tracking

---

## ✅ SUMMARY

**Current State:** Good foundation, uses real questions, focuses on weak areas
**Missing:** Repeat prevention, mastery weighting, recent performance, timing, improvement tracking
**Next Steps:** Implement repeat prevention and mastery weighting first

