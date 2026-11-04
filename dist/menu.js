const menu = {
  coffee: [
    ['americano','アメリカーノ',105,'espresso, water'],
    ['spanish latte','スパニッシュラテ',155,'espresso, milk, house-made condensed milk'],
    ['sea salt latte','シーソルトラテ',180,'espresso, milk, sugar syrup, sea salt cream'],
    ['cereal latte','シリアルラテ',220,'espresso, overnight-soaked cereal base, milk, sugar syrup, crunchy cereal topping'],
    ['kurochata','クロチャタ',230,'espresso, overnight-soaked rice base, cinnamon, milk'],
  ],
  noncoffee: [
    ['chocolate cloud','チョコレート',240,'davao cacao chocolate, sea salt cream'],
    ['tokyo banana milk','東京バナナミルク',280,'fresh banana slices, banana sauce, milk'],
    ['strawberry milk','いちごミルク',130,'strawberry purée, milk'],
    ['horchata','オルチャータ',170,'overnight-soaked rice base, cinnamon, milk'],
  ],
  catcha: [
    ['matcha latte','抹茶ラテ',210,'matcha, oat milk, agave'],
    ['matcha sea salt cream','塩クリーム抹茶ラテ',230,'matcha, oat milk, agave, sea salt cream'],
    ['matcha ube','抹茶ウベ',250,'matcha, oat milk, agave, ube cream'],
    ['strawberry matcha','いちご抹茶',240,'matcha, oat milk, strawberry purée'],
    ['hojicha latte','ほうじ茶ラテ',235,'hojicha, oat milk, agave'],
    ['hojicha sea salt cream','塩クリームほうじ茶',255,'hojicha, oat milk, agave, sea salt cream'],
  ],
};

function glass(lazy = true) {
  return `<img class="glass" src="glass.svg" width="80" height="98" alt=""${lazy ? ' loading="lazy"' : ''}>`;
}

for (const [section, drinks] of Object.entries(menu)) {
  document.getElementById(`${section}-list`).innerHTML = drinks.map(drink => {
    const [name, japanese, price, ingredients] = drink;
    return `<li class="drink"><!-- REPLACE WITH ILLUSTRATION: ${name} -->${glass()}<div>
      <h3>${name} - ${price}</h3><p lang="ja">${japanese}</p><p class="ingredients">${ingredients}</p>
    </div></li>`;
  }).join('');
}

document.getElementById('hero-art').innerHTML = glass(false).repeat(3);
document.getElementById('glasses').innerHTML = glass().repeat(4);

const toggle = document.getElementById('toggle');
const links = document.getElementById('links');

function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
}

toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') === 'false'));
links.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (link && toggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    const section = document.querySelector(link.hash);
    section.tabIndex = -1;
    section.focus({ preventScroll: true });
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    toggle.focus();
  }
});
matchMedia('(min-width: 640px)').addEventListener('change', () => setMenu(false));

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(([entry]) => {
    document.body.classList.toggle('catcha-visible', entry.isIntersecting);
  }, { rootMargin: '0px 0px -25% 0px' });
  observer.observe(document.querySelector('.catcha'));
}
