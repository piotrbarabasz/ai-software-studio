import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';

import { ProtolumeLogoComponent } from './protolume-logo.component';

@Component({
  imports: [ProtolumeLogoComponent],
  template: '<app-protolume-logo [variant]="variant" [theme]="theme" />',
})
class HostComponent {
  variant = 'horizontal' as const;
  theme = 'dark' as const;
}

describe('ProtolumeLogoComponent', () => {
  let fixture: ComponentFixture<ProtolumeLogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProtolumeLogoComponent] }).compileComponents();
    fixture = TestBed.createComponent(ProtolumeLogoComponent);
    fixture.detectChanges();
  });

  it('renders a text fallback when no logo asset is configured', () => {
    expect(fixture.nativeElement.querySelector('.logo-fallback')?.textContent?.trim()).toBe(
      'PROTOLUME',
    );
    expect(fixture.nativeElement.querySelector('.logo-image')).toBeNull();
  });

  it('renders the symbol fallback for the symbol variant', () => {
    fixture.componentInstance.variant = 'symbol';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.logo-fallback-symbol')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.logo-fallback')).not.toBeNull();
  });

  it('provides an accessible home link without duplicating the image label', () => {
    fixture.componentInstance.linkToHome = true;
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a');
    expect(link?.getAttribute('aria-label')).toBe('Protolume — strona główna');
    expect(link?.querySelector('.logo-fallback')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('supports decorative usage and a custom accessible label', () => {
    fixture.componentInstance.accessibleLabel = 'Znak Protolume';
    fixture.detectChanges();

    const fallback = fixture.nativeElement.querySelector('.logo-fallback');
    expect(fallback?.getAttribute('aria-label')).toBe('Znak Protolume');
    expect(fallback?.hasAttribute('aria-hidden')).toBeFalse();
  });

  it('can be rendered by a standalone host component', async () => {
    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();

    expect(hostFixture.nativeElement.querySelector('app-protolume-logo')).not.toBeNull();
  });

  it('renders without browser globals during SSR', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ProtolumeLogoComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    const serverFixture = TestBed.createComponent(ProtolumeLogoComponent);
    serverFixture.detectChanges();

    expect(serverFixture.nativeElement.querySelector('.logo-fallback')?.textContent?.trim()).toBe(
      'PROTOLUME',
    );
  });
});
