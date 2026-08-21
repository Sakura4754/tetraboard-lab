(function () {
  "use strict";

  const ROWS = 20;
  const COLS = 10;
  const FOUR_COLUMN_COMBO_COLS = 4;
  const EMPTY = -1;
  const SAVE_STORAGE_KEY = "tetraboard-lab-saves-v1";
  const FOUR_COLUMN_COMBO_SAVE_STORAGE_KEY = "tetraboard-lab-four-column-combo-saves-v1";
  const PIECES = ["I", "O", "T", "L", "J", "S", "Z"];
  const PIECE_CHARS = ["i", "o", "t", "l", "j", "s", "z"];
  const PIECE_FROM_CHAR = { i: 0, o: 1, t: 2, l: 3, j: 4, s: 5, z: 6 };
  const TRAINER_PREVIEW_COUNT = 14;
  const FOUR_COLUMN_COMBO_PATTERN_STRINGS = [
    "    \n    \n    \n111 \n",
    "    \n    \n    \n 111\n",
    "    \n    \n1   \n11  \n",
    "    \n    \n   1\n  11\n",
    "    \n    \n11  \n1   \n",
    "    \n    \n  11\n   1\n",
    "    \n1   \n1   \n1   \n",
    "    \n   1\n   1\n   1\n",
    "    \n    \n11  \n 1  \n",
    "    \n    \n  11\n  1 \n",
    "    \n    \n 1  \n11  \n",
    "    \n    \n  1 \n  11\n",
    "    \n    \n    \n11 1\n",
    "    \n    \n    \n1 11\n",
    "    \n    \n1   \n1 1 \n",
    "    \n    \n   1\n 1 1\n",
    "    \n    \n1   \n1  1\n",
    "    \n    \n   1\n1  1\n",
    "    \n    \n 1  \n1  1\n",
    "    \n    \n  1 \n1  1\n",
    "    \n    \n   1\n11  \n",
    "    \n    \n1   \n  11\n",
    "    \n    \n   1\n 11 \n",
    "    \n    \n1   \n 11 \n",
    "    \n    \n   1\n1 1 \n",
    "    \n    \n1   \n 1 1\n",
    "    \n    \n 11 \n1   \n",
    "    \n    \n 11 \n   1\n"
  ];
  const FOUR_COLUMN_COMBO_ROTATION_STATES = {
    0: [0, 1],
    1: [0],
    2: [0, 1, 2, 3],
    3: [0, 1, 2, 3],
    4: [0, 1, 2, 3],
    5: [0, 1],
    6: [0, 1]
  };
  const COLORS = [
    "#27d7f2",
    "#ffd938",
    "#bf83ff",
    "#ff9948",
    "#3f8df5",
    "#42df7e",
    "#ff5959",
    "#b8c0ce"
  ];
  const PAINT_COLORS = [
    "#16b7d0",
    "#d9b623",
    "#9f63db",
    "#d97629",
    "#256bd0",
    "#2ca95c",
    "#d43d3d",
    "#8994a5"
  ];

  function shuffledBag() {
    const bag = PIECES.map((_, index) => index);
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
  }

  const SHAPES = [
    [
      [[0, 1], [1, 1], [2, 1], [3, 1]],
      [[2, 0], [2, 1], [2, 2], [2, 3]],
      [[0, 2], [1, 2], [2, 2], [3, 2]],
      [[1, 0], [1, 1], [1, 2], [1, 3]]
    ],
    [
      [[1, 0], [2, 0], [1, 1], [2, 1]],
      [[1, 0], [2, 0], [1, 1], [2, 1]],
      [[1, 0], [2, 0], [1, 1], [2, 1]],
      [[1, 0], [2, 0], [1, 1], [2, 1]]
    ],
    [
      [[0, 1], [1, 1], [2, 1], [1, 0]],
      [[1, 0], [1, 1], [2, 1], [1, 2]],
      [[0, 1], [1, 1], [2, 1], [1, 2]],
      [[1, 0], [0, 1], [1, 1], [1, 2]]
    ],
    [
      [[0, 1], [1, 1], [2, 1], [2, 0]],
      [[1, 0], [1, 1], [1, 2], [2, 2]],
      [[0, 2], [0, 1], [1, 1], [2, 1]],
      [[0, 0], [1, 0], [1, 1], [1, 2]]
    ],
    [
      [[0, 1], [1, 1], [2, 1], [0, 0]],
      [[1, 0], [1, 1], [1, 2], [2, 0]],
      [[0, 1], [1, 1], [2, 1], [2, 2]],
      [[0, 2], [1, 0], [1, 1], [1, 2]]
    ],
    [
      [[1, 0], [2, 0], [0, 1], [1, 1]],
      [[1, 0], [1, 1], [2, 1], [2, 2]],
      [[1, 1], [2, 1], [0, 2], [1, 2]],
      [[0, 0], [0, 1], [1, 1], [1, 2]]
    ],
    [
      [[0, 0], [1, 0], [1, 1], [2, 1]],
      [[2, 0], [1, 1], [2, 1], [1, 2]],
      [[0, 1], [1, 1], [1, 2], [2, 2]],
      [[1, 0], [0, 1], [1, 1], [0, 2]]
    ]
  ];

  const KICKS = {
    jlstz: {
      "0>1": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
      "1>0": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
      "1>2": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
      "2>1": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
      "2>3": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
      "3>2": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
      "3>0": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
      "0>3": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
    },
    i: {
      "0>1": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
      "1>0": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
      "1>2": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
      "2>1": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
      "2>3": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
      "3>2": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
      "3>0": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
      "0>3": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]
    }
  };

  const boardCanvas = document.getElementById("boardCanvas");
  const ctx = boardCanvas.getContext("2d");
  const paletteEl = document.getElementById("palette");
  const trayEl = document.getElementById("pieceTray");
  const comboBoxEl = document.getElementById("comboBox");
  const linesBoxEl = document.getElementById("linesBox");
  const trainerSwitchesEl = document.getElementById("trainerSwitches");
  const previewToggleBtn = document.getElementById("previewToggleBtn");
  const ghostToggleBtn = document.getElementById("ghostToggleBtn");
  const autoClearToggleBtn = document.getElementById("autoClearToggleBtn");
  const holdCanvas = document.getElementById("holdCanvas");
  const holdEl = document.getElementById("holdSlot");

  const state = {
    board: Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY)),
    groups: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
    pieceRecords: {},
    nextGroupId: 1,
    trayOrder: shuffledBag(),
    usedPieces: Array(7).fill(false),
    holdPiece: null,
    holdLocked: false,
    mode: "editor",
    savedEditor: null,
    trainerQueue: [],
    trainerBag: [],
    trainerSuggestions: [],
    trainerCombo: 0,
    trainerLines: 0,
    trainerPreviewCount: 5,
    trainerGhostEnabled: true,
    trainerAutoClearEnabled: false,
    trainerAutoClearTimer: 0,
    trainerAutoClearKey: "",
    trainerPieceStartSnapshot: null,
    undo: [],
    tool: "piece",
    paint: 7,
    active: null,
    pointer: null
  };

  const placementCache = new Map();
  let fourColumnComboPatternTable = null;
  let lastInteractionHapticAt = -Infinity;
  let lastBoardTouchEndAt = -Infinity;

  function haptic(duration = 14) {
    if (navigator.vibrate) {
      navigator.vibrate(duration);
    }
  }

  function interactionHaptic(duration = 6, minInterval = 28) {
    const now = performance.now();
    if (now - lastInteractionHapticAt < minInterval) return;
    lastInteractionHapticAt = now;
    haptic(duration);
  }

  function copyBoard(board) {
    return board.map(row => row.slice());
  }

  function boardCols() {
    return state.mode === "fourColumnCombo" ? FOUR_COLUMN_COMBO_COLS : COLS;
  }

  function makeBoard(cols, fill = EMPTY) {
    return Array.from({ length: ROWS }, () => Array(cols).fill(fill));
  }

  function snapshotState() {
    return {
      board: copyBoard(state.board),
      groups: copyBoard(state.groups),
      pieceRecords: JSON.parse(JSON.stringify(state.pieceRecords)),
      nextGroupId: state.nextGroupId,
      trayOrder: state.trayOrder.slice(),
      usedPieces: state.usedPieces.slice(),
      holdPiece: state.holdPiece,
      holdLocked: state.holdLocked,
      trainerQueue: state.trainerQueue.slice(),
      trainerBag: state.trainerBag.slice(),
      trainerCombo: state.trainerCombo,
      trainerLines: state.trainerLines,
      trainerPreviewCount: state.trainerPreviewCount,
      trainerGhostEnabled: state.trainerGhostEnabled,
      trainerAutoClearEnabled: state.trainerAutoClearEnabled,
      active: state.active ? { ...state.active } : null
    };
  }

  function pushUndo() {
    state.undo.push(snapshotState());
    if (state.undo.length > 80) state.undo.shift();
  }

  function pushSnapshotUndo(snapshot) {
    if (!snapshot) return;
    state.undo.push(JSON.parse(JSON.stringify(snapshot)));
    if (state.undo.length > 80) state.undo.shift();
  }

  function restore(snapshot) {
    cancelTrainerAutoClear();
    state.board = copyBoard(snapshot.board);
    const cols = snapshot.board?.[0]?.length || boardCols();
    state.groups = snapshot.groups ? copyBoard(snapshot.groups) : Array.from({ length: ROWS }, () => Array(cols).fill(0));
    state.pieceRecords = snapshot.pieceRecords ? JSON.parse(JSON.stringify(snapshot.pieceRecords)) : {};
    state.nextGroupId = snapshot.nextGroupId || 1;
    state.trayOrder = snapshot.trayOrder ? snapshot.trayOrder.slice() : PIECES.map((_, index) => index);
    state.usedPieces = snapshot.usedPieces ? snapshot.usedPieces.slice() : Array(7).fill(false);
    state.holdPiece = Number.isInteger(snapshot.holdPiece) ? snapshot.holdPiece : null;
    state.holdLocked = Boolean(snapshot.holdLocked);
    if (state.mode === "fourColumnCombo") {
      state.trainerQueue = Array.isArray(snapshot.trainerQueue) ? snapshot.trainerQueue.slice() : [];
      state.trainerBag = Array.isArray(snapshot.trainerBag) ? snapshot.trainerBag.slice() : [];
      state.trainerCombo = Number.isInteger(snapshot.trainerCombo) ? snapshot.trainerCombo : 0;
      state.trainerLines = Number.isInteger(snapshot.trainerLines) ? snapshot.trainerLines : 0;
      state.trainerPreviewCount = snapshot.trainerPreviewCount === 3 ? 3 : 5;
      state.trainerGhostEnabled = snapshot.trainerGhostEnabled !== false;
      state.trainerAutoClearEnabled = Boolean(snapshot.trainerAutoClearEnabled);
      fillTrainerQueue();
    }
    state.active = snapshot.active ? { ...snapshot.active } : null;
    if (state.mode === "fourColumnCombo") {
      analyzeTrainer();
      rememberTrainerPieceStart();
      scheduleTrainerAutoClear();
    }
    drawAll();
  }

  function rememberTrainerPieceStart() {
    if (state.mode !== "fourColumnCombo" || !state.active) return;
    state.trainerPieceStartSnapshot = snapshotState();
  }

  function snapshotMatchesCurrent(snapshot) {
    if (!snapshot) return false;
    return boardKey(snapshot.board) === boardKey(state.board)
      && isSamePlacement(snapshot.active, state.active)
      && snapshot.holdPiece === state.holdPiece
      && Boolean(snapshot.holdLocked) === state.holdLocked
      && JSON.stringify(snapshot.trainerQueue || []) === JSON.stringify(state.trainerQueue)
      && JSON.stringify(snapshot.trainerBag || []) === JSON.stringify(state.trainerBag);
  }

  function boardMetrics() {
    const rect = boardCanvas.getBoundingClientRect();
    if (state.mode === "fourColumnCombo") {
      return {
        rect,
        cell: rect.width / COLS,
        logicalOffsetX: Math.floor((COLS - FOUR_COLUMN_COMBO_COLS) / 2),
        scaleX: boardCanvas.width / rect.width,
        scaleY: boardCanvas.height / rect.height
      };
    }
    return {
      rect,
      cell: rect.width / boardCols(),
      scaleX: boardCanvas.width / rect.width,
      scaleY: boardCanvas.height / rect.height
    };
  }

  function cellsFor(piece) {
    return SHAPES[piece.piece][piece.rotation & 3].map(([x, y]) => [piece.x + x, piece.y + y]);
  }

  function isValid(piece) {
    const cols = boardCols();
    return cellsFor(piece).every(([x, y]) => x >= 0 && x < cols && y >= 0 && y < ROWS && state.board[y][x] === EMPTY);
  }

  function clampPieceIntoBoard(piece) {
    const shape = SHAPES[piece.piece][piece.rotation & 3];
    const minX = Math.min(...shape.map(([x]) => x));
    const maxX = Math.max(...shape.map(([x]) => x));
    const minY = Math.min(...shape.map(([, y]) => y));
    const maxY = Math.max(...shape.map(([, y]) => y));
    return {
      ...piece,
      x: clamp(piece.x, -minX, boardCols() - 1 - maxX),
      y: clamp(piece.y, -minY, ROWS - 1 - maxY)
    };
  }

  function commitActive() {
    if (!state.active || !isValid(state.active)) return false;
    pushUndo();
    commitActiveIntoBoard();
    haptic();
    drawAll();
    return true;
  }

  function commitActiveIntoBoard() {
    const groupId = state.active.groupId || state.nextGroupId++;
    for (const [x, y] of cellsFor(state.active)) {
      state.board[y][x] = state.active.piece;
      state.groups[y][x] = groupId;
    }
    state.pieceRecords[groupId] = {
      piece: state.active.piece,
      rotation: state.active.rotation,
      x: state.active.x,
      y: state.active.y
    };
    state.active = null;
    state.holdLocked = false;
  }

  function selectPlacedPiece(x, y) {
    const groupId = state.groups[y]?.[x] || 0;
    const record = state.pieceRecords[groupId];
    if (!groupId || !record) return false;

    pushUndo();
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (state.groups[row][col] !== groupId) continue;
        state.board[row][col] = EMPTY;
        state.groups[row][col] = 0;
      }
    }
    delete state.pieceRecords[groupId];
    state.active = { ...record, groupId };
    state.holdLocked = false;
    return true;
  }

  function dissolveGroup(groupId) {
    if (!groupId) return;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (state.groups[row][col] === groupId) state.groups[row][col] = 0;
      }
    }
    delete state.pieceRecords[groupId];
  }

  function rebuildPieceRecords() {
    const records = {};
    const groupedCells = {};
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const groupId = state.groups[y][x];
        if (!groupId) continue;
        (groupedCells[groupId] ||= []).push([x, y]);
      }
    }

    for (const [groupId, cells] of Object.entries(groupedCells)) {
      const piece = state.board[cells[0][1]][cells[0][0]];
      let found = null;
      if (cells.length === 4 && piece >= 0 && piece < 7) {
        const actual = new Set(cells.map(([x, y]) => `${x},${y}`));
        for (let rotation = 0; rotation < 4 && !found; rotation++) {
          for (const [baseX, baseY] of cells) {
            for (const [shapeX, shapeY] of SHAPES[piece][rotation]) {
              const x = baseX - shapeX;
              const y = baseY - shapeY;
              const expected = SHAPES[piece][rotation].map(([dx, dy]) => `${x + dx},${y + dy}`);
              if (expected.every(cell => actual.has(cell))) {
                found = { piece, rotation, x, y };
                break;
              }
            }
            if (found) break;
          }
        }
      }
      if (found) {
        records[groupId] = found;
      } else {
        for (const [x, y] of cells) state.groups[y][x] = 0;
      }
    }
    state.pieceRecords = records;
  }

  function rotateActive(dir) {
    if (!state.active) return;
    const from = state.active.rotation & 3;
    const to = (from + dir + 4) & 3;
    const table = state.active.piece === 0 ? KICKS.i : KICKS.jlstz;
    const kicks = state.active.piece === 1 ? [[0, 0]] : (table[`${from}>${to}`] || [[0, 0]]);
    for (const [kx, ky] of kicks) {
      const test = { ...state.active, rotation: to, x: state.active.x + kx, y: state.active.y - ky };
      if (isValid(test)) {
        state.active = test;
        drawBoard();
        haptic(6);
        return;
      }
    }
  }

  function clearLines() {
    if (state.mode === "fourColumnCombo") {
      lockTrainerActive();
      return;
    }
    pushUndo();
    if (state.active && isValid(state.active)) {
      commitActiveIntoBoard();
    }
    const keptRows = state.board.map((row, index) => ({ row, index })).filter(item => item.row.some(cell => cell === EMPTY));
    const next = keptRows.map(item => item.row);
    const nextGroups = keptRows.map(item => state.groups[item.index]);
    const cleared = ROWS - next.length;
    while (next.length < ROWS) {
      next.unshift(Array(COLS).fill(EMPTY));
      nextGroups.unshift(Array(COLS).fill(0));
    }
    state.board = next;
    state.groups = nextGroups;
    rebuildPieceRecords();
    if (cleared === 0) state.undo.pop();
    haptic();
    drawAll();
  }

  function cellsForPlacement(piece) {
    return SHAPES[piece.piece][piece.rotation & 3].map(([x, y]) => [piece.x + x, piece.y + y]);
  }

  function isPlacementValid(piece, board, cols) {
    return cellsForPlacement(piece).every(([x, y]) => x >= 0 && x < cols && y >= 0 && y < ROWS && board[y][x] === EMPTY);
  }

  function placementStateKey(piece) {
    return `${piece.piece}:${piece.rotation & 3}:${piece.x}:${piece.y}`;
  }

  function spawnPlacementFor(pieceIndex, cols) {
    const shape = SHAPES[pieceIndex][0];
    const minX = Math.min(...shape.map(([x]) => x));
    const maxX = Math.max(...shape.map(([x]) => x));
    const width = maxX - minX + 1;
    return {
      piece: pieceIndex,
      rotation: 0,
      x: clamp(Math.floor((cols - width) / 2) - minX, -minX, cols - 1 - maxX),
      y: 0
    };
  }

  function rotatePlacementOnBoard(piece, dir, board, cols) {
    const from = piece.rotation & 3;
    const to = (from + dir + 4) & 3;
    const table = piece.piece === 0 ? KICKS.i : KICKS.jlstz;
    const kicks = piece.piece === 1 ? [[0, 0]] : (table[`${from}>${to}`] || [[0, 0]]);
    for (const [kx, ky] of kicks) {
      const test = { ...piece, rotation: to, x: piece.x + kx, y: piece.y - ky };
      if (isPlacementValid(test, board, cols)) return test;
    }
    return null;
  }

  function reachableLockPlacements(board, pieceIndex, cols) {
    const start = spawnPlacementFor(pieceIndex, cols);
    if (!isPlacementValid(start, board, cols)) return [];

    const queue = [start];
    const seen = new Set([placementStateKey(start)]);
    const states = [];
    for (let index = 0; index < queue.length; index++) {
      const current = queue[index];
      states.push(current);

      const candidates = [
        { ...current, x: current.x - 1 },
        { ...current, x: current.x + 1 },
        { ...current, y: current.y + 1 },
        rotatePlacementOnBoard(current, 1, board, cols),
        rotatePlacementOnBoard(current, -1, board, cols)
      ].filter(Boolean);

      for (const next of candidates) {
        if (!isPlacementValid(next, board, cols)) continue;
        const key = placementStateKey(next);
        if (seen.has(key)) continue;
        seen.add(key);
        queue.push(next);
      }
    }

    const lockable = [];
    const lockSeen = new Set();
    for (const piece of states) {
      if (isPlacementValid({ ...piece, y: piece.y + 1 }, board, cols)) continue;
      const key = placementStateKey(piece);
      if (lockSeen.has(key)) continue;
      lockSeen.add(key);
      lockable.push(piece);
    }
    return lockable;
  }

  function landingOnBoard(piece, board, cols) {
    let landing = { ...piece };
    if (!isPlacementValid(landing, board, cols)) return null;
    while (isPlacementValid({ ...landing, y: landing.y + 1 }, board, cols)) landing.y++;
    return landing;
  }

  function mergePlacement(board, piece, value) {
    const next = copyBoard(board);
    for (const [x, y] of cellsForPlacement(piece)) {
      if (y >= 0 && y < ROWS && x >= 0 && x < next[y].length) next[y][x] = value;
    }
    return next;
  }

  function clearFullLinesFrom(board, cols) {
    const kept = board.filter(row => row.some(cell => cell === EMPTY));
    const cleared = ROWS - kept.length;
    while (kept.length < ROWS) kept.unshift(Array(cols).fill(EMPTY));
    return { board: kept, cleared };
  }

  function enumerateComboPlacements(board, pieceIndex, cols) {
    const cacheKey = `${cols}|${pieceIndex}|${boardKey(board)}`;
    if (placementCache.has(cacheKey)) return placementCache.get(cacheKey);
    if (placementCache.size > 3000) placementCache.clear();

    const placements = [];
    const seen = new Set();
    for (const landing of reachableLockPlacements(board, pieceIndex, cols)) {
      const merged = mergePlacement(board, landing, pieceIndex);
      const result = clearFullLinesFrom(merged, cols);
      if (result.cleared <= 0) continue;
      const key = placementStateKey(landing);
      if (seen.has(key)) continue;
      seen.add(key);
      placements.push({ piece: landing, board: result.board, cleared: result.cleared });
    }
    placementCache.set(cacheKey, placements);
    return placements;
  }

  function surfaceHeight(board) {
    let maxHeight = 0;
    for (let y = 0; y < ROWS; y++) {
      if (board[y].some(cell => cell !== EMPTY)) {
        maxHeight = ROWS - y;
        break;
      }
    }
    return maxHeight;
  }

  function acceptablePieceCount(board, cols) {
    let count = 0;
    for (let piece = 0; piece < 7; piece++) {
      if (enumerateComboPlacements(board, piece, cols).length > 0) count++;
    }
    return count;
  }

  function boardKey(board) {
    return board.map(row => row.map(cell => cell === EMPTY ? "." : "#").join("")).join("/");
  }

  function miniFromPatternString(value) {
    return value.split("\n").slice(0, 4).map(row => row.padEnd(FOUR_COLUMN_COMBO_COLS, " ").slice(0, FOUR_COLUMN_COMBO_COLS).split("").map(cell => cell === " " ? EMPTY : 7));
  }

  function patternStringFromMini(mini) {
    return mini.map(row => row.map(cell => cell === EMPTY ? " " : "1").join("")).join("\n") + "\n";
  }

  function patternStartRow(board) {
    let first = -1;
    for (let y = 0; y < ROWS; y++) {
      if (board[y].some(cell => cell !== EMPTY)) {
        first = y;
        break;
      }
    }
    return Math.min(first < 0 ? ROWS - 4 : first, ROWS - 4);
  }

  function patternStringFromBoard(board) {
    const start = patternStartRow(board);
    return board.slice(start, start + 4).map(row => row.map(cell => cell === EMPTY ? " " : "1").join("")).join("\n") + "\n";
  }

  function isMiniPlacementValid(piece, mini) {
    return cellsForPlacement(piece).every(([x, y]) => x >= 0 && x < FOUR_COLUMN_COMBO_COLS && y >= 0 && y < 4 && mini[y][x] === EMPTY);
  }

  function miniFallToBottom(piece, mini) {
    let landing = { ...piece };
    if (!isMiniPlacementValid(landing, mini)) return null;
    while (isMiniPlacementValid({ ...landing, y: landing.y + 1 }, mini)) landing.y++;
    return landing;
  }

  function mergeMiniPlacement(mini, piece) {
    const next = mini.map(row => row.slice());
    for (const [x, y] of cellsForPlacement(piece)) {
      if (y >= 0 && y < 4 && x >= 0 && x < FOUR_COLUMN_COMBO_COLS) next[y][x] = piece.piece;
    }
    return next;
  }

  function clearFullMiniLines(mini) {
    const kept = mini.filter(row => row.some(cell => cell === EMPTY));
    const cleared = 4 - kept.length;
    while (kept.length < 4) kept.unshift(Array(FOUR_COLUMN_COMBO_COLS).fill(EMPTY));
    return { mini: kept, cleared };
  }

  function fourColumnComboPlacementsForPattern(mini, patternString, pieceIndex, patternSet) {
    const placements = [];
    const seenOrigins = new Set();
    for (const rotation of FOUR_COLUMN_COMBO_ROTATION_STATES[pieceIndex]) {
      for (let x = -2; x < FOUR_COLUMN_COMBO_COLS; x++) {
        for (let y = -1; y < 4; y++) {
          if (pieceIndex === 4 && rotation === 3 && x === 0 && y === 1 && patternString === "    \n    \n1   \n  11\n") continue;
          if (pieceIndex === 3 && rotation === 1 && x === 1 && y === 1 && patternString === "    \n    \n   1\n11  \n") continue;

          const start = { piece: pieceIndex, rotation, x, y };
          if (!isMiniPlacementValid(start, mini)) continue;
          const landing = miniFallToBottom(start, mini);
          if (!landing) continue;
          const originKey = `${landing.x},${landing.y}`;
          if (seenOrigins.has(originKey)) continue;
          seenOrigins.add(originKey);

          const merged = mergeMiniPlacement(mini, landing);
          const result = clearFullMiniLines(merged);
          if (result.cleared <= 0) continue;
          const nextPattern = patternStringFromMini(result.mini);
          if (!patternSet.has(nextPattern)) continue;
          placements.push({
            piece: landing,
            nextPattern,
            cleared: result.cleared,
            branchingScore: 0,
            nextPieces: []
          });
        }
      }
    }
    return placements;
  }

  function buildFourColumnComboPatternTable() {
    if (fourColumnComboPatternTable) return fourColumnComboPatternTable;

    const patternSet = new Set(FOUR_COLUMN_COMBO_PATTERN_STRINGS);
    const table = {};
    for (const pattern of FOUR_COLUMN_COMBO_PATTERN_STRINGS) {
      const mini = miniFromPatternString(pattern);
      const placements = {};
      const piecesWithPlacements = {};
      for (let piece = 0; piece < 7; piece++) {
        const piecePlacements = fourColumnComboPlacementsForPattern(mini, pattern, piece, patternSet);
        placements[piece] = piecePlacements;
        if (piecePlacements.length > 0) piecesWithPlacements[piece] = true;
      }
      table[pattern] = { mini, placements, piecesWithPlacements };
    }

    for (const entry of Object.values(table)) {
      for (const piecePlacements of Object.values(entry.placements)) {
        for (const placement of piecePlacements) {
          const nextEntry = table[placement.nextPattern];
          placement.nextPieces = Object.keys(nextEntry.piecesWithPlacements).map(Number).sort((a, b) => a - b);
          placement.branchingScore = placement.nextPieces.length;
        }
      }
    }

    fourColumnComboPatternTable = table;
    return table;
  }

  function scoreFourColumnComboContinuations(pattern, previews, holdPiece, memo = new Map()) {
    const table = buildFourColumnComboPatternTable();
    if (!table[pattern]) return 0;

    let queue = previews.slice();
    let hold = Number.isInteger(holdPiece) ? holdPiece : null;
    if (queue.length === 0) {
      if (!Number.isInteger(hold)) return 0;
      queue.push(hold);
      hold = null;
    }

    const key = `${pattern}|${queue.join(",")}|h${hold ?? "n"}`;
    if (memo.has(key)) return memo.get(key);

    const directPiece = queue[0];
    const directPlacements = table[pattern].placements[directPiece] || [];
    const direct = 1 + Math.max(0, ...directPlacements.map(placement =>
      scoreFourColumnComboContinuations(placement.nextPattern, queue.slice(1), hold, memo)
    ));

    let holdCandidate = hold;
    const holdQueue = queue.slice();
    if (!Number.isInteger(holdCandidate)) {
      holdCandidate = holdQueue.length > 1 ? holdQueue.splice(1, 1)[0] : null;
    }

    let holdScore = 0;
    if (Number.isInteger(holdCandidate)) {
      const holdPlacements = table[pattern].placements[holdCandidate] || [];
      holdScore = 1 + Math.max(0, ...holdPlacements.map(placement =>
        scoreFourColumnComboContinuations(placement.nextPattern, holdQueue.slice(1), directPiece, memo)
      ));
    }

    const score = Math.max(direct, holdScore);
    memo.set(key, score);
    return score;
  }

  function fullBoardAfterPatternPlacement(board, placement, startRow) {
    const actual = { ...placement.piece, y: placement.piece.y + startRow };
    const merged = mergePlacement(board, actual, actual.piece);
    return clearFullLinesFrom(merged, FOUR_COLUMN_COMBO_COLS).board;
  }

  function fourColumnComboCandidatesFor(pattern, board, startRow, activePiece, holdPiece, holdAvailable, previews) {
    const table = buildFourColumnComboPatternTable();
    const entry = table[pattern];
    if (!entry) return [];

    const candidates = [];
    const requiredScore = TRAINER_PREVIEW_COUNT + (Number.isInteger(holdPiece) ? 1 : 0);
    const currentPlacements = entry.placements[activePiece] || [];
    for (const placement of currentPlacements) {
      const continuationScore = scoreFourColumnComboContinuations(placement.nextPattern, previews, holdPiece);
      candidates.push({
        piece: { ...placement.piece, y: placement.piece.y + startRow },
        board: fullBoardAfterPatternPlacement(board, placement, startRow),
        cleared: placement.cleared,
        source: "current",
        continuations: continuationScore,
        accepts: placement.branchingScore,
        height: surfaceHeight(board),
        keepsPreviewCombo: continuationScore >= requiredScore,
        score: continuationScore * 10_000 + placement.branchingScore,
        nextPieces: placement.nextPieces.slice()
      });
    }

    if (holdAvailable && holdPiece !== activePiece) {
      let candidatePiece = holdPiece;
      let continuationQueue = previews;
      if (!Number.isInteger(candidatePiece)) {
        candidatePiece = previews[0];
        continuationQueue = previews.slice(1);
      }
      if (Number.isInteger(candidatePiece)) {
        const holdPlacements = entry.placements[candidatePiece] || [];
        for (const placement of holdPlacements) {
          const continuationScore = scoreFourColumnComboContinuations(placement.nextPattern, continuationQueue, activePiece);
          candidates.push({
            piece: { ...placement.piece, y: placement.piece.y + startRow },
            board: fullBoardAfterPatternPlacement(board, placement, startRow),
            cleared: placement.cleared,
            source: "hold",
            continuations: continuationScore,
            accepts: placement.branchingScore,
            height: surfaceHeight(board),
            keepsPreviewCombo: continuationScore >= requiredScore,
            score: continuationScore * 10_000 + placement.branchingScore,
            nextPieces: placement.nextPieces.slice()
          });
        }
      }
    }

    candidates.sort((a, b) =>
      b.continuations - a.continuations
      || b.accepts - a.accepts
      || (a.source === "current" ? -1 : 1)
    );
    return candidates;
  }

  function nextStatesAfterPlacement(placement, current, hold, queue, usedHold) {
    if (!usedHold) {
      return {
        board: placement.board,
        current: queue[0],
        hold,
        queue: queue.slice(1),
        holdAvailable: true
      };
    }

    if (hold === null) {
      return {
        board: placement.board,
        current: queue[1],
        hold: current,
        queue: queue.slice(2),
        holdAvailable: true
      };
    }

    return {
      board: placement.board,
      current: queue[0],
      hold: current,
      queue: queue.slice(1),
      holdAvailable: true
    };
  }

  function continuationDepthWithHold(board, current, hold, queue, holdAvailable, depthLimit, cols, memo) {
    if (depthLimit <= 0 || !Number.isInteger(current)) return 0;

    const key = `${boardKey(board)}|c${current}|h${hold ?? "n"}|a${holdAvailable ? 1 : 0}|q${queue.slice(0, depthLimit + 2).join("")}|d${depthLimit}`;
    if (memo.has(key)) return memo.get(key);

    let best = 0;
    const directPlacements = enumerateComboPlacements(board, current, cols);
    for (const placement of directPlacements) {
      const next = nextStatesAfterPlacement(placement, current, hold, queue, false);
      best = Math.max(
        best,
        1 + continuationDepthWithHold(next.board, next.current, next.hold, next.queue, next.holdAvailable, depthLimit - 1, cols, memo)
      );
    }

    if (holdAvailable) {
      const holdPiece = hold === null ? queue[0] : hold;
      if (Number.isInteger(holdPiece)) {
        const holdPlacements = enumerateComboPlacements(board, holdPiece, cols);
        for (const placement of holdPlacements) {
          const next = nextStatesAfterPlacement(placement, current, hold, queue, true);
          best = Math.max(
            best,
            1 + continuationDepthWithHold(next.board, next.current, next.hold, next.queue, next.holdAvailable, depthLimit - 1, cols, memo)
          );
        }
      }
    }

    memo.set(key, best);
    return best;
  }

  function nextTrainerPiece() {
    while (state.trainerQueue.length < 24) {
      if (!state.trainerBag.length) state.trainerBag = shuffledBag();
      state.trainerQueue.push(state.trainerBag.shift());
    }
    return state.trainerQueue.shift();
  }

  function fillTrainerQueue() {
    while (state.trainerQueue.length < 24) {
      if (!state.trainerBag.length) state.trainerBag = shuffledBag();
      state.trainerQueue.push(state.trainerBag.shift());
    }
  }

  function scoreTrainerCandidate(item, continuationState, lookaheadDepth, cols, source) {
    const continuations = continuationDepthWithHold(
      item.board,
      continuationState.current,
      continuationState.hold,
      continuationState.queue,
      true,
      lookaheadDepth,
      cols,
      new Map()
    );
    const accepts = acceptablePieceCount(item.board, cols);
    const height = surfaceHeight(item.board);
    const keepsPreviewCombo = continuations >= lookaheadDepth;
    const score = (keepsPreviewCombo ? 1_000_000 : 0)
      + continuations * 10_000
      + accepts * 500
      + item.cleared * 120
      - height * 15
      - item.piece.y
      - (source === "hold" ? 1 : 0);
    return { ...item, source, continuations, accepts, height, keepsPreviewCombo, score };
  }

  function analyzeTrainer() {
    if (state.mode !== "fourColumnCombo" || !state.active) return [];
    fillTrainerQueue();
    const cols = FOUR_COLUMN_COMBO_COLS;
    const pattern = patternStringFromBoard(state.board);
    const startRow = patternStartRow(state.board);
    const patternCandidates = fourColumnComboCandidatesFor(
      pattern,
      state.board,
      startRow,
      state.active.piece,
      state.holdPiece,
      !state.holdLocked,
      state.trainerQueue.slice(0, TRAINER_PREVIEW_COUNT)
    );
    if (patternCandidates.length > 0) {
      state.trainerSuggestions = patternCandidates;
      return patternCandidates;
    }

    const lookaheadDepth = Math.min(14, state.trainerQueue.length);
    const candidates = enumerateComboPlacements(state.board, state.active.piece, cols)
      .map(item => scoreTrainerCandidate(item, {
        current: state.trainerQueue[0],
        hold: state.holdPiece,
        queue: state.trainerQueue.slice(1)
      }, lookaheadDepth, cols, "current"));

    if (!state.holdLocked) {
      const holdPiece = state.holdPiece;
      const holdCandidatePiece = holdPiece === null ? state.trainerQueue[0] : holdPiece;
      if (Number.isInteger(holdCandidatePiece)) {
        const continuationState = holdPiece === null
          ? {
              current: state.trainerQueue[1],
              hold: state.active.piece,
              queue: state.trainerQueue.slice(2)
            }
          : {
              current: state.trainerQueue[0],
              hold: state.active.piece,
              queue: state.trainerQueue.slice(1)
            };
        for (const item of enumerateComboPlacements(state.board, holdCandidatePiece, cols)) {
          candidates.push(scoreTrainerCandidate(item, continuationState, lookaheadDepth, cols, "hold"));
        }
      }
    }

    candidates.sort((a, b) =>
      Number(b.keepsPreviewCombo) - Number(a.keepsPreviewCombo)
      || b.continuations - a.continuations
      || b.accepts - a.accepts
      || b.cleared - a.cleared
      || a.height - b.height
      || b.score - a.score
    );
    state.trainerSuggestions = candidates;
    return candidates;
  }

  function refreshTrainerSuggestion() {
    if (state.mode !== "fourColumnCombo") return;
    analyzeTrainer();
    scheduleTrainerAutoClear();
    drawBoard();
    drawTray();
  }

  function cancelTrainerAutoClear() {
    if (state.trainerAutoClearTimer) {
      clearTimeout(state.trainerAutoClearTimer);
      state.trainerAutoClearTimer = 0;
    }
    state.trainerAutoClearKey = "";
  }

  function isSamePlacement(a, b) {
    return Boolean(a && b)
      && a.piece === b.piece
      && (a.rotation & 3) === (b.rotation & 3)
      && a.x === b.x
      && a.y === b.y;
  }

  function placementCellsKey(piece) {
    if (!piece) return "";
    return cellsForPlacement(piece)
      .map(([x, y]) => `${x},${y}`)
      .sort()
      .join("|");
  }

  function isSameOccupiedCells(a, b) {
    return Boolean(a && b)
      && a.piece === b.piece
      && placementCellsKey(a) === placementCellsKey(b);
  }

  function scheduleTrainerAutoClear() {
    if (state.mode !== "fourColumnCombo" || !state.trainerAutoClearEnabled || !state.active || !isValid(state.active)) {
      cancelTrainerAutoClear();
      return;
    }

    const hasMatchingSuggestion = analyzeTrainer().some(candidate => isSameOccupiedCells(state.active, candidate.piece));
    if (!hasMatchingSuggestion) {
      cancelTrainerAutoClear();
      return;
    }

    const key = `${state.active.piece}:${placementCellsKey(state.active)}`;
    if (state.trainerAutoClearTimer && state.trainerAutoClearKey === key) return;
    cancelTrainerAutoClear();
    state.trainerAutoClearKey = key;
    state.trainerAutoClearTimer = window.setTimeout(() => {
      state.trainerAutoClearTimer = 0;
      state.trainerAutoClearKey = "";
      const stillMatches = analyzeTrainer().some(candidate => isSameOccupiedCells(state.active, candidate.piece));
      if (
        state.mode === "fourColumnCombo"
        && state.trainerAutoClearEnabled
        && state.active
        && stillMatches
      ) {
        lockTrainerActive();
      }
    }, 500);
  }

  function trainerSpawnX(pieceIndex, rotation = 0) {
    const shape = SHAPES[pieceIndex][rotation & 3];
    const minX = Math.min(...shape.map(([x]) => x));
    const maxX = Math.max(...shape.map(([x]) => x));
    const width = maxX - minX + 1;
    return clamp(Math.floor((FOUR_COLUMN_COMBO_COLS - width) / 2) - minX, -minX, FOUR_COLUMN_COMBO_COLS - 1 - maxX);
  }

  function spawnTrainerPiece() {
    const piece = nextTrainerPiece();
    state.active = { piece, rotation: 0, x: trainerSpawnX(piece), y: 0 };
    state.holdLocked = false;
    analyzeTrainer();
    rememberTrainerPieceStart();
    scheduleTrainerAutoClear();
  }

  function seedTrainerOpening() {
    state.trainerQueue = [];
    state.trainerBag = shuffledBag();
    fillTrainerQueue();
    const piece = nextTrainerPiece();
    state.active = { piece, rotation: 0, x: trainerSpawnX(piece), y: 0 };
    state.holdLocked = false;
    const suggestions = analyzeTrainer();
    rememberTrainerPieceStart();
    return suggestions;
  }

  function resetTrainer() {
    cancelTrainerAutoClear();
    state.board = makeBoard(FOUR_COLUMN_COMBO_COLS);
    state.groups = makeBoard(FOUR_COLUMN_COMBO_COLS, 0);
    state.pieceRecords = {};
    state.nextGroupId = 1;
    state.trainerQueue = [];
    state.trainerBag = shuffledBag();
    state.trainerCombo = 0;
    state.trainerLines = 0;
    state.holdPiece = null;
    state.holdLocked = false;
    state.trainerPieceStartSnapshot = null;
    state.undo = [];
    state.board[ROWS - 1][0] = 7;
    state.board[ROWS - 2][0] = 7;
    state.board[ROWS - 2][1] = 7;
    for (let attempt = 0; attempt < 20; attempt++) {
      const suggestions = seedTrainerOpening();
      if (suggestions[0]?.keepsPreviewCombo) break;
    }
    drawAll();
  }

  function enterFourColumnComboMode() {
    if (state.mode === "fourColumnCombo") return;
    state.savedEditor = snapshotState();
    state.mode = "fourColumnCombo";
    boardCanvas.width = 360;
    boardCanvas.height = 720;
    document.getElementById("appShell").classList.add("four-column-combo-mode");
    document.getElementById("fourColumnComboBtn").classList.add("active");
    setTrainerActionLabels(true);
    boardCanvas.setAttribute("aria-label", "4 by 20 4-column combo board");
    resetTrainer();
    haptic();
  }

  function exitFourColumnComboMode() {
    if (state.mode !== "fourColumnCombo") return;
    cancelTrainerAutoClear();
    state.mode = "editor";
    boardCanvas.width = 360;
    boardCanvas.height = 720;
    document.getElementById("appShell").classList.remove("four-column-combo-mode");
    document.getElementById("fourColumnComboBtn").classList.remove("active");
    setTrainerActionLabels(false);
    boardCanvas.setAttribute("aria-label", "10 by 20 board");
    if (state.savedEditor) restore(state.savedEditor);
    state.savedEditor = null;
    haptic(6);
  }

  function toggleFourColumnComboMode() {
    if (state.mode === "fourColumnCombo") exitFourColumnComboMode();
    else enterFourColumnComboMode();
  }

  function setTrainerActionLabels(enabled) {
    document.querySelector('[data-tool="draw"]').textContent = enabled ? "-" : "Draw";
    document.querySelector('[data-tool="piece"]').textContent = enabled ? "-" : "Piece";
    document.getElementById("clearBtn").textContent = enabled ? "Line Clear" : "Clear Lines";
    document.getElementById("undoBtn").textContent = "Undo";
    document.getElementById("fileBtn").textContent = "File";
  }

  function lockTrainerActive() {
    if (state.mode !== "fourColumnCombo") return;
    cancelTrainerAutoClear();
    if (!state.active || !isValid(state.active)) {
      haptic([24, 35, 24]);
      return;
    }
    pushSnapshotUndo(state.trainerPieceStartSnapshot);
    const merged = mergePlacement(state.board, state.active, state.active.piece);
    const result = clearFullLinesFrom(merged, FOUR_COLUMN_COMBO_COLS);
    state.board = result.board;
    state.groups = makeBoard(FOUR_COLUMN_COMBO_COLS, 0);
    state.trainerCombo = result.cleared > 0 ? state.trainerCombo + 1 : 0;
    state.trainerLines += result.cleared;
    spawnTrainerPiece();
    haptic();
    drawAll();
  }

  function trainerMove(dx, dy) {
    if (state.mode !== "fourColumnCombo" || !state.active) return;
    const next = { ...state.active, x: state.active.x + dx, y: state.active.y + dy };
    if (isValid(next)) {
      state.active = next;
      analyzeTrainer();
      scheduleTrainerAutoClear();
      interactionHaptic();
      drawAll();
      return;
    }
    if (dy > 0) lockTrainerActive();
  }

  function trainerRotate(dir) {
    if (state.mode !== "fourColumnCombo") return;
    rotateActive(dir);
    analyzeTrainer();
    scheduleTrainerAutoClear();
    drawAll();
  }

  function trainerAction(action) {
    if (state.mode !== "fourColumnCombo") return false;
    if (action === "left") trainerMove(-1, 0);
    else if (action === "right") trainerMove(1, 0);
    else if (action === "down") trainerMove(0, 1);
    else if (action === "ccw") trainerRotate(-1);
    else if (action === "cw") trainerRotate(1);
    return true;
  }

  function drawCell(targetCtx, x, y, size, color, _invalid) {
    const pad = Math.max(1, size * 0.08);
    const r = Math.max(3, size * 0.16);
    targetCtx.fillStyle = color;
    roundRect(targetCtx, x + pad, y + pad, size - pad * 2, size - pad * 2, r);
    targetCtx.fill();
    targetCtx.fillStyle = "rgba(255, 255, 255, 0.18)";
    roundRect(targetCtx, x + pad * 1.7, y + pad * 1.7, size - pad * 3.4, size * 0.22, r * 0.55);
    targetCtx.fill();
    targetCtx.strokeStyle = "rgba(0, 0, 0, 0.24)";
    targetCtx.lineWidth = Math.max(1, size * 0.055);
    roundRect(targetCtx, x + pad, y + pad, size - pad * 2, size - pad * 2, r);
    targetCtx.stroke();
  }

  function drawGhostCell(targetCtx, x, y, size, color) {
    const pad = Math.max(1, size * 0.1);
    const radius = Math.max(3, size * 0.16);
    targetCtx.save();
    targetCtx.globalAlpha = 0.2;
    targetCtx.fillStyle = color;
    roundRect(targetCtx, x + pad, y + pad, size - pad * 2, size - pad * 2, radius);
    targetCtx.fill();
    targetCtx.globalAlpha = 0.72;
    targetCtx.strokeStyle = color;
    targetCtx.lineWidth = Math.max(1.25, size * 0.07);
    targetCtx.setLineDash([Math.max(2, size * 0.2), Math.max(2, size * 0.13)]);
    roundRect(targetCtx, x + pad, y + pad, size - pad * 2, size - pad * 2, radius);
    targetCtx.stroke();
    targetCtx.restore();
  }

  function landingPosition(piece) {
    let landing = { ...piece };
    while (isValid({ ...landing, y: landing.y + 1 })) {
      landing.y++;
    }
    return landing;
  }

  function roundRect(targetCtx, x, y, w, h, r) {
    targetCtx.beginPath();
    targetCtx.moveTo(x + r, y);
    targetCtx.arcTo(x + w, y, x + w, y + h, r);
    targetCtx.arcTo(x + w, y + h, x, y + h, r);
    targetCtx.arcTo(x, y + h, x, y, r);
    targetCtx.arcTo(x, y, x + w, y, r);
    targetCtx.closePath();
  }

  function drawBoard() {
    const width = boardCanvas.width;
    const height = boardCanvas.height;
    const cols = boardCols();
    const cell = state.mode === "fourColumnCombo" ? height / ROWS : width / cols;
    const boardPixelWidth = cell * cols;
    const ox = state.mode === "fourColumnCombo" ? (width - boardPixelWidth) / 2 : 0;
    ctx.clearRect(0, 0, width, height);
    if (state.mode !== "fourColumnCombo") {
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#1a2637");
      bg.addColorStop(1, "#111925");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
    }

    if (state.mode === "fourColumnCombo") {
      ctx.save();
      ctx.fillStyle = "#182233";
      ctx.fillRect(ox, 0, boardPixelWidth, height);
      ctx.strokeStyle = "#6f86a8";
      ctx.lineWidth = 4;
      ctx.strokeRect(ox + 2, 2, boardPixelWidth - 4, height - 4);
      ctx.restore();
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.055)";
    ctx.lineWidth = 1;
    for (let x = 1; x < cols; x++) {
      ctx.beginPath();
      ctx.moveTo(ox + x * cell, 0);
      ctx.lineTo(ox + x * cell, height);
      ctx.stroke();
    }
    for (let y = 1; y < ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(ox, y * cell);
      ctx.lineTo(ox + boardPixelWidth, y * cell);
      ctx.stroke();
    }

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < cols; x++) {
        const value = state.board[y][x];
        if (value !== EMPTY) {
          drawCell(ctx, ox + x * cell, y * cell, cell, PAINT_COLORS[value] || PAINT_COLORS[7], false);
        }
      }
    }

    if (state.mode === "fourColumnCombo" && state.active && state.trainerGhostEnabled) {
      const best = analyzeTrainer()[0];
      if (best) {
        for (const [x, y] of cellsForPlacement(best.piece)) {
          drawGhostCell(ctx, ox + x * cell, y * cell, cell, COLORS[best.piece.piece]);
        }
      }
    }

    if (state.mode !== "fourColumnCombo" && state.active && isValid(state.active)) {
      const ghost = landingPosition(state.active);
      if (ghost.y !== state.active.y) {
        for (const [x, y] of cellsFor(ghost)) {
          drawGhostCell(ctx, ox + x * cell, y * cell, cell, COLORS[state.active.piece]);
        }
      }
    }

    if (state.active) {
      const invalid = !isValid(state.active);
      for (const [x, y] of cellsFor(state.active)) {
        if (y >= 0 && y < ROWS && x >= 0 && x < cols) {
          drawCell(ctx, ox + x * cell, y * cell, cell, COLORS[state.active.piece], invalid);
        }
      }
    }

    if (state.mode === "fourColumnCombo") scheduleTrainerAutoClear();
  }

  function drawPieceCanvas(canvas, piece, scale = 1) {
    const targetCtx = canvas.getContext("2d");
    targetCtx.clearRect(0, 0, canvas.width, canvas.height);
    const cells = SHAPES[piece][0];
    const minX = Math.min(...cells.map(c => c[0]));
    const maxX = Math.max(...cells.map(c => c[0]));
    const minY = Math.min(...cells.map(c => c[1]));
    const maxY = Math.max(...cells.map(c => c[1]));
    const cols = maxX - minX + 1;
    const rows = maxY - minY + 1;
    const size = Math.min(canvas.width / (cols + 0.7), canvas.height / (rows + 0.7)) * scale;
    const ox = (canvas.width - cols * size) / 2;
    const oy = (canvas.height - rows * size) / 2;
    for (const [x, y] of cells) {
      drawCell(targetCtx, ox + (x - minX) * size, oy + (y - minY) * size, size, COLORS[piece], false);
    }
  }

  function drawAll() {
    drawBoard();
    drawTray();
    drawHold();
  }

  function makeCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  function drawTray() {
    trayEl.replaceChildren();
    if (state.mode === "fourColumnCombo") {
      comboBoxEl.hidden = false;
      linesBoxEl.hidden = false;
      trainerSwitchesEl.hidden = false;
      updateTrainerSwitches();
      comboBoxEl.querySelector("strong").textContent = String(state.trainerCombo);
      linesBoxEl.querySelector("strong").textContent = String(state.trainerLines);
      fillTrainerQueue();
      for (const [index, piece] of state.trainerQueue.slice(0, state.trainerPreviewCount).entries()) {
        const tile = document.createElement("div");
        tile.className = "trainer-preview-tile";
        tile.setAttribute("aria-label", `Preview ${index + 1}: ${PIECES[piece]}`);
        const label = document.createElement("span");
        label.textContent = index === 0 ? "Next" : `${index + 1}`;
        const canvas = makeCanvas(64, 40);
        drawPieceCanvas(canvas, piece);
        tile.append(label, canvas);
        trayEl.append(tile);
      }
      for (let index = state.trainerPreviewCount; index < 5; index++) {
        const spacer = document.createElement("div");
        spacer.className = "trainer-preview-tile trainer-preview-spacer";
        spacer.setAttribute("aria-hidden", "true");
        trayEl.append(spacer);
      }
      return;
    }
    comboBoxEl.hidden = true;
    linesBoxEl.hidden = true;
    trainerSwitchesEl.hidden = true;
    for (const piece of state.trayOrder) {
      const tile = document.createElement("button");
      tile.className = "piece-tile";
      tile.type = "button";
      tile.dataset.piece = String(piece);
      tile.setAttribute("aria-label", `Piece ${PIECES[piece]}`);
      tile.disabled = state.usedPieces[piece];
      const canvas = makeCanvas(70, 54);
      drawPieceCanvas(canvas, piece);
      tile.append(canvas);
      trayEl.append(tile);
    }
  }

  function drawHold() {
    const holdCtx = holdCanvas.getContext("2d");
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    if (state.holdPiece !== null) {
      drawPieceCanvas(holdCanvas, state.holdPiece, 0.82);
    }
    holdEl.classList.toggle("filled", state.holdPiece !== null);
    holdEl.disabled = !state.active || state.holdLocked;
  }

  function updateTrainerSwitches() {
    previewToggleBtn.querySelector("strong").textContent = String(state.trainerPreviewCount);
    previewToggleBtn.setAttribute("aria-pressed", state.trainerPreviewCount === 5 ? "true" : "false");
    previewToggleBtn.classList.toggle("active", state.trainerPreviewCount === 5);
    ghostToggleBtn.querySelector("strong").textContent = state.trainerGhostEnabled ? "On" : "Off";
    ghostToggleBtn.setAttribute("aria-pressed", state.trainerGhostEnabled ? "true" : "false");
    ghostToggleBtn.classList.toggle("active", state.trainerGhostEnabled);
    autoClearToggleBtn.querySelector("strong").textContent = state.trainerAutoClearEnabled ? "On" : "Off";
    autoClearToggleBtn.setAttribute("aria-pressed", state.trainerAutoClearEnabled ? "true" : "false");
    autoClearToggleBtn.classList.toggle("active", state.trainerAutoClearEnabled);
  }

  function toggleTrainerPreviewCount() {
    state.trainerPreviewCount = state.trainerPreviewCount === 5 ? 3 : 5;
    updateTrainerSwitches();
    drawTray();
    haptic();
  }

  function toggleTrainerGhost() {
    state.trainerGhostEnabled = !state.trainerGhostEnabled;
    updateTrainerSwitches();
    drawBoard();
    haptic();
  }

  function toggleTrainerAutoClear() {
    state.trainerAutoClearEnabled = !state.trainerAutoClearEnabled;
    updateTrainerSwitches();
    scheduleTrainerAutoClear();
    haptic();
  }

  function undoFourColumnCombo() {
    if (state.trainerPieceStartSnapshot && !snapshotMatchesCurrent(state.trainerPieceStartSnapshot)) {
      restore(state.trainerPieceStartSnapshot);
      haptic();
      return;
    }

    const snapshot = state.undo.pop();
    if (snapshot) {
      restore(snapshot);
      haptic();
    }
  }

  function holdActivePiece() {
    if (!state.active || !isValid(state.active) || state.holdLocked) return;

    if (state.mode === "fourColumnCombo") {
      const outgoingPiece = state.active.piece;
      if (state.holdPiece === null) {
        state.holdPiece = outgoingPiece;
        const piece = nextTrainerPiece();
        state.active = { piece, rotation: 0, x: trainerSpawnX(piece), y: 0 };
      } else {
        const piece = state.holdPiece;
        state.active = { piece, rotation: 0, x: trainerSpawnX(piece), y: 0 };
        state.holdPiece = outgoingPiece;
      }
      state.holdLocked = true;
      analyzeTrainer();
      scheduleTrainerAutoClear();
      haptic();
      drawAll();
      return;
    }

    const outgoingPiece = state.active.piece;
    if (state.holdPiece === null) {
      pushUndo();
      state.holdPiece = outgoingPiece;
      state.active = null;
      state.holdLocked = false;
    } else {
      const incomingPiece = state.holdPiece;
      const candidate = clampPieceIntoBoard({
        piece: incomingPiece,
        rotation: 0,
        x: state.active.x,
        y: state.active.y
      });

      if (!isValid(candidate)) {
        haptic([20, 25, 20]);
        return;
      }

      pushUndo();
      state.holdPiece = outgoingPiece;
      state.active = candidate;
      state.holdLocked = true;
    }

    haptic();
    drawAll();
  }

  function setTool(tool) {
    state.tool = tool;
    document.querySelectorAll(".tool").forEach(button => {
      button.classList.toggle("active", button.dataset.tool === tool);
    });
    haptic();
  }

  function setPaint(index) {
    state.paint = index;
    document.querySelectorAll(".swatch").forEach(button => {
      button.classList.toggle("active", Number(button.dataset.color) === index);
    });
    setTool("draw");
  }

  function paintAt(clientX, clientY, forceUndo) {
    if (state.mode === "fourColumnCombo") return;
    const { rect, cell } = boardMetrics();
    const x = Math.floor((clientX - rect.left) / cell);
    const y = Math.floor((clientY - rect.top) / cell);
    if (x < 0 || x >= boardCols() || y < 0 || y >= ROWS) return;
    const value = state.paint === 8 ? EMPTY : state.paint;
    if (state.board[y][x] === value) return;
    if (forceUndo) pushUndo();
    dissolveGroup(state.groups[y][x]);
    state.board[y][x] = value;
    state.groups[y][x] = 0;
    interactionHaptic();
    drawBoard();
  }

  function activeFromPointer(piece, clientX, clientY) {
    const { rect, cell } = boardMetrics();
    const x = Math.floor((clientX - rect.left) / cell) - 1;
    const y = Math.floor((clientY - rect.top) / cell) - 1;
    return clampPieceIntoBoard({ piece, rotation: 0, x, y });
  }

  function pointerCell(clientX, clientY) {
    const { rect, cell, logicalOffsetX = 0 } = boardMetrics();
    return {
      x: Math.floor((clientX - rect.left) / cell) - logicalOffsetX,
      y: Math.floor((clientY - rect.top) / cell)
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function startPieceDrag(piece, clientX, clientY) {
    if (state.usedPieces[piece]) return;
    pushUndo();
    if (state.active && isValid(state.active)) {
      commitActiveIntoBoard();
    }
    state.pointer = { mode: "piece", piece, grabX: 1, grabY: 1 };
    const candidate = activeFromPointer(piece, clientX, clientY);
    state.active = isValid(candidate) ? candidate : null;
    if (state.active) consumeTrayPiece(piece);
    setTool("piece");
    haptic();
    drawAll();
  }

  function moveActiveTo(clientX, clientY) {
    if (!state.active) {
      if (state.pointer?.mode !== "piece") return;
      const candidate = activeFromPointer(state.pointer.piece, clientX, clientY);
      if (isValid(candidate)) {
        state.active = candidate;
        consumeTrayPiece(state.pointer.piece);
        drawTray();
        drawHold();
        interactionHaptic();
      }
      drawBoard();
      return;
    }
    const pointer = pointerCell(clientX, clientY);
    const grabX = state.pointer?.grabX ?? 1;
    const grabY = state.pointer?.grabY ?? 1;
    const next = clampPieceIntoBoard({
      ...state.active,
      x: pointer.x - grabX,
      y: pointer.y - grabY
    });
    if (isValid(next)) {
      const moved = next.x !== state.active.x || next.y !== state.active.y;
      state.active = next;
      if (state.mode === "fourColumnCombo") analyzeTrainer();
      if (state.mode === "fourColumnCombo") scheduleTrainerAutoClear();
      if (moved) interactionHaptic();
    }
    drawBoard();
  }

  function setupPalette() {
    const names = ["I", "O", "T", "L", "J", "S", "Z", "Gray", "Erase"];
    for (let i = 0; i < names.length; i++) {
      const button = document.createElement("button");
      button.className = `swatch${i === state.paint ? " active" : ""}${i === 8 ? " erase" : ""}`;
      button.type = "button";
      button.dataset.color = String(i);
      button.style.setProperty("--swatch", PAINT_COLORS[i] || "#303746");
      button.setAttribute("aria-label", names[i]);
      paletteEl.append(button);
    }
  }

  function resetBoard() {
    if (state.mode === "fourColumnCombo") {
      resetTrainer();
      refreshTrainerSuggestion();
      haptic();
      return;
    }
    pushUndo();
    state.board = makeBoard(COLS);
    state.groups = makeBoard(COLS, 0);
    state.pieceRecords = {};
    state.nextGroupId = 1;
    state.trayOrder = shuffledBag();
    state.usedPieces = Array(7).fill(false);
    state.holdPiece = null;
    state.holdLocked = false;
    state.active = null;
    drawAll();
    haptic();
  }

  function resetBag() {
    if (state.mode === "fourColumnCombo") {
      pushUndo();
      state.trainerBag = shuffledBag();
      state.trainerQueue = [];
      fillTrainerQueue();
      refreshTrainerSuggestion();
      drawAll();
      haptic();
      return;
    }
    pushUndo();
    state.trayOrder = shuffledBag();
    state.usedPieces.fill(false);
    drawTray();
    haptic();
  }

  function consumeTrayPiece(piece) {
    state.usedPieces[piece] = true;
    if (state.usedPieces.every(Boolean)) {
      state.trayOrder = shuffledBag();
      state.usedPieces.fill(false);
    }
  }

  function readSaves() {
    try {
      const value = JSON.parse(localStorage.getItem(activeSaveStorageKey()) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch (_) {
      return {};
    }
  }

  function writeSaves(saves) {
    localStorage.setItem(activeSaveStorageKey(), JSON.stringify(saves));
  }

  function activeSaveStorageKey() {
    return state.mode === "fourColumnCombo" ? FOUR_COLUMN_COMBO_SAVE_STORAGE_KEY : SAVE_STORAGE_KEY;
  }

  function isMatrix(value, rows, cols, predicate) {
    return Array.isArray(value)
      && value.length === rows
      && value.every(row => Array.isArray(row) && row.length === cols && row.every(predicate));
  }

  function normalizeSaveState(value) {
    if (!value || typeof value !== "object") throw new Error("Invalid save data.");
    const expectedCols = state.mode === "fourColumnCombo" ? FOUR_COLUMN_COMBO_COLS : COLS;
    const sizeLabel = state.mode === "fourColumnCombo" ? "4 × 20" : "10 × 20";
    if (!isMatrix(value.board, ROWS, expectedCols, cell => Number.isInteger(cell) && cell >= EMPTY && cell <= 7)) {
      throw new Error(`This JSON does not contain a valid ${sizeLabel} board.`);
    }

    const groups = isMatrix(value.groups, ROWS, expectedCols, cell => Number.isInteger(cell) && cell >= 0)
      ? copyBoard(value.groups)
      : Array.from({ length: ROWS }, () => Array(expectedCols).fill(0));
    const trayOrder = Array.isArray(value.trayOrder)
      && value.trayOrder.length === 7
      && new Set(value.trayOrder).size === 7
      && value.trayOrder.every(piece => Number.isInteger(piece) && piece >= 0 && piece < 7)
      ? value.trayOrder.slice()
      : PIECES.map((_, index) => index);
    const usedPieces = Array.isArray(value.usedPieces) && value.usedPieces.length === 7
      ? value.usedPieces.map(Boolean)
      : Array(7).fill(false);
    const holdPiece = value.holdPiece === null || value.holdPiece === undefined
      ? null
      : (Number.isInteger(value.holdPiece) && value.holdPiece >= 0 && value.holdPiece < 7 ? value.holdPiece : null);
    const active = value.active && typeof value.active === "object"
      && Number.isInteger(value.active.piece) && value.active.piece >= 0 && value.active.piece < 7
      && Number.isInteger(value.active.rotation) && Number.isInteger(value.active.x) && Number.isInteger(value.active.y)
      ? { ...value.active }
      : null;

    const normalized = {
      board: copyBoard(value.board),
      groups,
      pieceRecords: value.pieceRecords && typeof value.pieceRecords === "object"
        ? JSON.parse(JSON.stringify(value.pieceRecords))
        : {},
      nextGroupId: Number.isInteger(value.nextGroupId) && value.nextGroupId > 0 ? value.nextGroupId : 1,
      trayOrder,
      usedPieces,
      holdPiece,
      holdLocked: Boolean(value.holdLocked),
      active
    };

    if (state.mode === "fourColumnCombo") {
      normalized.trainerQueue = Array.isArray(value.trainerQueue)
        ? value.trainerQueue.filter(piece => Number.isInteger(piece) && piece >= 0 && piece < 7)
        : [];
      normalized.trainerBag = Array.isArray(value.trainerBag)
        ? value.trainerBag.filter(piece => Number.isInteger(piece) && piece >= 0 && piece < 7)
        : [];
      normalized.trainerCombo = Number.isInteger(value.trainerCombo) ? value.trainerCombo : 0;
      normalized.trainerLines = Number.isInteger(value.trainerLines) ? value.trainerLines : 0;
      normalized.trainerPreviewCount = value.trainerPreviewCount === 3 ? 3 : 5;
      normalized.trainerGhostEnabled = value.trainerGhostEnabled !== false;
      normalized.trainerAutoClearEnabled = Boolean(value.trainerAutoClearEnabled);
    }

    return normalized;
  }

  function setFileStatus(message, isError = false) {
    const status = document.getElementById("fileStatus");
    status.textContent = message;
    status.classList.toggle("error", isError);
  }

  function refreshFileList(selectedName = "") {
    const list = document.getElementById("fileList");
    const saves = readSaves();
    const names = Object.keys(saves).sort((a, b) => {
      const timeA = Date.parse(saves[a]?.updatedAt || "") || 0;
      const timeB = Date.parse(saves[b]?.updatedAt || "") || 0;
      return timeB - timeA || a.localeCompare(b);
    });
    list.replaceChildren();
    for (const name of names) {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      list.append(option);
    }
    if (selectedName && saves[selectedName]) list.value = selectedName;
    if (!list.value && names.length) list.value = names[0];
    return saves;
  }

  function openFileDialog() {
    const dialog = document.getElementById("fileDialog");
    dialog.style.display = "grid";
    dialog.hidden = false;
    dialog.classList.add("is-open");
    refreshFileList();
    document.getElementById("fileNameInput").value = selectedFileName();
    setFileStatus("");
    haptic();
  }

  function closeFileDialog() {
    const dialog = document.getElementById("fileDialog");
    dialog.classList.remove("is-open");
    dialog.hidden = true;
    dialog.style.display = "none";
    haptic(6);
  }

  function selectedFileName() {
    return document.getElementById("fileList").value;
  }

  function saveCurrentFile() {
    const input = document.getElementById("fileNameInput");
    const name = input.value.trim();
    if (!name) {
      setFileStatus("Enter a file name first.", true);
      input.focus();
      return;
    }

    try {
      const saves = readSaves();
      if (saves[name] && !window.confirm(`Replace “${name}”?`)) return;
      saves[name] = { name, updatedAt: new Date().toISOString(), state: snapshotState() };
      writeSaves(saves);
      refreshFileList(name);
      setFileStatus(`Saved “${name}”.`);
      haptic();
    } catch (_) {
      setFileStatus("Unable to save on this device.", true);
    }
  }

  function loadSelectedFile() {
    const name = selectedFileName();
    const record = readSaves()[name];
    if (!record) {
      setFileStatus("Select a saved board first.", true);
      return;
    }
    try {
      const nextState = normalizeSaveState(record.state);
      pushUndo();
      restore(nextState);
      haptic();
      closeFileDialog();
    } catch (error) {
      setFileStatus(error.message || "Unable to load this save.", true);
    }
  }

  function deleteSelectedFile() {
    const name = selectedFileName();
    if (!name) {
      setFileStatus("Select a saved board first.", true);
      return;
    }
    if (!window.confirm(`Delete “${name}”?`)) return;
    try {
      const saves = readSaves();
      delete saves[name];
      writeSaves(saves);
      refreshFileList();
      setFileStatus(`Deleted “${name}”.`);
      haptic([18, 30, 18]);
    } catch (_) {
      setFileStatus("Unable to delete this save.", true);
    }
  }

  function safeFileName(name) {
    return (name || "tetraboard").replace(/[\\/:*?\"<>|]+/g, "-").trim() || "tetraboard";
  }

  function exportSelectedFile() {
    const selected = selectedFileName();
    const record = selected ? readSaves()[selected] : null;
    const name = record?.name || document.getElementById("fileNameInput").value.trim() || "TetraBoard";
    const payload = {
      format: "tetraboard-lab-save",
      version: 1,
      name,
      exportedAt: new Date().toISOString(),
      state: record?.state || snapshotState()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeFileName(name)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setFileStatus(`Exported “${name}”.`);
    haptic();
  }

  async function importJsonFile(file) {
    try {
      const payload = JSON.parse(await file.text());
      if (payload.format !== "tetraboard-lab-save" || payload.version !== 1) {
        throw new Error("This is not a TetraBoard Lab save file.");
      }
      const importedState = normalizeSaveState(payload.state);
      const fallbackName = file.name.replace(/\.json$/i, "") || "Imported board";
      let name = String(payload.name || fallbackName).trim().slice(0, 48) || fallbackName;
      const saves = readSaves();
      if (saves[name]) {
        let suffix = 2;
        while (saves[`${name} ${suffix}`]) suffix++;
        name = `${name} ${suffix}`;
      }
      saves[name] = { name, updatedAt: new Date().toISOString(), state: importedState };
      writeSaves(saves);
      document.getElementById("fileNameInput").value = name;
      refreshFileList(name);
      setFileStatus(`Imported “${name}”.`);
      haptic();
    } catch (error) {
      setFileStatus(error.message || "Unable to import this JSON file.", true);
    }
  }

  function bindEvents() {
    const appShell = document.getElementById("appShell");
    closeFileDialog();
    for (const eventName of ["dragstart", "selectstart", "contextmenu"]) {
      appShell.addEventListener(eventName, event => event.preventDefault());
    }

    document.querySelectorAll(".tool").forEach(button => {
      button.addEventListener("click", () => {
        if (state.mode === "fourColumnCombo") return;
        setTool(button.dataset.tool);
      });
    });
    paletteEl.addEventListener("click", event => {
      const button = event.target.closest(".swatch");
      if (button) setPaint(Number(button.dataset.color));
    });
    trayEl.addEventListener("pointerdown", event => {
      const tile = event.target.closest(".piece-tile");
      if (!tile) return;
      event.preventDefault();
      const piece = Number(tile.dataset.piece);
      startPieceDrag(piece, event.clientX, event.clientY);
      trayEl.setPointerCapture(event.pointerId);
    }, { passive: false });
    trayEl.addEventListener("pointermove", event => {
      if (state.pointer?.mode !== "piece") return;
      event.preventDefault();
      moveActiveTo(event.clientX, event.clientY);
    }, { passive: false });
    trayEl.addEventListener("pointerup", event => {
      if (state.pointer?.mode === "piece") {
        event.preventDefault();
        state.pointer = null;
        try {
          trayEl.releasePointerCapture(event.pointerId);
        } catch (_) {
          // Pointer capture may already be gone on Safari.
        }
      }
    }, { passive: false });
    trayEl.addEventListener("pointercancel", () => {
      if (state.pointer?.mode === "piece") state.pointer = null;
    });
    boardCanvas.addEventListener("pointerdown", event => {
      event.preventDefault();
      if (state.mode === "fourColumnCombo") {
        if (!state.active) return;
        const pointer = pointerCell(event.clientX, event.clientY);
        state.pointer = {
          mode: "move",
          grabX: pointer.x - state.active.x,
          grabY: pointer.y - state.active.y,
          startX: event.clientX,
          startY: event.clientY,
          moved: false
        };
        boardCanvas.setPointerCapture(event.pointerId);
        return;
      }
      if (state.tool === "draw") {
        state.pointer = { mode: "paint" };
        paintAt(event.clientX, event.clientY, true);
        boardCanvas.setPointerCapture(event.pointerId);
        return;
      }
      if (state.active) {
        const pointer = pointerCell(event.clientX, event.clientY);
        state.pointer = {
          mode: "move",
          grabX: pointer.x - state.active.x,
          grabY: pointer.y - state.active.y,
          startX: event.clientX,
          startY: event.clientY,
          moved: false
        };
        boardCanvas.setPointerCapture(event.pointerId);
        return;
      }
      const pointer = pointerCell(event.clientX, event.clientY);
      if (selectPlacedPiece(pointer.x, pointer.y)) {
        state.pointer = {
          mode: "move",
          grabX: pointer.x - state.active.x,
          grabY: pointer.y - state.active.y,
          startX: event.clientX,
          startY: event.clientY,
          moved: false
        };
        boardCanvas.setPointerCapture(event.pointerId);
        haptic();
        drawAll();
      }
    }, { passive: false });
    boardCanvas.addEventListener("pointermove", event => {
      if (!state.pointer) return;
      event.preventDefault();
      if (state.pointer?.mode === "paint") {
        paintAt(event.clientX, event.clientY, false);
      } else if (state.pointer?.mode === "move") {
        const distance = Math.hypot(event.clientX - state.pointer.startX, event.clientY - state.pointer.startY);
        if (!state.pointer.moved && distance < 9) return;
        state.pointer.moved = true;
        moveActiveTo(event.clientX, event.clientY);
      } else if (state.pointer?.mode === "piece") {
        moveActiveTo(event.clientX, event.clientY);
      }
    }, { passive: false });
    boardCanvas.addEventListener("pointerup", event => {
      event.preventDefault();
      const pointerState = state.pointer;
      if (pointerState?.mode === "move" && !pointerState.moved && state.active) {
        const { rect } = boardMetrics();
        const inside = event.clientX >= rect.left && event.clientX <= rect.right
          && event.clientY >= rect.top && event.clientY <= rect.bottom;
        if (inside) {
          if (state.mode === "fourColumnCombo") trainerRotate(event.clientX < rect.left + rect.width / 2 ? -1 : 1);
          else rotateActive(event.clientX < rect.left + rect.width / 2 ? -1 : 1);
        }
      }
      state.pointer = null;
      try {
        boardCanvas.releasePointerCapture(event.pointerId);
      } catch (_) {
        // Pointer capture may already be gone on Safari.
      }
    }, { passive: false });
    boardCanvas.addEventListener("pointercancel", () => {
      state.pointer = null;
    });
    boardCanvas.addEventListener("touchend", event => {
      const now = performance.now();
      if (now - lastBoardTouchEndAt < 360) event.preventDefault();
      lastBoardTouchEndAt = now;
    }, { passive: false });
    boardCanvas.addEventListener("dblclick", event => event.preventDefault());
    document.getElementById("undoBtn").addEventListener("click", () => {
      if (state.mode === "fourColumnCombo") {
        undoFourColumnCombo();
        return;
      }
      const snapshot = state.undo.pop();
      if (snapshot) {
        restore(snapshot);
        haptic();
      }
    });
    document.getElementById("clearBtn").addEventListener("click", clearLines);
    document.getElementById("resetBtn").addEventListener("click", resetBoard);
    document.getElementById("resetBagBtn").addEventListener("click", resetBag);
    document.getElementById("fourColumnComboBtn").addEventListener("click", toggleFourColumnComboMode);
    previewToggleBtn.addEventListener("click", toggleTrainerPreviewCount);
    ghostToggleBtn.addEventListener("click", toggleTrainerGhost);
    autoClearToggleBtn.addEventListener("click", toggleTrainerAutoClear);
    document.getElementById("fileBtn").addEventListener("click", () => {
      openFileDialog();
    });
    document.getElementById("fileCloseBtn").addEventListener("click", closeFileDialog);
    document.getElementById("fileSaveBtn").addEventListener("click", saveCurrentFile);
    document.getElementById("fileLoadBtn").addEventListener("click", loadSelectedFile);
    document.getElementById("fileDeleteBtn").addEventListener("click", deleteSelectedFile);
    document.getElementById("fileExportBtn").addEventListener("click", exportSelectedFile);
    document.getElementById("fileImportBtn").addEventListener("click", () => {
      const input = document.getElementById("fileImportInput");
      input.value = "";
      input.click();
    });
    document.getElementById("fileImportInput").addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (file) importJsonFile(file);
    });
    document.getElementById("fileList").addEventListener("change", event => {
      document.getElementById("fileNameInput").value = event.target.value;
      setFileStatus("");
    });
    document.getElementById("fileDialog").addEventListener("pointerdown", event => {
      if (event.target === event.currentTarget) closeFileDialog();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeFileDialog();
    });
    holdEl.addEventListener("pointerdown", event => {
      if (!event.isPrimary) return;
      event.preventDefault();
      holdActivePiece();
    }, { passive: false });
    holdEl.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      holdActivePiece();
    });
    window.addEventListener("resize", drawBoard);
  }

  setupPalette();
  bindEvents();
  drawAll();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js?v=38", { updateViaCache: "none" })
        .then(registration => registration.update())
        .catch(error => {
          console.warn("Service worker registration failed:", error);
        });
    });
  }
})();
