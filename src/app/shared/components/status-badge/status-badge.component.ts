import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import {
  ESTADO_PRODUCTO_LABELS,
  ESTADO_SEDE_LABELS,
  ESTADO_SOLICITUD_LABELS,
  PRIORIDAD_LABELS
} from '../../../core/utils/constants';

@Component({
  selector: 'app-status-badge',
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css'
})
export class StatusBadgeComponent {
  @Input({ required: true }) value = '';
  @Input() kind: 'estado-solicitud' | 'prioridad' | 'estado-sede' | 'estado-producto' =
    'estado-solicitud';

  get label(): string {
    if (this.kind === 'prioridad') {
      return PRIORIDAD_LABELS[this.value as keyof typeof PRIORIDAD_LABELS] ?? this.value;
    }

    if (this.kind === 'estado-sede') {
      return ESTADO_SEDE_LABELS[this.value as keyof typeof ESTADO_SEDE_LABELS] ?? this.value;
    }

    if (this.kind === 'estado-producto') {
      return ESTADO_PRODUCTO_LABELS[this.value as keyof typeof ESTADO_PRODUCTO_LABELS] ?? this.value;
    }

    return ESTADO_SOLICITUD_LABELS[this.value as keyof typeof ESTADO_SOLICITUD_LABELS] ?? this.value;
  }

  get cssClass(): string {
    return `${this.kind}-${this.value.toLowerCase()}`;
  }
}
