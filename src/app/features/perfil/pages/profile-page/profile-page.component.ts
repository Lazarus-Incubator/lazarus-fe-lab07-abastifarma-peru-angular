import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import { Sede } from '../../../../core/models/sede.model';
import { AuthService } from '../../../../core/services/auth.service';
import { SedesService } from '../../../../core/services/sedes.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { RoleLabelPipe } from '../../../../shared/pipes/role-label.pipe';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule, PageHeaderComponent, RoleLabelPipe],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly sedesService = inject(SedesService);

  readonly user = this.authService.currentUser;
  sede: Sede | null = null;

  ngOnInit(): void {
    if (!this.user?.sedeId) {
      return;
    }

    this.sedesService.getById(this.user.sedeId).subscribe({
      next: (sede) => {
        this.sede = sede;
      }
    });
  }
}
