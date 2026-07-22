/* ===== Ask a Mechanic — Diagnosis Engine =====
 *
 * Pure matching/scoring logic. No DOM access, no knowledge of the UI.
 * Reads window.MechanicSymptomGroups and window.MechanicKB (see
 * knowledge-base.js) — this file has zero hardcoded domain vocabulary, so
 * growing the knowledge base never requires touching this file.
 *
 * Public contract (this is the ONLY seam assets/mechanic/ui.js depends on):
 *
 *   MechanicEngine.diagnose(text, history, options) -> Promise<DiagnosisResult>
 *
 *   text    - the user's free-text description for this turn (a clarifying
 *             answer is folded into this same text by the UI before calling
 *             diagnose again — see ui.js — so the engine only ever needs to
 *             re-score plain text, never handle "answers" as a special case).
 *   history - array of prior turns in this panel session, { query, result }.
 *             Phase 1's rule engine doesn't read it, but it's threaded
 *             through now so a future provider can use it for context.
 *   options - optional bag, currently just { clarifyRound } (how many
 *             clarifying rounds have already happened for this question).
 *
 *   DiagnosisResult shapes:
 *     { type: 'match', query, matchedSymptoms, primary, secondary? }
 *     { type: 'ambiguous', query, matchedSymptoms, candidates, questions }
 *     { type: 'low-confidence', query }
 *     { type: 'out-of-scope', query }
 *
 * PHASE 2 SEAM: everything above the "internal implementation" divider
 * below could be replaced by a call to a real backend/AI service and
 * ui.js/site.css would need zero changes, as long as the same Promise/shape
 * contract is honored — diagnose() is Promise-based from day one for
 * exactly this reason, even though Phase 1 resolves near-instantly.
 */
(function () {
  var MATCH_THRESHOLD = 0.75;      // confidence needed for a confident, single-answer match
  var LOW_CONFIDENCE_FLOOR = 0.35; // below this, even the best guess isn't worth presenting as a diagnosis
  var SECONDARY_MARGIN = 0.2;      // "also consider" shown if within this of the primary
  var MAX_CLARIFY_ROUNDS = 2;      // matches product decision: ask at most twice, then commit to best guess
  var MAX_QUESTIONS = 3;

  // ---- internal implementation ----

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function phraseStrength(normalizedText, phrase) {
    var p = normalize(phrase);
    if (!p) return 0;
    if (p.indexOf(' ') !== -1) {
      // multi-word phrase: substring match, high confidence it's a real signal
      return normalizedText.indexOf(p) !== -1 ? 1.0 : 0;
    }
    // single word: word-boundary match, lower confidence (more likely coincidental)
    var re = new RegExp('\\b' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
    return re.test(normalizedText) ? 0.6 : 0;
  }

  function matchSymptomGroups(normalizedText) {
    var groups = window.MechanicSymptomGroups || [];
    var matched = {}; // id -> { id, label, strength }
    groups.forEach(function (g) {
      var best = 0;
      (g.keywords || []).concat(g.synonyms || []).forEach(function (phrase) {
        var s = phraseStrength(normalizedText, phrase);
        if (s > best) best = s;
      });
      if (best > 0) matched[g.id] = { id: g.id, label: g.label, strength: best };
    });
    return matched;
  }

  function scoreScenarios(matchedGroups) {
    var kb = window.MechanicKB || [];
    var candidates = [];
    kb.forEach(function (scenario) {
      var confidence = 0;
      (scenario.symptomGroups || []).forEach(function (link) {
        var m = matchedGroups[link.id];
        if (m) confidence += link.weight * m.strength;
      });
      if (confidence > 0) {
        candidates.push({ scenario: scenario, confidence: Math.min(1, confidence) });
      }
    });
    candidates.sort(function (a, b) { return b.confidence - a.confidence; });
    return candidates;
  }

  function collectQuestions(candidates) {
    var seen = {}, out = [];
    for (var i = 0; i < candidates.length && out.length < MAX_QUESTIONS; i++) {
      var qs = candidates[i].scenario.clarifyingQuestions || [];
      for (var j = 0; j < qs.length && out.length < MAX_QUESTIONS; j++) {
        if (!seen[qs[j].id]) { seen[qs[j].id] = 1; out.push(qs[j]); }
      }
    }
    return out;
  }

  function matchedSymptomsList(matchedGroups) {
    return Object.keys(matchedGroups)
      .map(function (id) { return matchedGroups[id]; })
      .sort(function (a, b) { return b.strength - a.strength; });
  }

  function diagnoseSync(text, history, options) {
    var opts = options || {};
    var clarifyRound = opts.clarifyRound || 0;
    var normalized = normalize(text);
    var matchedGroups = matchSymptomGroups(normalized);
    var matchedSymptoms = matchedSymptomsList(matchedGroups);
    var candidates = scoreScenarios(matchedGroups);

    if (!candidates.length) {
      return { type: 'out-of-scope', query: text };
    }

    var top = candidates[0];
    var second = candidates[1];

    if (top.confidence >= MATCH_THRESHOLD) {
      var result = { type: 'match', query: text, matchedSymptoms: matchedSymptoms, primary: top.scenario, primaryConfidence: top.confidence };
      if (second && (top.confidence - second.confidence) <= SECONDARY_MARGIN && second.confidence >= LOW_CONFIDENCE_FLOOR) {
        result.secondary = second.scenario;
        result.secondaryConfidence = second.confidence;
      }
      return result;
    }

    if (top.confidence >= LOW_CONFIDENCE_FLOOR) {
      var questions = clarifyRound < MAX_CLARIFY_ROUNDS ? collectQuestions(candidates.slice(0, 3)) : [];
      if (questions.length) {
        return { type: 'ambiguous', query: text, matchedSymptoms: matchedSymptoms, candidates: candidates.slice(0, 3), questions: questions };
      }
      // no clarifying questions available (or round cap reached) — present the best guess rather than a dead end
      return { type: 'match', query: text, matchedSymptoms: matchedSymptoms, primary: top.scenario, primaryConfidence: top.confidence, bestGuess: true };
    }

    return { type: 'low-confidence', query: text };
  }

  // ---- public contract ----

  window.MechanicEngine = {
    diagnose: function (text, history, options) {
      return Promise.resolve().then(function () { return diagnoseSync(text, history, options); });
    },
    CONFIG: { MATCH_THRESHOLD: MATCH_THRESHOLD, LOW_CONFIDENCE_FLOOR: LOW_CONFIDENCE_FLOOR, MAX_CLARIFY_ROUNDS: MAX_CLARIFY_ROUNDS }
  };
})();
