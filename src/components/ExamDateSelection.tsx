import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './ExamDateSelection.css';

interface ExamDateSelectionProps {
  onComplete: () => void;
}

export const ExamDateSelection: React.FC<ExamDateSelectionProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate min and max dates (1-7 days from today)
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 1); // Tomorrow
  
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 7); // 7 days from today

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleContinue = async () => {
    if (!selectedDate) return;
    
    setIsLoading(true);
    
    try {
      // Save exam date to localStorage
      localStorage.setItem('examDate', selectedDate);
      
      // Calculate days remaining
      const examDate = new Date(selectedDate);
      const daysRemaining = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Save days remaining for dashboard display
      localStorage.setItem('daysRemaining', daysRemaining.toString());
      
      // Complete the flow
      onComplete();
    } catch (error) {
      console.error('Error saving exam date:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Remove any existing exam date
    localStorage.removeItem('examDate');
    localStorage.removeItem('daysRemaining');
    onComplete();
  };

  const getDaysRemaining = () => {
    if (!selectedDate) return 0;
    const examDate = new Date(selectedDate);
    return Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="exam-date-selection">
      <div className="exam-date-container">
        {/* Mascot */}
        <div className="mascot-container">
          <img src="/images/mascot.png" alt="Mascot" className="mascot-image" />
        </div>

        {/* Title */}
        <h1 className="exam-date-title">
          {t('examDate.title', 'When\'s Your Exam?')}
        </h1>

        {/* Subtitle */}
        <p className="exam-date-subtitle">
          {t('examDate.subtitle', 'Get a personalized study plan based on your exam date')}
        </p>

        {/* Date Selection */}
        <div className="date-selection-container">
          <label htmlFor="exam-date" className="date-label">
            {t('examDate.selectDate', 'Select Date')}
          </label>
          <input
            id="exam-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={formatDateForInput(minDate)}
            max={formatDateForInput(maxDate)}
            className="date-input"
          />
          
          {/* Days remaining display */}
          {selectedDate && daysRemaining > 0 && (
            <div className="days-remaining">
              <span className="days-number">{daysRemaining}</span>
              <span className="days-text">
                {daysRemaining === 1 
                  ? t('examDate.dayRemaining', 'day remaining')
                  : t('examDate.daysRemaining', 'days remaining')
                }
              </span>
            </div>
          )}
        </div>

        {/* Motivational message */}
        {selectedDate && (
          <div className="motivational-message">
            <p>
              {t('examDate.motivational', 'You can master driving theory in 24 hours of study!')}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="exam-date-actions">
          <button
            className="skip-button"
            onClick={handleSkip}
            disabled={isLoading}
          >
            {t('examDate.skip', 'Skip for now')}
          </button>
          
          <button
            className="continue-button"
            onClick={handleContinue}
            disabled={!selectedDate || isLoading}
          >
            {isLoading ? t('examDate.continuing', 'Continuing...') : t('examDate.continue', 'Continue')}
          </button>
        </div>
      </div>
    </div>
  );
};
