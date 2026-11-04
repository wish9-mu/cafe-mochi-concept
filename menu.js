const menu = {
  coffee: [
    ['americano','アメリカーノ',105,'espresso, water','#6B3A28','#4A2C22','ice'],
    ['spanish latte','スパニッシュラテ',155,'espresso, milk, house-made condensed milk','#7A5848','#EFE6DA','ice'],
    ['sea salt latte','シーソルトラテ',180,'espresso, milk, sugar syrup, sea salt cream','#FBF8F0','#A17B59','foam'],
    ['cereal latte','シリアルラテ',220,'espresso, overnight-soaked cereal base, milk, sugar syrup, crunchy cereal topping','#F1D58A','#B58B56','cereal'],
    ['kurochata','クロチャタ',230,'espresso, overnight-soaked rice base, cinnamon, milk','#4A2C22','#EFE6DA','swirl'],
  ],
  noncoffee: [
    ['chocolate cloud','チョコレート',240,'davao cacao chocolate, sea salt cream','#FBF8F0','#4A2C22','foam'],
    ['tokyo banana milk','東京バナナミルク',280,'fresh banana slices, banana sauce, milk','#EFE6DA','#F1D58A','banana'],
    ['strawberry milk','いちごミルク',130,'strawberry purée, milk','#EFE6DA','#E98C9C','flecks'],
    ['horchata','オルチャータ',170,'overnight-soaked rice base, cinnamon, milk','#FBF8F0','#EFE6DA','flecks'],
  ],
  catcha: [
    ['matcha latte','抹茶ラテ',210,'matcha, oat milk, agave','#8DB36A','#EFE6DA','ice'],
    ['matcha sea salt cream','塩クリーム抹茶ラテ',230,'matcha, oat milk, agave, sea salt cream','#FBF8F0','#8DB36A','foam'],
    ['matcha ube','抹茶ウベ',250,'matcha, oat milk, agave, ube cream','#B8A2D6','#8DB36A','ice'],
    ['strawberry matcha','いちご抹茶',240,'matcha, oat milk, strawberry purée','#8DB36A','#E98C9C','flecks'],
    ['hojicha latte','ほうじ茶ラテ',235,'hojicha, oat milk, agave','#7A5848','#EFE6DA','ice'],
    ['hojicha sea salt cream','塩クリームほうじ茶',255,'hojicha, oat milk, agave, sea salt cream','#FBF8F0','#4A2C22','foam'],
  ],
};

const details = {
  ice: '<path d="m33 49 9-3 6 8-8 7z m20 12 9-4 5 7-7 6z" fill="#FBF8F0" opacity=".55"/>',
  foam: '<path d="M25 48q8-11 17-5q8-12 17-2q10-4 16 6" fill="#FBF8F0"/>',
  cereal: '<g fill="#F1D58A"><circle cx="34" cy="45" r="4"/><circle cx="49" cy="42" r="5"/><circle cx="62" cy="46" r="4"/></g>',
  banana: '<g fill="#F1D58A"><ellipse cx="39" cy="64" rx="6" ry="4"/><ellipse cx="60" cy="78" rx="6" ry="4"/></g>',
  swirl: '<path d="M32 65q20 11 33 3M37 81q8 5 20 4" fill="none" stroke="#FBF8F0" opacity=".7"/>',
  flecks: '<path d="m37 69 1 1m19 8 1 1m-12 11 1 1m9 7 1 1" opacity=".65"/>',
};

function glass(drink, dango = false) {
  const [name, , , , top, bottom, detail] = drink;
  const skewer = '<path d="M20 31 80 21"/><circle cx="32" cy="29" r="7" fill="#F2A3B8"/><circle cx="48" cy="26" r="7" fill="#FBF8F0"/><circle cx="64" cy="24" r="7" fill="#8DBF6B"/>';
  return `<!-- REPLACE WITH ILLUSTRATION: ${name} -->
    <svg class="glass" viewBox="0 0 100 122" width="80" height="98" role="img" aria-label="Placeholder illustration of ${name}${dango ? ' with dango' : ''}">
      <g stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
        <path d="M23 43Q48 38 77 43L68 108Q49 115 32 108Z" fill="${bottom}" stroke-dasharray="6 4"/>
        <path d="M24 49Q49 43 76 49L72 69Q60 75 49 70Q36 65 28 73Z" fill="${top}" stroke="none"/>
        <path d="M23 43Q49 36 77 43Q50 51 23 43Z" fill="#FBF8F0" fill-opacity=".44"/>
        ${details[detail]}
        <path d="m29 53 5 43m7 10q10 3 19 0" fill="none" stroke="#FBF8F0" opacity=".65"/>
        ${dango ? skewer : ''}
      </g>
    </svg>`;
}

for (const [section, drinks] of Object.entries(menu)) {
  document.getElementById(`${section}-list`).innerHTML = drinks.map(drink => {
    const [name, japanese, price, ingredients] = drink;
    return `<li class="drink">${glass(drink, section === 'catcha')}<div>
      <h3>${name} - ${price}</h3><p lang="ja">${japanese}</p><p class="ingredients">${ingredients}</p>
    </div></li>`;
  }).join('');
}

document.getElementById('hero-art').innerHTML = [
  glass(menu.coffee[1]), glass(menu.catcha[0], true), glass(menu.noncoffee[2]),
].join('');
document.getElementById('glasses').innerHTML = menu.noncoffee.map(drink => glass(drink)).join('');

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
