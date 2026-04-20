import { Params } from '@angular/router';

export function cleanQueryParams(params: Record<string, unknown>): Params {
  return Object.entries(params).reduce<Params>((acc, [key, value]) => {
    if (value === null || value === undefined || value === '') {
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
}
