// Cloud Save Service - Free tier using Supabase
// No credit card required, free for up to 50,000 users

import { createClient } from '@supabase/supabase-js';

// Free Supabase project (no credit card required)
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

// For now, we'll use a simple localStorage + sync approach
// This can be easily upgraded to real cloud storage later

export interface UserProgress {
  userId: string;
  testHistory: any[];
  studyTime: number;
  averageScore: number;
  lastSync: string;
}

class CloudSaveService {
  private isOnline: boolean = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncToCloud();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Save user progress locally and attempt cloud sync
  async saveProgress(userId: string, progressData: any): Promise<boolean> {
    try {
      // Always save locally first
      const progress: UserProgress = {
        userId,
        testHistory: progressData.testHistory || [],
        studyTime: progressData.studyTime || 0,
        averageScore: progressData.averageScore || 0,
        lastSync: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem(`userProgress_${userId}`, JSON.stringify(progress));
      
      // Try to sync to cloud if online
      if (this.isOnline) {
        await this.syncToCloud();
      }

      console.log('💾 Progress saved locally for user:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error saving progress:', error);
      return false;
    }
  }

  // Load user progress from local storage
  async loadProgress(userId: string): Promise<UserProgress | null> {
    try {
      const saved = localStorage.getItem(`userProgress_${userId}`);
      if (saved) {
        const progress = JSON.parse(saved);
        console.log('📱 Progress loaded for user:', userId);
        return progress;
      }
      return null;
    } catch (error) {
      console.error('❌ Error loading progress:', error);
      return null;
    }
  }

  // Sync to cloud (placeholder for now)
  private async syncToCloud(): Promise<void> {
    // This would connect to Supabase or Firebase
    // For now, we'll just log that sync would happen
    console.log('☁️ Would sync to cloud (when implemented)');
  }

  // Check if user has saved progress
  hasSavedProgress(userId: string): boolean {
    return localStorage.getItem(`userProgress_${userId}`) !== null;
  }

  // Get all saved progress for a user
  getAllProgress(userId: string): any {
    const saved = localStorage.getItem(`userProgress_${userId}`);
    return saved ? JSON.parse(saved) : null;
  }

  // Clear all progress (for testing)
  clearProgress(userId: string): void {
    localStorage.removeItem(`userProgress_${userId}`);
    console.log('🗑️ Progress cleared for user:', userId);
  }
}

export const cloudSave = new CloudSaveService();
