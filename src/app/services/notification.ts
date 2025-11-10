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
        title: 'New User Registered',
        message: 'John Doe has registered as a new user',
        type: 'success',
        timestamp: new Date(Date.now() - 5 * 60000),
        read: false,
        icon: 'bi-person-plus-fill'
      },
      {
        id: 2,
        title: 'System Update',
        message: 'System will be updated tonight at 2 AM',
        type: 'info',
        timestamp: new Date(Date.now() - 30 * 60000),
        read: false,
        icon: 'bi-info-circle-fill'
      },
      {
        id: 3,
        title: 'Password Changed',
        message: 'Your password was successfully changed',
        type: 'success',
        timestamp: new Date(Date.now() - 2 * 60 * 60000),
        read: true,
        icon: 'bi-shield-check'
      },
      {
        id: 4,
        title: 'Low Storage Warning',
        message: 'Storage is running low. Please free up space',
        type: 'warning',
        timestamp: new Date(Date.now() - 5 * 60 * 60000),
        read: false,
        icon: 'bi-exclamation-triangle-fill'
      },
      {
        id: 5,
        title: 'Failed Login Attempt',
        message: 'Someone tried to access your account',
        type: 'error',
        timestamp: new Date(Date.now() - 24 * 60 * 60000),
        read: true,
        icon: 'bi-shield-exclamation'
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
