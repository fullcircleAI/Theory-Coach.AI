import { useState, useEffect, useCallback } from 'react';

interface CarPart {
  id: string;
  name: string;
  unlocked: boolean;
  progress: number;
}

const PART_MAPPING: Record<string, string> = {
  'priority-rules': 'wheels',
  'hazard-perception': 'engine',
  'speed-safety': 'brakes',
  'road-signs': 'headlights',
  'traffic-lights-signals': 'headlights',
  'mock-exam': 'body'
};

export const useCarBuilder = () => {
  const [parts, setParts] = useState<CarPart[]>([
    { id: 'wheels', name: 'Wheels', unlocked: false, progress: 0 },
    { id: 'engine', name: 'Engine', unlocked: false, progress: 0 },
    { id: 'brakes', name: 'Brakes', unlocked: false, progress: 0 },
    { id: 'headlights', name: 'Headlights', unlocked: false, progress: 0 },
    { id: 'body', name: 'Body', unlocked: false, progress: 0 },
    { id: 'interior', name: 'Interior', unlocked: false, progress: 0 },
    { id: 'paint', name: 'Paint', unlocked: false, progress: 0 }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('carBuilderProgress');
    if (saved) {
      try {
        const savedParts = JSON.parse(saved);
        setParts(savedParts);
      } catch (e) {
        console.error('Error loading car progress:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('carBuilderProgress', JSON.stringify(parts));
  }, [parts]);

  const unlockPart = useCallback((partId: string) => {
    setParts(prev => prev.map(part => 
      part.id === partId 
        ? { ...part, unlocked: true, progress: 100 }
        : part
    ));
  }, []);

  const unlockPartByTest = useCallback((testId: string, score: number) => {
    const partId = PART_MAPPING[testId];
    if (partId && score >= 70) {
      unlockPart(partId);
    }
  }, [unlockPart]);

  const getProgress = useCallback(() => {
    const unlocked = parts.filter(p => p.unlocked).length;
    return Math.round((unlocked / parts.length) * 100);
  }, [parts]);

  return {
    parts,
    unlockPart,
    unlockPartByTest,
    getProgress
  };
};

