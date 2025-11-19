import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { aiCoach } from '../services/aiCoach';
import './TestsPage.css';

interface PracticeTest {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  icon: string;
}

export const TestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t_nested } = useLanguage();

  // Function to get translated test name
  const getTranslatedTestName = (testId: string): string => {
    const testNameMap: Record<string, string> = {
      'traffic-lights-signals': t_nested('testNames.trafficLightsSignals'),
      'priority-rules': t_nested('testNames.priorityRules'),
      'hazard-perception': t_nested('testNames.hazardPerception'),
      'speed-safety': t_nested('testNames.speedSafety'),
      'bicycle-interactions': t_nested('testNames.bicycleInteractions'),
      'roundabout-rules': t_nested('testNames.roundaboutRules'),
      'tram-interactions': t_nested('testNames.tramInteractions'),
      'pedestrian-crossings': t_nested('testNames.pedestrianCrossings'),
      'construction-zones': t_nested('testNames.constructionZones'),
      'weather-conditions': t_nested('testNames.weatherConditions'),
      'road-signs': t_nested('testNames.roadSigns'),
      'motorway-rules': t_nested('testNames.motorwayRules'),
      'vehicle-knowledge': t_nested('testNames.vehicleKnowledge'),
      'parking-rules': t_nested('testNames.parkingRules'),
      'environmental': t_nested('testNames.environmental'),
      'environmental-zones': t_nested('testNames.environmental'),
      'technology-safety': t_nested('testNames.technologySafety'),
      'alcohol-drugs': t_nested('testNames.alcoholDrugs'),
      'fatigue-rest': t_nested('testNames.fatigueRest'),
      'emergency-procedures': t_nested('testNames.emergencyProcedures'),
      'insight-practice': t_nested('testNames.insightPractice'),
      'mock-test': t_nested('testNames.mockTest')
    };
    return testNameMap[testId] || testId;
  };

  // Get REAL recommendation from AI Coach
  const [recommendedTest, setRecommendedTest] = useState({
    id: 'traffic-rules-signs',
    name: 'Traffic Rules & Signs',
    reason: 'Perfect starting point'
  });

  useEffect(() => {
    const recommendation = aiCoach.getTopRecommendation(t_nested);
    setRecommendedTest({
      id: recommendation.testId,
      name: recommendation.testName,
      reason: recommendation.reason
    });
  }, [t_nested]);

  const practiceTests: PracticeTest[] = [
    {
      id: 'traffic-rules-signs',
      name: getTranslatedTestName('traffic-lights-signals'),
      description: 'Learn Dutch traffic rules, signs, and regulations',
      questionCount: 40,
      difficulty: 'medium',
      category: 'Rules',
      icon: '🚦'
    },
    {
      id: 'priority-rules',
      name: getTranslatedTestName('priority-rules'),
      description: 'Understand priority rules and right of way situations',
      questionCount: 20,
      difficulty: 'medium',
      category: 'Rules',
      icon: '🚩'
    },
    {
      id: 'hazard-perception',
      name: getTranslatedTestName('hazard-perception'),
      description: 'Learn to recognize and respond to dangerous situations',
      questionCount: 15,
      difficulty: 'hard',
      category: 'Safety',
      icon: '👁️'
    },
    {
      id: 'speed-safety',
      name: getTranslatedTestName('speed-safety'),
      description: 'Speed limits, safety rules, and vehicle regulations',
      questionCount: 20,
      difficulty: 'easy',
      category: 'Safety',
      icon: '🛡️'
    },
    {
      id: 'bicycle-interactions',
      name: getTranslatedTestName('bicycle-interactions'),
      description: 'Learn to safely interact with cyclists on the road',
      questionCount: 15,
      difficulty: 'medium',
      category: 'Interactions',
      icon: '🚴'
    },
    {
      id: 'roundabout-rules',
      name: getTranslatedTestName('roundabout-rules'),
      description: 'Learn roundabout navigation and priority rules',
      questionCount: 18,
      difficulty: 'medium',
      category: 'Rules',
      icon: '🔄'
    },
    {
      id: 'tram-interactions',
      name: getTranslatedTestName('tram-interactions'),
      description: 'Understand how to safely interact with trams',
      questionCount: 12,
      difficulty: 'easy',
      category: 'Interactions',
      icon: '🚊'
    },
    {
      id: 'pedestrian-crossings',
      name: getTranslatedTestName('pedestrian-crossings'),
      description: 'Learn pedestrian crossing rules and safety',
      questionCount: 15,
      difficulty: 'easy',
      category: 'Interactions',
      icon: '🚶'
    },
    {
      id: 'construction-zones',
      name: getTranslatedTestName('construction-zones'),
      description: 'Navigate construction zones safely',
      questionCount: 10,
      difficulty: 'easy',
      category: 'Zones',
      icon: '🚧'
    },
    {
      id: 'weather-conditions',
      name: getTranslatedTestName('weather-conditions'),
      description: 'Drive safely in various weather conditions',
      questionCount: 12,
      difficulty: 'easy',
      category: 'Safety',
      icon: '🌧️'
    },
    {
      id: 'road-signs',
      name: getTranslatedTestName('road-signs'),
      description: 'Advanced road signs and identification',
      questionCount: 25,
      difficulty: 'medium',
      category: 'Signs',
      icon: '🛑'
    },
    {
      id: 'motorway-rules',
      name: getTranslatedTestName('motorway-rules'),
      description: 'Specific rules for motorway driving',
      questionCount: 18,
      difficulty: 'medium',
      category: 'Rules',
      icon: '🛣️'
    },
    {
      id: 'vehicle-knowledge',
      name: getTranslatedTestName('vehicle-knowledge'),
      description: 'Vehicle categories and documentation',
      questionCount: 15,
      difficulty: 'easy',
      category: 'Vehicles',
      icon: '🚗'
    },
    {
      id: 'parking-rules',
      name: getTranslatedTestName('parking-rules'),
      description: 'Parking regulations and restrictions',
      questionCount: 20,
      difficulty: 'medium',
      category: 'Rules',
      icon: '🅿️'
    },
    {
      id: 'environmental',
      name: getTranslatedTestName('environmental-zones'),
      description: 'Environmental zones and restrictions',
      questionCount: 10,
      difficulty: 'easy',
      category: 'Zones',
      icon: '🌱'
    },
    {
      id: 'technology-safety',
      name: getTranslatedTestName('technology-safety'),
      description: 'Modern vehicle technology and safety features',
      questionCount: 12,
      difficulty: 'easy',
      category: 'Technology',
      icon: '🔧'
    },
    {
      id: 'alcohol-drugs',
      name: getTranslatedTestName('alcohol-drugs'),
      description: 'Alcohol and drug regulations for drivers',
      questionCount: 15,
      difficulty: 'medium',
      category: 'Safety',
      icon: '🍺'
    },
    {
      id: 'fatigue-rest',
      name: getTranslatedTestName('fatigue-rest'),
      description: 'Driver fatigue and rest requirements',
      questionCount: 10,
      difficulty: 'easy',
      category: 'Safety',
      icon: '😴'
    },
    {
      id: 'emergency-procedures',
      name: getTranslatedTestName('emergency-procedures'),
      description: 'Emergency procedures and protocols',
      questionCount: 12,
      difficulty: 'medium',
      category: 'Safety',
      icon: '🚨'
    },
    {
      id: 'insight-practice',
      name: getTranslatedTestName('insight-practice'),
      description: 'Practice understanding traffic scenarios',
      questionCount: 20,
      difficulty: 'hard',
      category: 'Advanced',
      icon: '🧠'
    },
    {
      id: 'traffic-lights-signals',
      name: getTranslatedTestName('traffic-lights-signals'),
      description: 'Traffic light signals and sequences',
      questionCount: 25,
      difficulty: 'medium',
      category: 'Signals',
      icon: '🚦'
    },
    {
      id: 'mock-test',
      name: getTranslatedTestName('mock-test'),
      description: 'Practice with official exam format questions',
      questionCount: 25,
      difficulty: 'hard',
      category: 'Practice',
      icon: '📝'
    }
  ];


  const handleTestClick = (testId: string) => {
    navigate(`/practice/${testId}`);
  };

  return (
    <div className="main-layout">
      <main className="main-content tests-page">
        <div className="tests-page">
          <div className="tests-header">
            <div className="header-content">
              <div className="header-text">
                <h1>{t_nested('practice.title')}</h1>
              </div>
            </div>
          </div>

          <div className="tests-content">

            {/* Recommendation Banner - iOS/Android Style */}
            <div className="recommendation-banner">
              <div className="recommendation-header">
                <span className="recommendation-title">{t_nested('practice.recommendedForYou')}</span>
              </div>
              <div className="recommendation-content">
                <h3 className="recommendation-test-name">{recommendedTest.name}</h3>
                <p className="recommendation-reason">{recommendedTest.reason}</p>
              </div>
              <button 
                className="recommendation-start-btn"
                onClick={() => handleTestClick(recommendedTest.id)}
              >
                {t_nested('practice.startTest')}
              </button>
            </div>

            {/* Tests Grid */}
            <div className="tests-grid">
              {practiceTests.map((test) => {
                const testScore = aiCoach.getTestScore(test.id);
                const isTestCompleted = testScore !== null && testScore !== undefined;
                return (
                  <div 
                    key={test.id}
                    className="test-card"
                    onClick={() => handleTestClick(test.id)}
                  >
                    <div className="test-content">
                      <h3 className="test-name">
                        {test.name}
                        {isTestCompleted && (
                          <span className="test-score-inline"> - {testScore}%</span>
                        )}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </main>

    </div>
  );
};