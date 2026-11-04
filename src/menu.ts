export type Drink = readonly [name: string, japanese: string, price: number, ingredients: string];

export const menu = {
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
} as const satisfies Record<string, readonly Drink[]>;
