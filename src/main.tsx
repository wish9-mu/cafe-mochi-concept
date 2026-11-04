import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { menu } from './menu';
import './style.css';

function Glass({ eager = false, src = "/glass.svg" }: { eager?: boolean; src?: string }) {
  return <img className="glass" src={import.meta.env.BASE_URL + src.slice(1)} width={80} height={98} alt="" loading={eager ? 'eager' : 'lazy'} />;
}

function GlassRow({ count, eager }: { count: number; eager?: boolean }) {
  return Array.from({ length: count }, (_, index) => <Glass key={index} eager={eager} />);
}

const drinkArt: Partial<Record<string, string>> = {
  'spanish latte': '/coffee.jpg',
  'strawberry milk': '/strawberry.jpg',
  'matcha latte': '/matcha.jpg',
};

function DrinkList({ category }: { category: keyof typeof menu }) {
  return (
    <ul className="drinks" id={`${category}-list`}>
      {menu[category].map(([name, japanese, price, ingredients]) => (
        <li className="drink" key={name} data-replace-with-illustration={name}>
          {/* REPLACE WITH ILLUSTRATION: use the drink name to identify its art. */}
          <Glass src={drinkArt[name]} />
          <div>
            <h3>{name} - {price}</h3>
            <p lang="ja">{japanese}</p>
            <p className="ingredients">{ingredients}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function App() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const catcha = useRef<HTMLElement>(null);

  useEffect(() => {
    const desktop = matchMedia('(min-width: 640px)');
    const close = () => setOpen(false);
    desktop.addEventListener('change', close);
    return () => desktop.removeEventListener('change', close);
  }, []);

  useEffect(() => {
    if (!open) return;
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [open]);

  useEffect(() => {
    const section = catcha.current;
    if (!section || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      document.body.classList.toggle('catcha-visible', entry.isIntersecting);
    }, { rootMargin: '0px 0px -25% 0px' });
    observer.observe(section);
    return () => {
      observer.disconnect();
      document.body.classList.remove('catcha-visible');
    };
  }, []);

  function followLink(event: MouseEvent<HTMLAnchorElement>) {
    if (!open) return;
    setOpen(false);
    const section = document.getElementById(event.currentTarget.hash.slice(1));
    if (section) {
      section.tabIndex = -1;
      section.focus({ preventScroll: true });
    }
  }

  return (
    <>
      <a className="skip" href="#main">skip to content</a>
      <header className="top"><div className="bar wrap">
      <a className="brand" href="#" aria-label="café mochi home">café mochi</a>
      <nav aria-label="Main navigation">
      <button ref={toggle} id="toggle" aria-controls="links" aria-expanded={open} onClick={() => setOpen(!open)}>menu <span aria-hidden="true">☰</span></button>
      <ul id="links"><li><a href="#menu" onClick={followLink}>menu</a></li><li><a href="#about" onClick={followLink}>about</a></li><li><a href="#visit" onClick={followLink}>visit</a></li></ul>
      </nav>
      </div></header>
      <main id="main">
      <section className="hero wrap" aria-labelledby="hello">
      <div className="hero-copy">
      <h1 id="hello">café mochi <span lang="ja">もち</span></h1>
      <p>coffee, matcha, and a cat in a cup.</p>
      <a className="pill" href="#menu">see the menu <span aria-hidden="true">↓</span></a>
      </div>
      <div className="hero-art" aria-hidden="true"><Glass src="/coffee.jpg" eager /><Glass src="/matcha.jpg" eager /><Glass src="/strawberry.jpg" eager /></div>
      </section>
      <div id="menu" className="menu wrap">
      <div className="columns">
      <section aria-labelledby="coffee"><h2 id="coffee">coffee <span lang="ja">コーヒー</span></h2><DrinkList category="coffee" /></section>
      <section aria-labelledby="noncoffee"><h2 id="noncoffee">non-coffee <span lang="ja">ノンコーヒー</span></h2><div className="glasses" aria-hidden="true"><GlassRow count={4} /></div><DrinkList category="noncoffee" /></section>
      </div>
      <section ref={catcha} className="catcha" aria-labelledby="catcha">
      <div className="catcha-heading"><img className="catcha-icon" src={import.meta.env.BASE_URL + "matchacat.jpg"} width={106} height={118} alt="" loading="lazy" /><h2 id="catcha">catcha <span lang="ja">キャッチャ</span></h2><p>Catcha drinks come with a skewer of three dango.</p></div>
      <DrinkList category="catcha" />
      </section>
      </div>
      <div className="backmatter"><div className="wrap details">
      <section id="about" aria-labelledby="story"><h2 id="story">our story <span lang="ja">私たちのこと</span></h2><p>Meet mochi, the little cat in our glass of milk. You’ll find it alongside espresso, strawberry milk, and our matcha and hojicha drinks.</p></section>
      <section id="visit" aria-labelledby="find">
        <h2 id="find">find us <span lang="ja">アクセス</span></h2>
        <dl><dt>hours</dt><dd>[HOURS]</dd></dl>
        <iframe
          className="visit-map"
          title="Google Maps location for café mochi"
          src="https://maps.google.com/maps?cid=6239025054877235567&amp;output=embed"
          width={520}
          height={300}
          loading="lazy"
          allowFullScreen
        />
        <div className="visit-links">
          <a className="pill" href="https://maps.app.goo.gl/G9DhD3x6AMMFFfAi7">open in Google Maps <span aria-hidden="true">↗</span></a>
          <a className="pill" href="https://www.instagram.com/thecafemochi/">@thecafemochi <span aria-hidden="true">↗</span></a>
        </div>
      </section>
      </div></div>
      </main>
      <footer className="wrap foot">café mochi <a href="https://www.instagram.com/thecafemochi/">@thecafemochi</a></footer>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
