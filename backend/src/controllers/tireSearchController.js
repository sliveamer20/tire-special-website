const { searchTires } = require('../services/tireSearchService');

function isValidDimension(value, min, max) {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max;
}

async function getTireSearch(req, res, next) {
  const { width, ratio, diameter } = req.query;

  if (!isValidDimension(width, 100, 400) || !isValidDimension(ratio, 20, 100) || !isValidDimension(diameter, 10, 30)) {
    return res.status(400).json({
      status: 'error',
      message: 'width, ratio and diameter query parameters are required and must be valid tire dimensions.'
    });
  }

  try {
    const results = await searchTires({
      width: Number(width),
      ratio: Number(ratio),
      diameter: Number(diameter)
    });

    res.json({
      status: 'ok',
      size: `${width}/${ratio}R${diameter}`,
      count: results.length,
      results
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTireSearch };
