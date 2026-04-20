import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  templateUrl: './loading-state.component.html',
  styleUrl: './loading-state.component.css'
})
export class LoadingStateComponent {
  @Input() message = 'Cargando información...';
}
