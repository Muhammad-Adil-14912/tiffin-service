function isValidListingInput({ title, description, price, category, image }) {
  const validText = (value, min, max) =>
    typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;
  const validPrice = (value) =>
    typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 1000000;

  return validText(title, 3, 100) &&
    validText(description, 10, 2000) &&
    price !== null &&
    typeof price === 'object' &&
    validPrice(price.daily) &&
    validPrice(price.weekly) &&
    validPrice(price.monthly) &&
    ['Veg', 'Non-Veg', 'Diet'].includes(category) &&
    (image === undefined || (typeof image === 'string' && image.length <= 2048));
}

module.exports = { isValidListingInput };
