import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';

import { ProtolumeLogoComponent } from './protolume-logo.component';
import { publicBrand } from '../../../core/brand/public-brand.config';

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
    await TestBed.configureTestingModule({
      imports: [ProtolumeLogoComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(ProtolumeLogoComponent);
    fixture.detectChanges();
  });

  it('renders the configured horizontal asset', () => {
    const image = fixture.nativeElement.querySelector('img');
    expect(image?.getAttribute('src')).toBe('/assets/protolume-logo-horizontal-dark.svg');
    expect(image?.getAttribute('width')).toBe('957');
    expect(image?.getAttribute('height')).toBe('190');
  });

  it('renders a text fallback when no logo asset is configured', () => {
    const logos = publicBrand.visualIdentity.logos;
    const configured = logos.horizontalDark;
    Object.assign(logos, { horizontalDark: undefined });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.logo-fallback')?.textContent?.trim()).toBe(
      'PROTOLUME',
    );
    expect(fixture.nativeElement.querySelector('.logo-image')).toBeNull();
    Object.assign(logos, { horizontalDark: configured });
    fixture.detectChanges();
  });

  it('renders the symbol fallback for the symbol variant', () => {
    fixture.componentInstance.variant = 'symbol';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.logo-image')?.getAttribute('src')).toBe(
      '/assets/protolume-symbol.svg',
    );
  });

  it('provides an accessible home link without duplicating the image label', () => {
    fixture.componentInstance.linkToHome = true;
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a');
    expect(link?.getAttribute('aria-label')).toBe('Protolume — strona główna');
    expect(link?.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('supports decorative usage and a custom accessible label', () => {
    fixture.componentInstance.accessibleLabel = 'Znak Protolume';
    fixture.detectChanges();

    const logos = publicBrand.visualIdentity.logos;
    const configured = logos.horizontalDark;
    Object.assign(logos, { horizontalDark: undefined });
    fixture.detectChanges();
    const fallback = fixture.nativeElement.querySelector('.logo-fallback');
    expect(fallback?.getAttribute('aria-label')).toBe('Znak Protolume');
    expect(fallback?.hasAttribute('aria-hidden')).toBeFalse();
    Object.assign(logos, { horizontalDark: configured });
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

    expect(serverFixture.nativeElement.querySelector('img')?.getAttribute('src')).toBe(
      '/assets/protolume-logo-horizontal-dark.svg',
    );
  });
});
