import { Injectable } from '@angular/core';

/**
 * Storage Service
 * Handles all localStorage operations with type safety
 * Makes it easy to switch to sessionStorage or other storage later
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  /**
   * Save data to localStorage
   * @param key - Storage key
   * @param value - Data to store (will be JSON stringified)
   */
  set(key: string, value: any): void {
    try {
      const jsonValue = JSON.stringify(value);
      localStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Get data from localStorage
   * @param key - Storage key
   * @returns Parsed data or null if not found
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   * @param key - Storage key
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  /**
   * Clear all localStorage data
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if key exists in localStorage
   * @param key - Storage key
   * @returns true if key exists
   */
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}
