import { mechanicKnowledgeBase, mechanicSymptomGroups } from './mechanic-knowledge-base.js';

const LOW_CONFIDENCE_FLOOR = 0.35;

function normalize(text) {
  return String(text || '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function findSymptoms(text) {
  const normalized = normalize(text);
  const matches = {};
  mechanicSymptomGroups.forEach((group) => {
    let strength = 0;
    [...(group.keywords || []), ...(group.synonyms || [])].forEach((phrase) => {
      const term = normalize(phrase);
      const score = term.includes(' ')
        ? (normalized.includes(term) ? 1 : 0)
        : (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(normalized) ? 0.6 : 0);
      if (score > strength) strength = score;
    });
    if (strength > 0) matches[group.id] = { id: group.id, label: group.label, strength };
  });
  return matches;
}

/** Mirrors the site's existing local rule engine; it does not call a backend. */
export function diagnoseMechanic(text, _history = [], { clarifyRound = 0 } = {}) {
  const matches = findSymptoms(normalize(text));
  const matchedSymptoms = Object.values(matches).sort((a, b) => b.strength - a.strength);
  const candidates = mechanicKnowledgeBase.map((scenario) => {
    const score = (scenario.symptomGroups || []).reduce((sum, symptom) => {
      const match = matches[symptom.id];
      return sum + (match ? symptom.weight * match.strength : 0);
    }, 0);
    return score > 0 ? { scenario, confidence: Math.min(1, score) } : null;
  }).filter(Boolean).sort((a, b) => b.confidence - a.confidence);

  if (!candidates.length) return { type: 'out-of-scope', query: text };
  const primary = candidates[0];
  const secondary = candidates[1];
  if (primary.confidence >= 0.75) {
    const result = { type: 'match', query: text, matchedSymptoms, primary: primary.scenario, primaryConfidence: primary.confidence };
    if (secondary && primary.confidence - secondary.confidence <= 0.2 && secondary.confidence >= LOW_CONFIDENCE_FLOOR) {
      result.secondary = secondary.scenario;
      result.secondaryConfidence = secondary.confidence;
    }
    return result;
  }
  if (primary.confidence >= LOW_CONFIDENCE_FLOOR) {
    const questions = [];
    const used = new Set();
    if (clarifyRound < 2) {
      for (const candidate of candidates.slice(0, 3)) {
        for (const question of candidate.scenario.clarifyingQuestions || []) {
          if (!used.has(question.id) && questions.length < 3) {
            used.add(question.id);
            questions.push(question);
          }
        }
      }
    }
    if (questions.length) return { type: 'ambiguous', query: text, matchedSymptoms, candidates: candidates.slice(0, 3), questions };
    return { type: 'match', query: text, matchedSymptoms, primary: primary.scenario, primaryConfidence: primary.confidence, bestGuess: true };
  }
  return { type: 'low-confidence', query: text };
}
