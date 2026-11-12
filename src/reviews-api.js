// Fictional samples for the local demo. Photos are existing café menu artwork.
const samples = [
  ['Mika', 5, 'The matcha and dango made a lovely afternoon pairing.', 'matcha.jpg'],
  ['Ren', 4, 'I liked the layered coffee and the little details on the menu.', 'coffee.jpg'],
  ['Ari', 5, 'Strawberry milk is the one I would order again.', 'strawberry.jpg'],
  ['Yuki', 3, 'I would have liked a little less sweetness in my drink.'],
  ['Sam', 4, 'The sea salt cream was my favorite part of the latte.'],
  ['Jules', 5, 'The roasted hojicha paired nicely with the dango.'],
].map(([name, rating, message, art], index) => ({
  id: 'sample-' + index, name, rating, message, sample: true,
  date: new Date(Date.UTC(2025, 4, 12 - index, 12)).toISOString(),
  photo: art ? import.meta.env.BASE_URL + art : null,
}));
const key = 'cafe-mochi-postcards-v1';

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(saved) ? saved.filter(review =>
      review && typeof review.id === 'string' && typeof review.name === 'string' &&
      typeof review.message === 'string' && Number.isInteger(review.rating) &&
      review.rating >= 1 && review.rating <= 5 && Number.isFinite(Date.parse(review.date)) &&
      (review.photo === null || /^data:image\/(webp|jpeg);base64,/.test(review.photo))
    ) : [];
  } catch {
    return [];
  }
}

export async function getReviews() {
  return [...read(), ...samples];
}

export async function submitReview(data) {
  const review = {
    id: crypto.randomUUID(), name: data.name, rating: data.rating,
    message: data.message, photo: data.photo, date: new Date().toISOString(),
  };
  try {
    localStorage.setItem(key, JSON.stringify([review, ...read()]));
  } catch {
    throw new Error('your browser could not save this postcard. try again or remove the photo.');
  }
  return review;
}
