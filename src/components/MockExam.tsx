import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navigation } from './Navigation';
import { lightHaptic, impactHaptic } from '../utils/haptics';
import './MockExam.css';
import * as questionData from '../question_data';

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctAnswerId: string;
  explanation: string;
  imageUrl?: string;
  imageHint?: string;
  subject: string;
}

interface MockExamConfig {
  questions: number;
  timeLimit: number; // in minutes
  passRate: number; // percentage
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const MockExam: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Mock exam configurations - ONLY pass mark differs
  const examConfigs: Record<string, MockExamConfig> = {
    'beginner': { questions: 50, timeLimit: 30, passRate: 88, difficulty: 'beginner' }, // 44/50
    'intermediate': { questions: 50, timeLimit: 30, passRate: 92, difficulty: 'intermediate' }, // 46/50
    'advanced': { questions: 50, timeLimit: 30, passRate: 96, difficulty: 'advanced' } // 48/50
  };

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isFinished, setIsFinished] = useState(false);
  const [examConfig, setExamConfig] = useState<MockExamConfig | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Hide mobile footer during mock exam
  useEffect(() => {
    document.body.classList.add('practice-test-active');
    return () => {
      document.body.classList.remove('practice-test-active');
    };
  }, []);

  // Load exam configuration and questions
  useEffect(() => {
    if (!examId) return;

    const config = examConfigs[examId];
    if (!config) {
      navigate('/mock-exam');
      return;
    }

    setExamConfig(config);
    
    // Check if exam was already started (Rule 6: Timer continues)
    const savedStartTime = localStorage.getItem(`mockExamStart_${examId}`);
    if (savedStartTime) {
      const startTime = parseInt(savedStartTime);
      const elapsed = Math.floor((Date.now() - startTime) / 1000); // seconds
      const remainingTime = (config.timeLimit * 60) - elapsed;
      
      if (remainingTime > 0) {
        // Exam still in progress
        setTimeLeft(remainingTime);
        setIsExamStarted(true);
      } else {
        // Time's up
        setTimeLeft(0);
      }
    } else {
      // New exam - set full time
      setTimeLeft(config.timeLimit * 60);
    }

    // Create formatted exam with proper question distribution
    const formattedQuestions = createFormattedExam(config.difficulty);
    setQuestions(formattedQuestions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, navigate]);

  // Create formatted exam - 50 questions: 25 Traffic Rules, 15 Hazard Perception, 10 Insight
  const createFormattedExam = (_difficulty: 'beginner' | 'intermediate' | 'advanced'): Question[] => {
    // Get all questions from TypeScript files
    const trafficRulesQuestions = [
      ...questionData.trafficLightsSignalsQuestions,
      ...questionData.priorityRulesQuestions,
      ...questionData.speedLimitQuestions,
      ...questionData.roadMarkingsQuestions,
      ...questionData.expandedPriorityRulesQuestions,
      ...questionData.motorwayRulesQuestions,
      ...questionData.parkingRulesQuestions,
      ...questionData.environmentalZonesQuestions,
      ...questionData.technologySafetyQuestions,
      ...questionData.alcoholDrugsQuestions,
      ...questionData.fatigueRestQuestions,
      ...questionData.emergencyProceduresQuestions,
      ...questionData.bicycleInteractionsQuestions,
      ...questionData.roundaboutRulesQuestions,
      ...questionData.tramInteractionsQuestions,
      ...questionData.pedestrianCrossingsQuestions,
      ...questionData.constructionZonesQuestions,
      ...questionData.weatherConditionsQuestions,
      ...questionData.vehicleCategoriesQuestions,
      ...questionData.vehicleDocumentationQuestions,
      ...questionData.mandatorySignQuestions,
      ...questionData.warningSignsQuestions,
      ...questionData.prohibitorySignsQuestions,
      ...questionData.prohibitorySigns2Questions,
      ...questionData.roadInformationQuestions,
      ...questionData.signIdentificationQuestions,
      ...questionData.mandatorySigns2Questions
    ];

    const hazardPerceptionList = [...questionData.hazardPerceptionQuestions];
    const trafficInsightList = [...questionData.insightPracticeQuestions];

    // Apply translations if not English
    const translateQuestions = (questions: Question[], testKey: string): Question[] => {
      if (i18n.language === 'en') return questions;
      
      return questions.map((q, index) => {
        const qKey = `q${index + 1}`;
        const baseKey = `questions.${testKey}.${qKey}`;
        
        // Check if translation exists
        const hasTranslation = i18n.exists(`${baseKey}.text`);
        
        if (hasTranslation) {
          return {
            ...q,
            text: t(`${baseKey}.text`),
            options: q.options.map((opt, optIndex) => ({
              ...opt,
              text: t(`${baseKey}.o${optIndex + 1}`)
            })),
            explanation: t(`${baseKey}.explanation`)
          };
        }
        return q; // Fall back to English
      });
    };


    // Apply translations to each category
    const translatedTrafficRules = translateQuestions(trafficRulesQuestions, 'trafficLights'); // Use first test key as fallback
    const translatedHazardPerception = translateQuestions(hazardPerceptionList, 'hazardPerception');
    const translatedTrafficInsight = translateQuestions(trafficInsightList, 'insightPractice');

    // Shuffle each category
    const shuffledTrafficRules = [...translatedTrafficRules].sort(() => Math.random() - 0.5);
    const shuffledHazardPerception = [...translatedHazardPerception].sort(() => Math.random() - 0.5);
    const shuffledTrafficInsight = [...translatedTrafficInsight].sort(() => Math.random() - 0.5);

    // Select questions: 25 + 15 + 10 = 50
    const selectedTrafficRules = shuffledTrafficRules.slice(0, 25);
    const selectedHazardPerception = shuffledHazardPerception.slice(0, 15);
    const selectedTrafficInsight = shuffledTrafficInsight.slice(0, 10);

    // Combine and shuffle final exam
    const exam = [
      ...selectedTrafficRules,
      ...selectedHazardPerception,
      ...selectedTrafficInsight
    ].sort(() => Math.random() - 0.5);

    return exam;
  };

  // Timer countdown
  useEffect(() => {
    if (!isExamStarted || isFinished || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExamStarted, isFinished, timeLeft]);

  const startExam = () => {
    setIsExamStarted(true);
    // Save exam start time to localStorage (Rule 6: Timer continues)
    if (examId) {
      const startTime = Date.now();
      localStorage.setItem(`mockExamStart_${examId}`, startTime.toString());
    }
  };

  const finishExam = () => {
    impactHaptic(); // Heavy haptic for exam completion
    setIsFinished(true);

    // Calculate final score
    const correctAnswers = Object.values(answers).filter((answer, index) =>
      answer === questions[index]?.correctAnswerId
    ).length;
    
    // Navigate to results page with data
    if (examConfig && examId) {
      const percentage = Math.round((correctAnswers / examConfig.questions) * 100);
      const passed = percentage >= examConfig.passRate;
      
      const resultsData = {
        examId,
        score: correctAnswers,
        percentage,
        passed,
        totalQuestions: examConfig.questions,
        timeUsed: (examConfig.timeLimit * 60) - timeLeft,
        difficulty: examConfig.difficulty,
        passRate: examConfig.passRate
      };
      
      // Save to localStorage
      localStorage.setItem(`mockExamResults_${examId}`, JSON.stringify(resultsData));
      
      // Clear exam start time (exam finished)
      localStorage.removeItem(`mockExamStart_${examId}`);
      
      // Navigate to results page
      navigate('/mock-exam/results', { state: resultsData });
    }
  };


  const handleAnswer = (answerId: string) => {
    if (isAnswered || !isExamStarted) return;

    lightHaptic(); // Haptic feedback on answer selection
    setIsAnswered(true);
    setSelectedAnswer(answerId);
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: answerId }));

    // Instant next question (no delays)
    setTimeout(() => {
      nextQuestion();
    }, 300);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      finishExam();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (!examConfig || questions.length === 0) {
    return null;
  }


  // Intro Screen - Native iOS/Android style
  if (!isExamStarted) {
    
    return (
      <div className="main-layout">
        <Navigation />
        <main className="main-content">
          <div className="mock-exam-intro">
            <button className="back-btn" onClick={() => navigate('/mock-exam')}>
              ←
            </button>
            
            <div className="intro-header">
              <h1 className="intro-title">Mock Exam</h1>
            </div>

            <div className="exam-rules">
              <h3 className="rules-title">Exam Rules</h3>
              <div className="rules-list">
                <div className="rule-item">
                  <span className="rule-number">1.</span>
                  <span className="rule-text">You must answer all 50 questions within 30 minutes</span>
                </div>
                <div className="rule-item">
                  <span className="rule-number">2.</span>
                  <span className="rule-text">Each question has multiple answer options - select the correct one</span>
                </div>
                <div className="rule-item">
                  <span className="rule-number">3.</span>
                  <span className="rule-text">You cannot go back to previous questions once answered</span>
                </div>
                <div className="rule-item">
                  <span className="rule-number">4.</span>
                  <span className="rule-text">Your answers are not checked until the exam is complete</span>
                </div>
                <div className="rule-item">
                  <span className="rule-number">5.</span>
                  <span className="rule-text">A minimum score of {examConfig.passRate}% is required to pass</span>
                </div>
                <div className="rule-item">
                  <span className="rule-number">6.</span>
                  <span className="rule-text">The timer will continue even if you close or refresh the page</span>
                </div>
              </div>
              <p className="rules-footer">Good luck with your examination.</p>
            </div>

            <button className="start-exam-btn" onClick={startExam}>
              Start
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Exam Screen (using Practice Test design)
  return (
    <div className="main-layout">
      <Navigation />
      <main className="main-content">
        <div className="practice-test">
          <div className="practice-progress-bar">
            <div className="practice-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="practice-header-row">
            <div className="practice-subject-row">
              <span className="practice-question-number">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="exam-timer" style={{ color: timeLeft < 300 ? '#ef4444' : '#10b981' }}>
                ⏱ {formatTime(timeLeft)}
              </span>
            </div>
            <div className="practice-header-controls">
              <button className="practice-exit-btn" onClick={() => navigate('/mock-exam')}>
                ✕
              </button>
              <button 
                className={`practice-mute-btn ${isMuted ? 'muted' : ''}`}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
          </div>

          <div className="practice-question-text">{currentQuestion.text}</div>

          {currentQuestion.imageUrl && (
            <div className="practice-question-image">
              <img src={currentQuestion.imageUrl} alt="Question" />
            </div>
          )}

          <div className="practice-options-list">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option.id;

              return (
                <button
                  key={option.id}
                  className={`practice-option-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAnswer(option.id)}
                  disabled={isAnswered}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="option-text">{option.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

