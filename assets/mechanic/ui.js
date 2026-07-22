/* ===== Ask a Mechanic — UI (DOM only; renders whatever MechanicEngine returns) ===== */
(function () {
  var PHONE = '+18134433869';
  var PHONE_DISP = '(813) 443-3869';
  var MAPS_URL = 'https://www.google.com/maps/dir/?api=1&destination=105+US-301+STE+103+Tampa+FL+33619';

  var EXAMPLES = [
    'My steering wheel shakes.',
    'My tire keeps losing air.',
    'Brake noise.',
    'Car pulls to one side.',
    'Vibration at highway speed.'
  ];

  var ICONS = {
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    phone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    pin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
    tire: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>'
  };

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function dotColor(kind, value) {
    var map = {
      safety: { Low: '#22a06b', Medium: '#e0a530', High: '#d64545' },
      drive: { Yes: '#22a06b', Caution: '#e0a530', No: '#d64545' },
      priority: { Monitor: '#22a06b', Soon: '#e0a530', Immediate: '#d64545' }
    };
    return (map[kind] && map[kind][value]) || '#888';
  }

  // ---- state: an in-memory conversation thread, reset when the panel closes ----
  var sessionHistory = []; // [{ id, query, effectiveText, clarifyRound, answeredQuestionIds, status, result }]
  var turnCounter = 0;

  var elFab, elOverlay, elPanel, elThread, elComposerInput, elComposerBtn;

  function build() {
    elFab = document.createElement('button');
    elFab.type = 'button';
    elFab.className = 'am-fab';
    elFab.setAttribute('aria-haspopup', 'dialog');
    elFab.setAttribute('aria-controls', 'amPanel');
    elFab.textContent = '🔧 Ask a Mechanic';
    document.body.appendChild(elFab);

    elOverlay = document.createElement('div');
    elOverlay.className = 'am-overlay';
    elOverlay.hidden = true;
    elOverlay.innerHTML =
      '<div class="am-backdrop" data-am-close></div>' +
      '<aside id="amPanel" class="am-panel" role="dialog" aria-modal="true" aria-label="Ask a Mechanic">' +
        '<div class="am-head">' +
          '<div class="am-head-t">🔧 Ask a Mechanic</div>' +
          '<button type="button" class="am-x" data-am-close aria-label="Close">' + ICONS.close + '</button>' +
        '</div>' +
        '<div class="am-thread" id="amThread"></div>' +
        '<div class="am-composer">' +
          '<textarea id="amInput" class="am-input" rows="2" placeholder="' + escapeHtml(EXAMPLES[0]) + '"></textarea>' +
          '<button type="button" class="am-send" id="amSend" disabled>Diagnose</button>' +
        '</div>' +
      '</aside>';
    document.body.appendChild(elOverlay);

    elThread = elOverlay.querySelector('#amThread');
    elComposerInput = elOverlay.querySelector('#amInput');
    elComposerBtn = elOverlay.querySelector('#amSend');

    wire();
    renderThread();
  }

  function openPanel() {
    elOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { elOverlay.querySelector('.am-panel').classList.add('is-open'); });
    setTimeout(function () { elComposerInput.focus(); }, 250);
  }

  function closePanel() {
    var panel = elOverlay.querySelector('.am-panel');
    panel.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { elOverlay.hidden = true; }, 250);
    // conversation memory is scoped to "while the panel remains open"
    sessionHistory = [];
    renderThread();
  }

  function rotatingPlaceholder() {
    var i = 0;
    setInterval(function () {
      if (document.activeElement === elComposerInput || elComposerInput.value) return;
      i = (i + 1) % EXAMPLES.length;
      elComposerInput.setAttribute('placeholder', EXAMPLES[i]);
    }, 3200);
  }

  function wire() {
    elFab.addEventListener('click', openPanel);
    elOverlay.addEventListener('click', function (e) {
      if (e.target.closest('[data-am-close]')) closePanel();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !elOverlay.hidden) closePanel();
    });
    elComposerInput.addEventListener('input', function () {
      elComposerBtn.disabled = !elComposerInput.value.trim();
    });
    elComposerInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!elComposerBtn.disabled) submitQuestion(); }
    });
    elComposerBtn.addEventListener('click', submitQuestion);

    // delegated clicks for dynamically-rendered thread content
    elThread.addEventListener('click', function (e) {
      var ex = e.target.closest('[data-am-example]');
      if (ex) { elComposerInput.value = ex.getAttribute('data-am-example'); elComposerBtn.disabled = false; elComposerInput.focus(); return; }

      var ans = e.target.closest('[data-am-answer]');
      if (ans) {
        var parts = ans.getAttribute('data-am-answer').split('::');
        answerQuestion(parts[0], parts[1], parts[2] === 'yes');
        return;
      }

      var tires = e.target.closest('[data-am-search-tires]');
      if (tires) { goToTires(); return; }
    });
  }

  function submitQuestion() {
    var text = elComposerInput.value.trim();
    if (!text) return;
    elComposerInput.value = '';
    elComposerBtn.disabled = true;
    var turn = { id: 'am-turn-' + (++turnCounter), query: text, effectiveText: text, clarifyRound: 0, answeredQuestionIds: {}, status: 'loading', result: null };
    sessionHistory.push(turn);
    renderThread();
    runDiagnose(turn);
  }

  function answerQuestion(turnId, questionId, isYes) {
    var turn = sessionHistory.filter(function (t) { return t.id === turnId; })[0];
    if (!turn) return;
    var q = ((turn.result && turn.result.questions) || []).filter(function (x) { return x.id === questionId; })[0];
    turn.answeredQuestionIds[questionId] = 1;
    if (isYes && q) turn.effectiveText += '. ' + q.appendOnYes;
    turn.status = 'loading';
    renderThread();
    runDiagnose(turn);
  }

  function historyForEngine() {
    return sessionHistory.map(function (t) { return { query: t.query, result: t.result }; });
  }

  function runDiagnose(turn) {
    // A rule engine resolves near-instantly, which reads as jarring/robotic —
    // a brief, deliberate pause makes "Analyzing your description…" register
    // as genuine consideration rather than flashing by unseen.
    var minDelay = new Promise(function (resolve) { setTimeout(resolve, 550); });
    Promise.all([
      MechanicEngine.diagnose(turn.effectiveText, historyForEngine(), { clarifyRound: turn.clarifyRound }),
      minDelay
    ]).then(function (values) {
      var result = values[0];
      if (result.type === 'ambiguous') {
        var visible = (result.questions || []).filter(function (q) { return !turn.answeredQuestionIds[q.id]; });
        if (!visible.length) {
          // nothing new left to ask — present the best current candidate instead of a dead end
          var top = result.candidates[0];
          turn.result = { type: 'match', query: turn.effectiveText, matchedSymptoms: result.matchedSymptoms, primary: top.scenario, primaryConfidence: top.confidence, bestGuess: true };
        } else {
          turn.clarifyRound += 1;
          turn.result = Object.assign({}, result, { questions: visible });
        }
      } else {
        turn.result = result;
      }
      turn.status = 'done';
      renderThread();
    });
  }

  // ---- "Search Tires": scroll to the finder if this page has one, else navigate to tires.html ----
  function goToTires() {
    closePanel();
    var finder = document.querySelector('[data-finder]');
    if (finder) {
      setTimeout(function () {
        finder.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var w = finder.querySelector('[data-finder-width]');
        if (w) setTimeout(function () { w.focus(); }, 450);
      }, 300);
    } else {
      window.location.href = 'tires.html';
    }
  }

  // ---- rendering ----

  function renderWelcome() {
    return (
      '<div class="am-welcome">' +
        '<p class="am-subtitle">Describe what\'s happening with your vehicle and we\'ll suggest the most likely causes.</p>' +
        '<div class="am-examples">' +
          EXAMPLES.map(function (ex) { return '<button type="button" class="am-example" data-am-example="' + escapeHtml(ex) + '">' + escapeHtml(ex) + '</button>'; }).join('') +
        '</div>' +
      '</div>'
    );
  }

  function renderActions(scenario) {
    var btns = '';
    if (scenario && scenario.tireRelated) {
      btns += '<button type="button" class="am-btn am-btn-tire" data-am-search-tires>' + ICONS.tire + ' Search Tires</button>';
    }
    btns +=
      '<a class="am-btn am-btn-call" href="tel:' + PHONE + '">' + ICONS.phone + ' Call Now</a>' +
      '<a class="am-btn am-btn-dir" href="' + MAPS_URL + '" target="_blank" rel="noopener">' + ICONS.pin + ' Get Directions</a>';
    return '<div class="am-actions">' + btns + '</div>';
  }

  function statTile(label, value, kind) {
    return (
      '<div class="am-stat">' +
        '<div class="am-stat-l">' + escapeHtml(label) + '</div>' +
        '<div class="am-stat-v"><span class="am-dot" style="background:' + dotColor(kind, value) + '"></span>' + escapeHtml(value) + '</div>' +
      '</div>'
    );
  }

  function scenarioCard(scenario, opts) {
    opts = opts || {};
    var symptomsChips = '';
    if (opts.matchedSymptoms && opts.matchedSymptoms.length > 1) {
      symptomsChips = '<div class="am-detected"><span class="am-detected-l">Detected:</span> ' +
        opts.matchedSymptoms.map(function (s) { return '<span class="am-chip">' + escapeHtml(s.label) + '</span>'; }).join(' ') +
        '</div>';
    }
    var guessNote = opts.bestGuess ? '<div class="am-guess-note">Best guess based on what you\'ve described so far.</div>' : '';
    return (
      symptomsChips +
      '<div class="am-card am-card-primary">' +
        '<div class="am-card-h">' + escapeHtml(scenario.title) + '</div>' +
        guessNote +
        '<div class="am-stats">' +
          statTile('Safety Level', scenario.safetyLevel, 'safety') +
          statTile('Can I Drive?', scenario.canDrive, 'drive') +
          statTile('Priority', scenario.repairPriority, 'priority') +
        '</div>' +
        '<div class="am-body-grid">' +
          '<div class="am-list-card"><div class="am-list-h">Possible Causes</div><ul>' + scenario.causes.map(function (c) { return '<li>' + escapeHtml(c) + '</li>'; }).join('') + '</ul></div>' +
          '<div class="am-list-card"><div class="am-list-h">Recommended Services</div><ul>' + scenario.services.map(function (c) { return '<li>' + escapeHtml(c) + '</li>'; }).join('') + '</ul></div>' +
        '</div>' +
        '<p class="am-next">' + escapeHtml(scenario.nextStep) + '</p>' +
        renderActions(scenario) +
      '</div>'
    );
  }

  function secondaryCard(scenario) {
    return (
      '<div class="am-card am-card-secondary">' +
        '<div class="am-card-h-sm">Also Consider: ' + escapeHtml(scenario.title) + '</div>' +
        '<div class="am-stats am-stats-sm">' +
          statTile('Safety', scenario.safetyLevel, 'safety') +
          statTile('Drive?', scenario.canDrive, 'drive') +
          statTile('Priority', scenario.repairPriority, 'priority') +
        '</div>' +
      '</div>'
    );
  }

  function renderTurnResult(turn) {
    if (turn.status === 'loading') {
      return '<div class="am-msg am-msg-assistant am-analyzing"><span class="am-dot-flash"></span> Analyzing your description…</div>';
    }
    var r = turn.result;
    if (!r) return '';

    if (r.type === 'out-of-scope') {
      return (
        '<div class="am-msg am-msg-assistant">This assistant only provides tire and automotive repair guidance, so I\'m not able to help with that. Ask me about noises, warning lights, tire issues, or how your vehicle is behaving, or reach us directly:</div>' +
        renderActions(null)
      );
    }
    if (r.type === 'low-confidence') {
      return (
        '<div class="am-msg am-msg-assistant">We couldn\'t determine the issue with confidence. Please call or visit us for a professional inspection.</div>' +
        renderActions(null)
      );
    }
    if (r.type === 'ambiguous') {
      return (
        '<div class="am-msg am-msg-assistant">Let me ask a few quick questions to improve the diagnosis.</div>' +
        '<div class="am-questions">' +
          r.questions.map(function (q) {
            return (
              '<div class="am-question">' +
                '<div class="am-question-t">' + escapeHtml(q.text) + '</div>' +
                '<div class="am-question-btns">' +
                  '<button type="button" class="am-qbtn" data-am-answer="' + turn.id + '::' + q.id + '::yes">Yes</button>' +
                  '<button type="button" class="am-qbtn am-qbtn-no" data-am-answer="' + turn.id + '::' + q.id + '::no">No</button>' +
                '</div>' +
              '</div>'
            );
          }).join('') +
        '</div>'
      );
    }
    // 'match'
    var out = scenarioCard(r.primary, { matchedSymptoms: r.matchedSymptoms, bestGuess: r.bestGuess });
    if (r.secondary) out += secondaryCard(r.secondary);
    return out;
  }

  function renderTurn(turn) {
    return (
      '<div class="am-turn">' +
        '<div class="am-msg am-msg-user">' + escapeHtml(turn.query) + '</div>' +
        renderTurnResult(turn) +
      '</div>'
    );
  }

  function renderThread() {
    if (!sessionHistory.length) {
      elThread.innerHTML = renderWelcome();
      return;
    }
    elThread.innerHTML = sessionHistory.map(renderTurn).join('');
    // Scroll so the newest turn starts at the top of the thread, not its end —
    // jumping to the absolute bottom would hide the new card's title/detected
    // symptoms below the fold, forcing the user to scroll back up to read it.
    var turnEls = elThread.querySelectorAll('.am-turn');
    var lastTurnEl = turnEls[turnEls.length - 1];
    if (lastTurnEl) {
      // offsetTop is relative to the nearest positioned ancestor, which isn't
      // necessarily elThread — measure directly against elThread's own
      // scroll position instead so this is correct regardless of ancestry.
      var delta = lastTurnEl.getBoundingClientRect().top - elThread.getBoundingClientRect().top;
      elThread.scrollTop = Math.max(0, elThread.scrollTop + delta - 6);
    }
  }

  function init() {
    build();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
