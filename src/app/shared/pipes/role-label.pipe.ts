import { Pipe, PipeTransform } from '@angular/core';

import { ROL_LABELS } from '../../core/utils/constants';
import { RolUsuario } from '../../core/models/usuario.model';

@Pipe({
  name: 'roleLabel'
})
export class RoleLabelPipe implements PipeTransform {
  transform(value: RolUsuario | null | undefined): string {
    if (!value) {
      return '-';
    }

    return ROL_LABELS[value];
  }
}
