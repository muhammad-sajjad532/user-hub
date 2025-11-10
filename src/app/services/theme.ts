import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem('darkMode');
    const isDark = savedTheme === 'true';
    this.setDarkMode(isDark);
  }

  setDarkMode(isDark: boolean): void {
    this.isDarkModeSubject.next(isDark);
    localStorage.setItem('darkMode', isDark.toString());
    
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  toggleDarkMode(): void {
    const currentMode = this.isDarkModeSubject.value;
    this.setDarkMode(!currentMode);
  }

  get isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }
}
