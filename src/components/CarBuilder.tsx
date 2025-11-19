import React from 'react';
import { useCarBuilder } from '../hooks/useCarBuilder';
import './CarBuilder.css';

export const CarBuilder: React.FC = () => {
  const { parts, getProgress } = useCarBuilder();

  const totalProgress = getProgress();

  return (
    <div className="car-builder">
      <div className="car-builder-header">
        <h3 className="car-builder-title">Build Your Dream Car</h3>
        <div className="car-progress">
          <span className="progress-text">{totalProgress}% Complete</span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="car-visualization">
        <div className="car-frame">
          {parts.map(part => (
            <div
              key={part.id}
              className={`car-part ${part.unlocked ? 'unlocked' : 'locked'}`}
              data-part={part.id}
            >
              {part.unlocked && (
                <div className="part-icon">✓</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="car-parts-list">
        {parts.map(part => (
          <div
            key={part.id}
            className={`part-item ${part.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="part-name">{part.name}</div>
            <div className="part-status">
              {part.unlocked ? '✓ Unlocked' : '🔒 Locked'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

