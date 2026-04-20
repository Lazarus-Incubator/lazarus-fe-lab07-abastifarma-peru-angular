import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationMessage {
  type: NotificationType;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notificationSubject = new BehaviorSubject<NotificationMessage | null>(null);

  readonly notification$ = this.notificationSubject.asObservable();

  show(text: string, type: NotificationType = 'info', durationMs = 3500): void {
    this.notificationSubject.next({ text, type });

    if (durationMs > 0 && typeof window !== 'undefined') {
      window.setTimeout(() => {
        if (this.notificationSubject.value?.text === text) {
          this.clear();
        }
      }, durationMs);
    }
  }

  clear(): void {
    this.notificationSubject.next(null);
  }
}
