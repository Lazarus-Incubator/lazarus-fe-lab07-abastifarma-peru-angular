import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { DashboardResumen } from '../../../../core/models/dashboard.model';
import { AuthService } from '../../../../core/services/auth.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    CommonModule,
    PageHeaderComponent,
    StatCardComponent,
    LoadingStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  summary: DashboardResumen | null = null;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.dashboardService
      .getResumen(this.authService.currentUser)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (summary) => {
          this.summary = summary;
        },
        error: (error: Error) => {
          this.summary = null;
          this.errorMessage = error.message;
          this.notificationService.show(error.message, 'error');
        }
      });
  }
}
