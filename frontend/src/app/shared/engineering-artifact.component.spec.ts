import { TestBed } from '@angular/core/testing';
import { EngineeringArtifactComponent } from './engineering-artifact.component';
import { engineeringArtifact } from '../core/content/engineering-artifact.pl';
import { publishedEvidence } from '../core/content/evidence.pl';

describe('Inspectable own-project engineering evidence', () => {
  it('pins all file links to the reviewed public revision and reuses its evidence metadata', () => {
    const fixture = TestBed.createComponent(EngineeringArtifactComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const record = publishedEvidence.find((item) => item.id === 'studio-application')!;
    expect(record.version).toBe(engineeringArtifact.revision);
    expect(record.classification).toBe('own-project');
    expect(record.metrics).toEqual([]);
    for (const link of element.querySelectorAll<HTMLAnchorElement>('.artifact-files a')) {
      expect(link.getAttribute('href')).toMatch(
        /^\/assets\/evidence\/engineering-0d38ef8\/.+\.txt$/,
      );
    }
    expect(
      element.querySelector('a[download="protolume-engineering.md"]')?.getAttribute('href'),
    ).toBe(engineeringArtifact.instructions);
    expect(element.querySelector('img,iframe,audio,script')).toBeNull();
    expect(element.querySelector('a[href*="github.com"]')).toBeNull();
    expect(element.textContent).toContain('nie potwierdzają produkcyjnego dostarczenia');
    expect(element.textContent).toContain('bieżącego przebiegu CI');
  });
});
