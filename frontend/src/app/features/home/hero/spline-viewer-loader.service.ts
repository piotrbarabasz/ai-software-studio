import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SplineViewerLoader {
  load(): Promise<unknown> {
    return import('@splinetool/viewer');
  }
}
