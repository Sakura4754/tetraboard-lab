(function (root) {
  'use strict';
  function createSevenBag(random = Math.random) {
    const bag = [0, 1, 2, 3, 4, 5, 6];
    for (let i = 6; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
  }
  function createSeedBoard() {
    return Array.from({length: 20}, () => Array(10).fill(-1));
  }
  function advanceBackToBack(state, result) {
    const current = state || {};
    const active = Boolean(current.active);
    const count = Math.max(0, Number(current.count) || 0);
    if (result.b2bEligible) return {active:true, count:count+1, broken:Boolean(current.broken)};
    if (active && result.cleared > 0) return {active:false, count:0, broken:true};
    return {active, count, broken:Boolean(current.broken)};
  }
  root.TetrisRules = {createSevenBag, createSeedBoard, advanceBackToBack};
})(window);
