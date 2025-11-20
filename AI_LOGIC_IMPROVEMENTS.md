# AI Logic Improvements for Adaptive Questions & Dynamic Mock Exams

## 📊 **CURRENT STATE ANALYSIS**

### ✅ **What's Working:**
1. **Adaptive Difficulty Service** - Basic implementation exists
2. **Dynamic Mock Exam Service** - Basic implementation exists
3. **Real-time difficulty adjustment** - Implemented in PracticeTest
4. **Weak area analysis** - Working for mock exams

### ⚠️ **Issues Identified:**

#### **1. Question Difficulty Tagging**
**Problem:** Practice test questions don't have `difficulty` tags
- Only `realExamQuestions` have difficulty tags
- Practice questions (from `questionData`) don't have difficulty
- Adaptive selection may not work properly

**Impact:** 
- Adaptive learning can't filter practice questions by difficulty
- Questions may be too easy/hard for user's level

#### **2. Topic Mapping for Dynamic Mock Exams**
**Problem:** Topic mapping may not match all practice tests
- Some practice test IDs may not be in `topicMapping`
- Questions may not have `subject` or `topics` fields

**Impact:**
- Weak areas may not be correctly identified
- Mock exams may not focus on correct topics

#### **3. Difficulty Calculation Logic**
**Current:** Based on average score only
**Issue:** Doesn't consider:
- Time spent per question
- Question difficulty attempted
- Topic-specific performance

#### **4. Question Selection Logic**
**Current:** Filters by difficulty tag (if exists)
**Issue:** 
- Practice questions don't have tags
- Falls back to random selection
- No topic prioritization

---

## 🎯 **IMPROVEMENT PLAN**

### **Phase 1: Enhance Question Tagging**

#### **1.1 Add Difficulty Tags to Practice Questions**
**File:** `src/question_data/*.ts`

**Approach:**
- Auto-tag based on pass rate (if available)
- Tag based on question complexity
- Use heuristics: length, options complexity, explanation length

**Implementation:**
```typescript
// Add difficulty calculation function
function calculateQuestionDifficulty(question: Question): 'easy' | 'medium' | 'hard' {
  // Heuristic 1: Text length
  const textLength = question.text.length;
  
  // Heuristic 2: Options complexity
  const hasLongOptions = question.options.some(opt => opt.text.length > 50);
  
  // Heuristic 3: Explanation length (longer = harder)
  const explanationLength = question.explanation?.length || 0;
  
  // Scoring
  let score = 0;
  if (textLength > 150) score += 1;
  if (hasLongOptions) score += 1;
  if (explanationLength > 200) score += 1;
  
  if (score === 0) return 'easy';
  if (score <= 2) return 'medium';
  return 'hard';
}
```

#### **1.2 Add Topic Tags to All Questions**
**File:** `src/question_data/*.ts`

**Approach:**
- Use `subject` field (already exists in some)
- Map practice test IDs to topics
- Ensure all questions have topic/subject

---

### **Phase 2: Improve Adaptive Difficulty Logic**

#### **2.1 Enhanced Difficulty Calculation**
**File:** `src/services/adaptiveDifficultyService.ts`

**Improvements:**
```typescript
calculateDifficultyLevel(userHistory: TestResult[]): number {
  // Current: Based on average score
  // Enhanced: Add these factors:
  
  // 1. Time-based performance
  const avgTimePerQuestion = calculateAverageTime(userHistory);
  
  // 2. Consistency across topics
  const topicConsistency = calculateTopicConsistency(userHistory);
  
  // 3. Recent improvement rate
  const improvementRate = calculateImprovementRate(userHistory);
  
  // 4. Question difficulty attempted
  const maxDifficultyAttempted = getMaxDifficultyAttempted(userHistory);
  
  // Combine all factors
  return weightedAverage([
    averageScore,        // 40% weight
    avgTimePerQuestion,  // 20% weight
    topicConsistency,     // 20% weight
    improvementRate,      // 10% weight
    maxDifficultyAttempted // 10% weight
  ]);
}
```

#### **2.2 Topic-Aware Question Selection**
**File:** `src/services/adaptiveDifficultyService.ts`

**Current:** Selects questions by difficulty only
**Enhanced:** Prioritize weak topics within difficulty level

```typescript
selectAdaptiveQuestions(
  allQuestions: Question[],
  difficultyLevel: number,
  count: number,
  weakTopics?: string[] // NEW: Focus on weak topics
): Question[] {
  // Step 1: Filter by difficulty (existing)
  const difficultyFiltered = filterByDifficulty(allQuestions, difficultyLevel);
  
  // Step 2: Prioritize weak topics (NEW)
  if (weakTopics && weakTopics.length > 0) {
    const weakTopicQuestions = difficultyFiltered.filter(q => 
      weakTopics.includes(q.subject || q.topic)
    );
    
    // 60% from weak topics, 40% from others
    const weakCount = Math.floor(count * 0.6);
    const otherCount = count - weakCount;
    
    return [
      ...shuffle(weakTopicQuestions).slice(0, weakCount),
      ...shuffle(difficultyFiltered).slice(0, otherCount)
    ];
  }
  
  // Fallback to existing logic
  return shuffle(difficultyFiltered).slice(0, count);
}
```

#### **2.3 Smarter Real-Time Adjustment**
**File:** `src/services/adaptiveDifficultyService.ts`

**Enhancement:** Consider question difficulty when adjusting

```typescript
adjustDifficultyAfterAnswer(
  currentLevel: number,
  wasCorrect: boolean,
  timeSpent: number,
  questionDifficulty?: 'easy' | 'medium' | 'hard' // NEW
): number {
  // Current logic
  let adjustment = 0;
  
  // Enhanced: Consider question difficulty
  if (questionDifficulty) {
    const difficultyWeight = {
      'easy': 0.5,    // Easy questions = less impact
      'medium': 1.0,  // Medium = normal impact
      'hard': 1.5     // Hard questions = more impact
    };
    
    const weight = difficultyWeight[questionDifficulty];
    
    if (wasCorrect) {
      adjustment = (timeSpent < 30 ? 0.5 : 0.2) * weight;
    } else {
      adjustment = (timeSpent < 30 ? -0.5 : -0.3) * weight;
    }
  } else {
    // Fallback to existing logic
    // ... existing code
  }
  
  return Math.max(1, Math.min(10, currentLevel + adjustment));
}
```

---

### **Phase 3: Enhance Dynamic Mock Exam Logic**

#### **3.1 Improved Weak Area Analysis**
**File:** `src/services/dynamicMockExamService.ts`

**Enhancements:**
```typescript
analyzeWeakAreas(userHistory: TestResult[]): WeakArea[] {
  // Current: Groups by topic, calculates average
  // Enhanced: Add these factors:
  
  // 1. Recent performance weight (recent tests matter more)
  const recentWeight = 1.5;
  const oldWeight = 1.0;
  
  // 2. Consistency check (high variance = unstable)
  const calculateVariance = (scores: number[]) => {
    const mean = scores.reduce((a, b) => a + b) / scores.length;
    return scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  };
  
  // 3. Trend analysis (getting worse = more urgent)
  const calculateTrend = (scores: number[]) => {
    if (scores.length < 2) return 0;
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    return (secondHalf.reduce((a, b) => a + b) / secondHalf.length) - 
           (firstHalf.reduce((a, b) => a + b) / firstHalf.length);
  };
  
  // Enhanced scoring
  weakAreas.forEach(area => {
    area.urgency = calculateUrgency(area.score, area.variance, area.trend);
  });
  
  // Sort by urgency (worst + declining = highest priority)
  return weakAreas.sort((a, b) => b.urgency - a.urgency);
}
```

#### **3.2 Better Question Distribution**
**File:** `src/services/dynamicMockExamService.ts`

**Current:** 15 regular + 10 image from weak areas
**Enhanced:** Smart distribution based on weak area count

```typescript
generatePersonalizedExam(
  examId: string,
  userHistory: TestResult[],
  difficultyLevel?: number
): { questions: RealExamQuestion[]; config: DynamicExamConfig } {
  const weakAreas = this.analyzeWeakAreas(userHistory);
  
  // Enhanced distribution:
  // - If 1 weak area: 70% from weak, 30% balanced
  // - If 2-3 weak areas: 60% from weak, 40% balanced
  // - If 4+ weak areas: 50% from weak, 50% balanced
  
  const weakAreaCount = weakAreas.length;
  let weakPercentage = 0.5; // Default 50%
  
  if (weakAreaCount === 1) weakPercentage = 0.7;
  else if (weakAreaCount <= 3) weakPercentage = 0.6;
  
  const weakCount = Math.floor(25 * weakPercentage);
  const balancedCount = 25 - weakCount;
  
  // Select questions
  const weakQuestions = selectFromWeakAreas(weakAreas, weakCount);
  const balancedQuestions = selectBalancedQuestions(balancedCount);
  
  return [...weakQuestions, ...balancedQuestions];
}
```

#### **3.3 Difficulty Balancing for Mock Exams**
**File:** `src/services/dynamicMockExamService.ts`

**Enhancement:** Better difficulty distribution based on user level

```typescript
private balanceDifficulty(
  questions: RealExamQuestion[],
  difficultyLevel: number
): RealExamQuestion[] {
  // Current: Fixed percentages
  // Enhanced: Adaptive based on user's improvement rate
  
  const improvementRate = this.calculateImprovementRate(userHistory);
  
  // If improving fast: Slightly harder
  // If stable: Current level
  // If declining: Slightly easier
  
  let easyPct = 0.2, mediumPct = 0.5, hardPct = 0.3;
  
  if (improvementRate > 5) {
    // Improving: Shift to harder
    easyPct = 0.1;
    mediumPct = 0.4;
    hardPct = 0.5;
  } else if (improvementRate < -5) {
    // Declining: Shift to easier
    easyPct = 0.3;
    mediumPct = 0.5;
    hardPct = 0.2;
  }
  
  // Apply distribution
  // ... existing selection logic
}
```

---

## 🔧 **IMPLEMENTATION PRIORITY**

### **High Priority (Core Functionality)**
1. ✅ Add difficulty tags to practice questions
2. ✅ Improve topic mapping completeness
3. ✅ Enhance weak area analysis with urgency
4. ✅ Fix question selection to use difficulty tags

### **Medium Priority (Better UX)**
5. ✅ Topic-aware adaptive selection
6. ✅ Enhanced difficulty calculation
7. ✅ Better mock exam distribution

### **Low Priority (Nice to Have)**
8. ✅ Time-based performance tracking
9. ✅ Improvement rate calculations
10. ✅ Advanced analytics

---

## 📝 **NEXT STEPS**

1. **Audit all questions** - Check which have difficulty/topic tags
2. **Add missing tags** - Auto-tag or manually tag questions
3. **Test adaptive logic** - Verify difficulty selection works
4. **Test dynamic exams** - Verify weak area focus works
5. **Add logging** - Track AI decisions for debugging

---

## 🧪 **TESTING CHECKLIST**

### **Adaptive Questions:**
- [ ] Beginner user gets easy questions
- [ ] Advanced user gets hard questions
- [ ] Difficulty adjusts during test
- [ ] Questions match difficulty level
- [ ] Weak topics are prioritized

### **Dynamic Mock Exams:**
- [ ] Weak areas are identified correctly
- [ ] Mock exam focuses on weak areas
- [ ] 15 regular + 10 image questions
- [ ] Difficulty matches user level
- [ ] All questions are from real CBR pool

---

## 📊 **METRICS TO TRACK**

1. **Adaptive Learning:**
   - Average difficulty level per user
   - Difficulty adjustment frequency
   - Question selection accuracy

2. **Dynamic Mock Exams:**
   - Personalization level (%)
   - Weak area coverage
   - Exam pass rate improvement


