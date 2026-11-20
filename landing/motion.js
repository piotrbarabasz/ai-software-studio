/* Progressive enhancement for Protolume V3.
 * Content is ALWAYS visible by default. Animations only run for elements
 * entering the viewport in browsers supporting Web Animations.
 * No dependencies, global scroll listener, or scroll hijacking.
 */
(() => {
  'use strict';

  if (
    typeof window.matchMedia !== 'function' ||
    !('IntersectionObserver' in window) ||
    typeof Element.prototype.animate !== 'function'
  ) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;

  const configs = [
    { selector: '.area-card', offset: 16, duration: 560, stagger: 90 },
    { selector: '.step', offset: 18, duration: 560, stagger: 120 },
    { selector: '.solution-item', offset: 12, duration: 550, stagger: 100 },
    { selector: '.contact-intro', offset: 16, duration: 600, stagger: 0 },
    { selector: '#contact-form', offset: 20, duration: 650, stagger: 0 },
  ];

  const items = new Map();
  for (const group of configs) {
    document.querySelectorAll(group.selector).forEach((element, index) => {
      items.set(element, {
        offset: group.offset,
        duration: group.duration,
        delay: Math.min(index, 5) * group.stagger,
      });
    });
  }

  if (items.size === 0) return;

  const active = new Set();
  const observed = new Set(items.keys());
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || !observed.has(entry.target)) continue;
      observed.delete(entry.target);
      observer.unobserve(entry.target);

      // If the preference changed while an observation was queued, don't animate.
      if (reducedMotion.matches) continue;

      const { offset, duration, delay } = items.get(entry.target);
      const animation = entry.target.animate(
        [
          { opacity: 0, transform: 'translate3d(0, ' + offset + 'px, 0)' },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        ],
        {
          duration,
          delay,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'none',
        },
      );
      active.add(animation);
      const cleanup = () => active.delete(animation);
      animation.addEventListener('finish', cleanup, { once: true });
      animation.addEventListener('cancel', cleanup, { once: true });
    }
  }, {
    rootMargin: '0px 0px -24px 0px',
    threshold: 0.12,
  });

  for (const element of observed) observer.observe(element);

  const onPreferenceChange = (event) => {
    if (!event.matches) return;
    observer.disconnect();
    observed.clear();
    for (const animation of active) animation.cancel();
    active.clear();
    if (typeof reducedMotion.removeEventListener === 'function') {
      reducedMotion.removeEventListener('change', onPreferenceChange);
    }
  };
  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', onPreferenceChange);
  }
})();
