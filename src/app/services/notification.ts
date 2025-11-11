import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    this.loadMockNotifications();
  }

  private loadMockNotifications(): void {
    const mockNotifications: Notification[] = [
      {
        id: 1,
        title: 'New Student Admission',
        message: 'Ahmed Ali has been admitted to Class 10-A',
        type: 'success',
        timestamp: new Date(Date.now() - 5 * 60000),
        read: false,
        icon: 'bi-person-plus-fill'
      },
      {
        id: 2,
        title: 'Parent-Teacher Meeting',
        message: 'PTM scheduled for Saturday, 10 AM in main hall',
        type: 'info',
        timestamp: new Date(Date.now() - 30 * 60000),
        read: false,
        icon: 'bi-calendar-event-fill'
      },
      {
        id: 3,
        title: 'Fee Payment Received',
        message: 'Monthly fee received from Sara Khan (Class 9-B)',
        type: 'success',
        timestamp: new Date(Date.now() - 2 * 60 * 60000),
        read: true,
        icon: 'bi-cash-coin'
      },
      {
        id: 4,
        title: 'Low Attendance Alert',
        message: 'Class 8-C has only 65% attendance today',
        type: 'warning',
        timestamp: new Date(Date.now() - 5 * 60 * 60000),
        read: false,
        icon: 'bi-exclamation-triangle-fill'
      },
      {
        id: 5,
        title: 'Exam Schedule Updated',
        message: 'Mid-term exams will start from 15th December',
        type: 'info',
        timestamp: new Date(Date.now() - 24 * 60 * 60000),
        read: true,
        icon: 'bi-journal-text'
      }
    ];
    this.notificationsSubject.next(mockNotifications);
  }

  getNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }

  markAsRead(id: number): void {
    const notifications = this.notificationsSubject.value.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(notifications);
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(notifications);
  }

  deleteNotification(id: number): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(notifications);
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date()
    };
    const notifications = [newNotification, ...this.notificationsSubject.value];
    this.notificationsSubject.next(notifications);
  }
}
