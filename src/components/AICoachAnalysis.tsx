import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AICoachAnalysis.css';

interface MistakePattern {
  topic: string;
  mistake: string;
  frequency: number;
  lastOccurrence: string;
  explanation: string;
  solution: string;
}

interface AIAnalysis {
  totalMistakes: number;
  mostCommonMistake: string;
  learningPattern: string;
  improvementRate: number;
  recommendations: string[];
}

export const AICoachAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [mistakePatterns, setMistakePatterns] = useState<MistakePattern[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);

  useEffect(() => {
    // Simulate loading mistake analysis data - simplified
    const mockMistakes: MistakePattern[] = [
      {
        topic: 'Traffic Lights',
        mistake: 'Red and amber signals',
        frequency: 4,
        lastOccurrence: '2 hours ago',
        explanation: 'Mixing up light sequence',
        solution: 'Practice visual examples'
      },
      {
        topic: 'Priority Rules',
        mistake: 'Giving way rules',
        frequency: 3,
        lastOccurrence: '1 day ago',
        explanation: 'Wrong right of way',
        solution: 'Study triangle signs'
      },
      {
        topic: 'Roundabouts',
        mistake: 'Wrong lane choice',
        frequency: 2,
        lastOccurrence: '3 days ago',
        explanation: 'Incorrect exit lane',
        solution: 'Left for left/straight'
      }
    ];

    const mockAnalysis: AIAnalysis = {
      totalMistakes: 9,
      mostCommonMistake: 'Traffic lights',
      learningPattern: 'Learn 40% faster with visuals',
      improvementRate: 15,
      recommendations: [
        'Focus on Traffic Lights',
        'Use visual learning',
        'Practice roundabouts'
      ]
    };

    setMistakePatterns(mockMistakes);
    setAiAnalysis(mockAnalysis);
  }, []);

  return (
    <div className="main-layout">
      <main className="main-content">
        <div className="analysis-container">
          <div className="analysis-header">
            <div className="header-content">
              <div className="header-text">
                <h1>🔍 Mistake Analysis</h1>
              </div>
            </div>
            <button 
              className="back-button"
              onClick={() => navigate('/')}
            >
              × Close
            </button>
          </div>

          {/* AI Analysis Summary */}
          {aiAnalysis && (
            <div className="analysis-summary">
              <h2>🧠 AI Learning Analysis</h2>
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="summary-number">{aiAnalysis.totalMistakes}</div>
                  <div className="summary-label">Total Mistakes</div>
                </div>
                <div className="summary-card">
                  <div className="summary-number">{aiAnalysis.improvementRate}%</div>
                  <div className="summary-label">Improvement Rate</div>
                </div>
                <div className="summary-card">
                  <div className="summary-number">40%</div>
                  <div className="summary-label">Faster Learning</div>
                </div>
              </div>
              
              <div className="ai-insight">
                <h4>💡 AI Insight</h4>
                <p>{aiAnalysis.learningPattern}</p>
              </div>
            </div>
          )}

          {/* Mistake Patterns */}
          <div className="mistake-patterns">
            <h2>🎯 Your Mistake Patterns</h2>
            {mistakePatterns.map((pattern, index) => (
              <div key={index} className="mistake-card">
                <div className="mistake-header">
                  <div className="mistake-topic">{pattern.topic}</div>
                  <div className="mistake-frequency">{pattern.frequency} times</div>
                </div>
                <div className="mistake-details">
                  <div className="mistake-description">
                    <strong>Mistake:</strong> {pattern.mistake}
                  </div>
                  <div className="mistake-explanation">
                    <strong>Why:</strong> {pattern.explanation}
                  </div>
                  <div className="mistake-solution">
                    <strong>Solution:</strong> {pattern.solution}
                  </div>
                  <div className="mistake-timing">
                    Last occurred: {pattern.lastOccurrence}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Recommendations */}
          {aiAnalysis && (
            <div className="ai-recommendations">
              <h2>🚀 AI Recommendations</h2>
              <div className="recommendations-list">
                {aiAnalysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="recommendation-item">
                    <div className="recommendation-number">{index + 1}</div>
                    <div className="recommendation-text">{recommendation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="analysis-actions">
            <button 
              className="action-button"
              onClick={() => navigate('/recommendations')}
            >
              Get Study Plan
            </button>
            <button 
              className="action-button secondary"
              onClick={() => navigate('/')}
            >
              View Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
