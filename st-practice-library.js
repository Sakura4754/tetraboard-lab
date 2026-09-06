(function(root){
  'use strict';
  const cache=new Map();let catalog;
  async function load(seed){
    if(cache.has(seed))return cache.get(seed);
    const response=await fetch(`./st-practice-cases/seed-${seed}.json`);
    if(!response.ok)throw Error('無法載入練習局');
    const game=await response.json();if(game.seed!==seed||game.b2b<200)throw Error('練習局驗證資料不符');
    cache.set(seed,game);return game;
  }
  async function random(){
    if(!catalog){const r=await fetch('./st-practice-cases/index.json');if(!r.ok)throw Error('100 局練習庫尚未就緒');catalog=await r.json();}
    if(catalog.cases.length!==100)throw Error('練習庫必須有 100 局');
    return load(catalog.cases[Math.floor(Math.random()*catalog.cases.length)].seed);
  }
  const boardKey=b=>b.map(r=>r.map(p=>p<0?'.':String(p)).join('')).join('/');
  function suggestion(board,current,hold,practice){
    const game=cache.get(practice.seed),step=game?.steps[practice.step];
    if(!step)return {candidate:null,message:game?'本局已完成 200 B2B 延續！按 Reset 換一局。':'正在載入練習局…'};
    if(boardKey(board)!==step.before)return {candidate:null,message:'已偏離通關盤面，請 Undo 回到提示路線，或 Reset 換一局。'};
    const beforeHold=current===step.current&&hold===step.hold;
    const afterHold=step.useHold&&current===step.played&&hold===step.current;
    if(!beforeHold&&!afterHold)return {candidate:null,message:'目前方塊／Hold 與通關路線不同，請 Undo。'};
    return {candidate:{...step.lock,source:step.useHold&&!afterHold?'hold':'current',cleared:step.cleared,tSpinDouble:step.tsd,tetris:step.cleared===4,b2bEligible:step.tsd||step.cleared===4,nextStrategyState:{practice:{...practice,step:practice.step+1}}},message:`練習局 ${game.seed} · 第 ${practice.step+1}/${game.steps.length} 塊（已驗證 200 B2B）`};
  }
  root.STPracticeLibrary={load,random,get:seed=>cache.get(seed),suggestion};
})(window);
