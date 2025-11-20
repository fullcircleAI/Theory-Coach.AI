# Results Page Button Options

## 📊 **CURRENT STATE**
Currently shows **ONE button**:
- "Continue: [Next Test]" if there's a next test available
- "Go to Dashboard" if all tests are completed

---

## 🎯 **RECOMMENDED BUTTON OPTIONS**

### **Option 1: Single Primary Button (Current - Simplest)**
**Best for**: Minimalist design, reducing decision fatigue

```
[Continue: Next Test Name →]  OR  [Go to Dashboard →]
```

**Pros:**
- ✅ Simple and clear
- ✅ No decision paralysis
- ✅ Focuses user on one action

**Cons:**
- ❌ No option to retry if score is low
- ❌ Can't go back to dashboard if there's a next test

---

### **Option 2: Primary + Secondary (Recommended)**
**Best for**: Balanced UX with flexibility

```
Primary Button: [Continue: Next Test →]  OR  [Go to Dashboard →]
Secondary Button: [Retry Test] (shown if score < 80%)
```

**Logic:**
- **If score ≥ 80%**: Show "Continue: Next Test" (primary) + "Go to Dashboard" (secondary)
- **If score < 80%**: Show "Retry Test" (primary) + "Continue: Next Test" (secondary) + "Go to Dashboard" (secondary)

**Pros:**
- ✅ Allows retry for low scores
- ✅ Always has dashboard option
- ✅ Clear primary action

**Cons:**
- ⚠️ More buttons = more decisions

---

### **Option 3: Context-Aware (Most Flexible)**
**Best for**: Adaptive UX based on performance

**If score < 60% (Critical):**
```
[Retry Test] (Primary - Green)
[Go to Dashboard] (Secondary)
```

**If score 60-79% (Needs Work):**
```
[Retry Test] (Primary - Amber)
[Continue: Next Test] (Secondary)
[Go to Dashboard] (Secondary)
```

**If score ≥ 80% (Mastery):**
```
[Continue: Next Test] (Primary - Green)
[Go to Dashboard] (Secondary)
```

**Pros:**
- ✅ Adapts to user performance
- ✅ Encourages retry for low scores
- ✅ Clear guidance based on results

**Cons:**
- ⚠️ More complex logic
- ⚠️ More buttons on some screens

---

### **Option 4: Two Buttons Always (Maximum Flexibility)**
**Best for**: Users who want full control

```
[Continue: Next Test →]  OR  [Go to Dashboard →]
[Retry Test]
```

**Always shows:**
- Primary: Next action (Next Test or Dashboard)
- Secondary: Retry Test (always available)

**Pros:**
- ✅ Maximum flexibility
- ✅ Always can retry
- ✅ Always can go to dashboard

**Cons:**
- ⚠️ May encourage unnecessary retries
- ⚠️ More visual clutter

---

## 💡 **MY RECOMMENDATION: Option 2 (Primary + Secondary)**

### **Implementation Logic:**

```tsx
<div className="result-actions">
  {/* Primary Button - Always shown */}
  {hasNextTest ? (
    <button className="practice-nav-btn primary next-test-btn">
      Continue: {nextTest.name} →
    </button>
  ) : (
    <button className="practice-nav-btn primary dashboard-btn">
      Go to Dashboard →
    </button>
  )}
  
  {/* Secondary Buttons - Conditional */}
  {percentage < 80 && (
    <button className="practice-nav-btn secondary retry-btn">
      Retry Test
    </button>
  )}
  
  {/* Dashboard always available as secondary if there's a next test */}
  {hasNextTest && (
    <button className="practice-nav-btn secondary dashboard-btn">
      Go to Dashboard
    </button>
  )}
</div>
```

### **Button Priority:**
1. **Primary (Large, Gradient)**: Main recommended action
2. **Secondary (Smaller, Outlined)**: Alternative actions

---

## 🎨 **VISUAL HIERARCHY**

### **Primary Button:**
- Large, gradient background
- Full width or max-width 400px
- Bold text, arrow icon
- Green for "Next Test", Blue for "Dashboard"

### **Secondary Buttons:**
- Smaller, outlined style
- Full width
- Regular weight text
- Less prominent

---

## 📱 **MOBILE CONSIDERATIONS**

- **Max 2 buttons** on mobile (primary + 1 secondary)
- **Stack vertically** with adequate spacing
- **Touch targets**: Minimum 44px height
- **Full width** buttons for easier tapping

---

## ✅ **FINAL RECOMMENDATION**

**Use Option 2 with this logic:**

1. **Always show primary button:**
   - "Continue: [Next Test]" if next test exists
   - "Go to Dashboard" if all tests completed

2. **Show secondary buttons conditionally:**
   - "Retry Test" if score < 80%
   - "Go to Dashboard" if next test exists (so user can always go back)

3. **Visual hierarchy:**
   - Primary: Large, gradient, prominent
   - Secondary: Smaller, outlined, less prominent

---

## 🚀 **QUICK IMPLEMENTATION**

Would you like me to implement Option 2? It provides:
- ✅ Clear primary action
- ✅ Option to retry for low scores
- ✅ Always accessible dashboard
- ✅ Clean, professional design


