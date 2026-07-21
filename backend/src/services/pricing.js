const WHOLESALE_HIGH_TIER_CENTS = 10000; // $100.00

function toCents(dollars) {
  return Math.round(dollars * 100);
}

function fromCents(cents) {
  return Math.round(cents) / 100;
}

// Rule 1 (wholesale < $100): markup depends on quantity.
// Rule 2 (wholesale >= $100): flat $50 markup regardless of quantity.
function calculateRetailTiers(wholesaleCost) {
  const wholesaleCents = toCents(wholesaleCost);
  const isHighTier = wholesaleCents >= WHOLESALE_HIGH_TIER_CENTS;

  const markupCents = isHighTier
    ? { qty1: 5000, qty2: 5000, qty3Plus: 5000 }
    : { qty1: 6500, qty2: 6000, qty3Plus: 5000 };

  return {
    qty1: fromCents(wholesaleCents + markupCents.qty1),
    qty2: fromCents(wholesaleCents + markupCents.qty2),
    qty3Plus: fromCents(wholesaleCents + markupCents.qty3Plus)
  };
}

module.exports = { calculateRetailTiers };
