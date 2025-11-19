import React from 'react';
import { useTimer } from '../contexts/TimerContext';
import './ChallengeTimerDisplay.css';

export const ChallengeTimerDisplay: React.FC = () => {
  const { timeRemaining, isActive, isPaused, startTimer, formatTime } = useTimer();
  const progress = ((24 * 3600 - timeRemaining) / (24 * 3600)) * 100;

  return (
    <div className="challenge-timer">
      <div className="timer-header">
        <h3 className="timer-title">24-Hour Challenge</h3>
        {!isActive && (
          <button 
            className="timer-start-btn"
            onClick={startTimer}
          >
            Start Challenge
          </button>
        )}
      </div>

      <div className="timer-display">
        <div className="timer-circle">
          <svg className="timer-svg" viewBox="0 0 100 100">
            <circle
              className="timer-bg"
              cx="50"
              cy="50"
              r="45"
            />
            <circle
              className="timer-progress"
              cx="50"
              cy="50"
              r="45"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            />
          </svg>
          <div className="timer-text">
            <div className="timer-time">
              {formatTime(timeRemaining)}
            </div>
            <div className="timer-label">
              {isPaused ? 'Paused' : isActive ? 'Remaining' : 'Not Started'}
            </div>
          </div>
        </div>
      </div>

      <div className="timer-stats">
        <div className="stat-item">
          <span className="stat-label">Progress</span>
          <span className="stat-value">{Math.round(progress)}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Status</span>
          <span className="stat-value">
            {isPaused ? '⏸ Paused' : isActive ? '▶ Active' : '⏹ Not Started'}
          </span>
        </div>
      </div>
    </div>
  );
};

