import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { siteContent } from '../../core/content/site.pl';
import { ServiceLandingPageComponent } from './service-landing-page.component';

function routeStub(path: string): Pick<ActivatedRoute, 'data' | 'snapshot'> {
  return {
    data: of({ canonicalPath: path }),
    snapshot: { data: { canonicalPath: path } } as unknown as ActivatedRoute['snapshot'],
  };
}

async function createFixture(path: string, server = false) {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [ServiceLandingPageComponent],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: routeStub(path) },
      ...(server ? [{ provide: PLATFORM_ID, useValue: 'server' }] : []),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ServiceLandingPageComponent);
  fixture.detectChanges();
  return fixture;
}

describe('ServiceLandingPageComponent', () => {
  it('renders the chatbot landing page with one H1 and the required internal links', async () => {
    const fixture = await createFixture('/rozwiazania/chatbot-ai-dla-firm');
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('h1')).toHaveSize(1);
    expect(element.querySelector('h1')?.textContent).toContain(
      'Chatbot AI i asystent wiedzy dla firm',
    );
    expect(element.querySelector('.hero-result')?.textContent).toContain('Mniej czasu na szukanie');
    expect(element.querySelector('a[href="/kontakt?projectType=rag_chatbot_demo"]')).not.toBeNull();
    expect(element.querySelector('a[href="/przyklad-demo"]')).not.toBeNull();
    expect(element.querySelector('a[href="/rozwiazania#asystent-wiedzy"]')).not.toBeNull();
    expect(element.querySelectorAll('.flow-step')).toHaveSize(5);
    expect(element.querySelectorAll('details')).toHaveSize(5);
    expect(element.querySelectorAll('img, video, iframe, object, embed')).toHaveSize(0);
  });

  it('selects the requested landing page content from the route data', async () => {
    const fixture = await createFixture('/rozwiazania/systemy-agentowe');
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Systemy agentowe');
    expect(element.textContent).toContain('Mniej ręcznego nadzoru');
    expect(fixture.componentInstance.content.path).toBe('/rozwiazania/systemy-agentowe');
    expect(fixture.componentInstance.content.serviceType).toBe('Systemy agentowe');
    expect(siteContent.serviceLandingPages).toHaveSize(5);
  });

  it('renders without browser-only APIs during SSR', async () => {
    const fixture = await createFixture('/rozwiazania/voice-ai-dla-firm', true);

    expect(fixture.nativeElement.querySelectorAll('h1')).toHaveSize(1);
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
  });
});
