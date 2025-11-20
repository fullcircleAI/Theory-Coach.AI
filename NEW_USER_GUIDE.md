# New User Topic Selection Guide

## 🎯 How Topics Are Chosen for First-Time New Users

### **Step 1: First-Time User Detection**
- **Check:** `Object.keys(testScores).length === 0` (no test scores in history)
- **Result:** User is identified as a new user

### **Step 2: Beginner Path Recommendation**
- **First Test:** Always `BEGINNER_PATH[0]` = **'traffic-rules-signs'**
- **Reason:** "Perfect starting point for beginners"
- **Priority:** High

### **Step 3: Beginner Path Sequence**
The beginner path guides new users through these 4 tests in order:

```typescript
BEGINNER_PATH = [
  'traffic-rules-signs',    // 1. First test (always)
  'priority-rules',         // 2. Second test
  'hazard-perception',     // 3. Third test
  'speed-safety'           // 4. Fourth test
];
```

---

## 📊 Flow After First Test

### **Scenario A: User Scores < 60% (Weak Area)**
1. Test result saved: `traffic-rules-signs` = 45% (weak)
2. Recommendation: **Same test** (`traffic-rules-signs`)
3. Results page: Shows **"Retry Test"** button
4. User must retry until score ≥ 60%

### **Scenario B: User Scores ≥ 60% (Not Weak)**
1. Test result saved: `traffic-rules-signs` = 75% (not weak)
2. Recommendation logic:
   - No weak areas exist yet
   - Goes to "other tests" logic
   - Prioritizes **unpracticed tests** from **beginner path**
3. Recommendation: **Next test** = `priority-rules` (BEGINNER_PATH[1])
4. Results page: Shows **"Next: Priority Rules"** button

---

## 🔄 Complete Beginner Path Flow

### **Test 1: Traffic Rules & Signs**
- **New user:** Always recommended first
- **After completion:**
  - Score < 60% → Retry same test
  - Score ≥ 60% → Move to Test 2

### **Test 2: Priority Rules**
- **Recommended when:** Test 1 completed with ≥ 60%
- **After completion:**
  - Score < 60% → Retry same test
  - Score ≥ 60% → Move to Test 3

### **Test 3: Hazard Perception**
- **Recommended when:** Tests 1-2 completed with ≥ 60%
- **After completion:**
  - Score < 60% → Retry same test
  - Score ≥ 60% → Move to Test 4

### **Test 4: Speed & Safety**
- **Recommended when:** Tests 1-3 completed with ≥ 60%
- **After completion:**
  - Score < 60% → Retry same test
  - Score ≥ 60% → Move to adaptive learning (weak area priority)

---

## 🎓 After Beginner Path

Once all 4 beginner path tests are completed (all ≥ 60%):

1. **Weak Area Priority Takes Over:**
   - System identifies weak areas (< 60% score OR < 60% mastery)
   - Weak areas are **ALWAYS** recommended first
   - Only when no weak areas exist → other tests are recommended

2. **Adaptive Learning:**
   - Difficulty level calculated (1-10 scale)
   - Topic mastery tracked per test
   - Questions selected based on difficulty level

---

## ✅ Summary

**For First-Time New Users:**
1. ✅ Always start with **'traffic-rules-signs'** (BEGINNER_PATH[0])
2. ✅ Guided through beginner path: traffic-rules-signs → priority-rules → hazard-perception → speed-safety
3. ✅ Must score ≥ 60% to progress to next test
4. ✅ After beginner path → switches to weak area priority + adaptive learning

**The beginner path ensures:**
- New users start with foundational topics
- Progressive learning (easy → harder)
- Essential topics covered first
- Smooth transition to adaptive learning

