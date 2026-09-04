import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MOTION_RUNTIME_LOADER,
  MotionRuntimeService,
  type MotionRuntime,
  type MotionRuntimeLoader,
} from './motion-runtime.service';

describe('MotionRuntimeService', () => {
  it('does not initialize browser motion during SSR', async () => {
    const loader = jasmine.createSpy<MotionRuntimeLoader>('loader');
    configure(loader, 'server');

    const runtime = await TestBed.inject(MotionRuntimeService).load();

    expect(runtime).toBeNull();
    expect(loader).not.toHaveBeenCalled();
  });

  it('reuses one initialization and registers ScrollTrigger once', async () => {
    const registerPlugin = jasmine.createSpy('registerPlugin');
    const runtime = createRuntime(registerPlugin);
    const loader = jasmine
      .createSpy<MotionRuntimeLoader>('loader')
      .and.returnValue(Promise.resolve(runtime));
    configure(loader);
    const service = TestBed.inject(MotionRuntimeService);

    const [first, second] = await Promise.all([service.load(), service.load()]);

    expect(first).toBe(runtime);
    expect(second).toBe(runtime);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(registerPlugin).toHaveBeenCalledOnceWith(runtime.ScrollTrigger);
  });

  it('treats a loading failure as progressive enhancement', async () => {
    const loader = jasmine
      .createSpy<MotionRuntimeLoader>('loader')
      .and.returnValue(Promise.reject(new Error('motion unavailable')));
    configure(loader);
    const service = TestBed.inject(MotionRuntimeService);

    await expectAsync(service.load()).toBeResolvedTo(null);
    await expectAsync(service.load()).toBeResolvedTo(null);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  function configure(loader: MotionRuntimeLoader, platformId: object | string = 'browser'): void {
    TestBed.configureTestingModule({
      providers: [
        MotionRuntimeService,
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: MOTION_RUNTIME_LOADER, useValue: loader },
      ],
    });
  }

  function createRuntime(registerPlugin: jasmine.Spy): MotionRuntime {
    return {
      gsap: { registerPlugin } as unknown as MotionRuntime['gsap'],
      ScrollTrigger: {} as MotionRuntime['ScrollTrigger'],
    };
  }
});
