const links = [...document.querySelectorAll('nav a')];
const sections = links.map(link => document.querySelector(link.hash));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clouds = document.querySelector('.clouds');
const header = document.querySelector('header');
let frame = 0;

function updateScroll() {
  frame = 0;
  const boundary = header.getBoundingClientRect().bottom + 48;
  const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 3;
  const current = atEnd ? sections.at(-1) : sections.findLast(section => section.getBoundingClientRect().top <= boundary) ?? sections[0];
  links.forEach(link => {
    if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  if (!reduceMotion.matches && scrollY < sections[0].offsetHeight + 40) {
    clouds.style.setProperty('--drift', Math.min(22, scrollY * .07) + 'px');
  }
}

function queueScrollUpdate() {
  if (!frame) frame = requestAnimationFrame(updateScroll);
}

if ('IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      reveal.unobserve(entry.target);
    }
  }, { threshold:.12 });
  document.querySelectorAll('.reveal').forEach(section => reveal.observe(section));
}

addEventListener('scroll', queueScrollUpdate, { passive:true });
addEventListener('resize', queueScrollUpdate);
reduceMotion.addEventListener('change', queueScrollUpdate);
queueScrollUpdate();
