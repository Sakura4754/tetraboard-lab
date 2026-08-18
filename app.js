(function () {
  "use strict";

  const ROWS = 20;
  const COLS = 10;
  const EMPTY = -1;
  const ACCESS_PASSWORD = "8888";
  const CSS_PX_PER_INCH = 96;
  const TOUCH_HORIZONTAL_STEP = 0.15 * CSS_PX_PER_INCH;
  const TOUCH_TAP_RADIUS = 0.10 * CSS_PX_PER_INCH;
  const TOUCH_TAP_MAX_MS = 1000;
  const TOUCH_DOWN_CONE = 0.41421357;
  const TOUCH_SOFT_DROP_LATCH_MS = 20;
  const TOUCH_SOFT_DROP_INTERVAL_MS = 35;
  const TOUCH_SWIPE_MIN = 0.25 * CSS_PX_PER_INCH;
  const TOUCH_SWIPE_SAMPLE_MS = 210;
  const TOUCH_SWIPE_ACCEL = 60 * CSS_PX_PER_INCH;
  const TOUCH_SWIPE_SIGNAL_FACTOR = 1.2;
  const TOUCH_POST_DRAG_SPEED = 8 * CSS_PX_PER_INCH;
  const TOUCH_TRANSITION_SPEED = 5.5 * CSS_PX_PER_INCH;
  const PIECES = ["I", "O", "T", "L", "J", "S", "Z"];
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
    undo: [],
    tool: "piece",
    paint: 7,
    active: null,
    pointer: null
  };

  let lastInteractionHapticAt = -Infinity;
  let lastBoardTouchEndAt = -Infinity;
  let softDropTimer = null;

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

  function setupPasswordGate() {
    const gate = document.getElementById("passwordGate");
    const form = document.getElementById("passwordForm");
    const input = document.getElementById("passwordInput");
    const error = document.getElementById("passwordError");
    const shell = document.getElementById("appShell");

    form.addEventListener("submit", event => {
      event.preventDefault();
      if (input.value !== ACCESS_PASSWORD) {
        error.textContent = "Incorrect password";
        input.value = "";
        input.focus();
        if (navigator.vibrate) navigator.vibrate([30, 35, 30]);
        return;
      }
      error.textContent = "";
      shell.classList.remove("locked");
      shell.setAttribute("aria-hidden", "false");
      gate.remove();
      haptic();
      drawAll();
    });

    requestAnimationFrame(() => input.focus());
  }

  function copyBoard(board) {
    return board.map(row => row.slice());
  }

  function pushUndo() {
    state.undo.push({
      board: copyBoard(state.board),
      groups: copyBoard(state.groups),
      pieceRecords: JSON.parse(JSON.stringify(state.pieceRecords)),
      nextGroupId: state.nextGroupId,
      trayOrder: state.trayOrder.slice(),
      usedPieces: state.usedPieces.slice(),
      holdPiece: state.holdPiece,
      holdLocked: state.holdLocked,
      active: state.active ? { ...state.active } : null
    });
    if (state.undo.length > 80) state.undo.shift();
  }

  function restore(snapshot) {
    state.board = copyBoard(snapshot.board);
    state.groups = snapshot.groups ? copyBoard(snapshot.groups) : Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    state.pieceRecords = snapshot.pieceRecords ? JSON.parse(JSON.stringify(snapshot.pieceRecords)) : {};
    state.nextGroupId = snapshot.nextGroupId || 1;
    state.trayOrder = snapshot.trayOrder ? snapshot.trayOrder.slice() : PIECES.map((_, index) => index);
    state.usedPieces = snapshot.usedPieces ? snapshot.usedPieces.slice() : Array(7).fill(false);
    state.holdPiece = Number.isInteger(snapshot.holdPiece) ? snapshot.holdPiece : null;
    state.holdLocked = Boolean(snapshot.holdLocked);
    state.active = snapshot.active ? { ...snapshot.active } : null;
    drawAll();
  }

  function boardMetrics() {
    const rect = boardCanvas.getBoundingClientRect();
    return {
      rect,
      cell: rect.width / COLS,
      scaleX: boardCanvas.width / rect.width,
      scaleY: boardCanvas.height / rect.height
    };
  }

  function cellsFor(piece) {
    return SHAPES[piece.piece][piece.rotation & 3].map(([x, y]) => [piece.x + x, piece.y + y]);
  }

  function isValid(piece) {
    return cellsFor(piece).every(([x, y]) => x >= 0 && x < COLS && y >= 0 && y < ROWS && state.board[y][x] === EMPTY);
  }

  function clampPieceIntoBoard(piece) {
    const shape = SHAPES[piece.piece][piece.rotation & 3];
    const minX = Math.min(...shape.map(([x]) => x));
    const maxX = Math.max(...shape.map(([x]) => x));
    const minY = Math.min(...shape.map(([, y]) => y));
    const maxY = Math.max(...shape.map(([, y]) => y));
    return {
      ...piece,
      x: clamp(piece.x, -minX, COLS - 1 - maxX),
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
    cancelBoardControl();
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
    const cell = width / COLS;
    ctx.clearRect(0, 0, width, height);
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#1a2637");
    bg.addColorStop(1, "#111925");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.055)";
    ctx.lineWidth = 1;
    for (let x = 1; x < COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cell, 0);
      ctx.lineTo(x * cell, height);
      ctx.stroke();
    }
    for (let y = 1; y < ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cell);
      ctx.lineTo(width, y * cell);
      ctx.stroke();
    }

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const value = state.board[y][x];
        if (value !== EMPTY) {
          drawCell(ctx, x * cell, y * cell, cell, PAINT_COLORS[value] || PAINT_COLORS[7], false);
        }
      }
    }

    if (state.active && isValid(state.active)) {
      const ghost = landingPosition(state.active);
      if (ghost.y !== state.active.y) {
        for (const [x, y] of cellsFor(ghost)) {
          drawGhostCell(ctx, x * cell, y * cell, cell, COLORS[state.active.piece]);
        }
      }
    }

    if (state.active) {
      const invalid = !isValid(state.active);
      for (const [x, y] of cellsFor(state.active)) {
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
          drawCell(ctx, x * cell, y * cell, cell, COLORS[state.active.piece], invalid);
        }
      }
    }
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

  function holdActivePiece() {
    if (!state.active || !isValid(state.active) || state.holdLocked) return;
    cancelBoardControl();

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
    cancelBoardControl();
    state.paint = index;
    document.querySelectorAll(".swatch").forEach(button => {
      button.classList.toggle("active", Number(button.dataset.color) === index);
    });
    setTool("draw");
  }

  function paintAt(clientX, clientY, forceUndo) {
    const { rect, cell } = boardMetrics();
    const x = Math.floor((clientX - rect.left) / cell);
    const y = Math.floor((clientY - rect.top) / cell);
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;
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
    const { rect, cell } = boardMetrics();
    return {
      x: Math.floor((clientX - rect.left) / cell),
      y: Math.floor((clientY - rect.top) / cell)
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function startPieceDrag(piece, clientX, clientY) {
    if (state.usedPieces[piece]) return;
    clearSoftDropTimer();
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
      if (moved) interactionHaptic();
    }
    drawBoard();
  }

  function moveActiveHorizontal(steps) {
    if (!state.active || steps === 0) return false;
    const direction = Math.sign(steps);
    let moved = false;
    for (let i = 0; i < Math.abs(steps); i++) {
      const candidate = { ...state.active, x: state.active.x + direction };
      if (!isValid(candidate)) break;
      state.active = candidate;
      moved = true;
    }
    if (moved) interactionHaptic();
    drawBoard();
    return moved;
  }

  function moveActiveVertical(steps) {
    if (!state.active || steps === 0) return false;
    const direction = Math.sign(steps);
    let moved = false;
    for (let i = 0; i < Math.abs(steps); i++) {
      const candidate = { ...state.active, y: state.active.y + direction };
      if (!isValid(candidate)) break;
      state.active = candidate;
      moved = true;
    }
    if (moved) interactionHaptic();
    drawBoard();
    return moved;
  }

  function clearSoftDropTimer() {
    if (softDropTimer === null) return;
    clearInterval(softDropTimer);
    softDropTimer = null;
  }

  function softDropOneRow() {
    if (!state.active) {
      clearSoftDropTimer();
      return false;
    }
    const candidate = { ...state.active, y: state.active.y + 1 };
    if (!isValid(candidate)) {
      clearSoftDropTimer();
      return false;
    }
    state.active = candidate;
    interactionHaptic(5, 30);
    drawBoard();
    return true;
  }

  function startSoftDrop(pointer) {
    if (pointer.softDropping) return;
    pointer.softDropping = true;
    pointer.didAction = true;
    softDropOneRow();
    if (softDropTimer === null) {
      softDropTimer = setInterval(softDropOneRow, TOUCH_SOFT_DROP_INTERVAL_MS);
    }
  }

  function stopSoftDrop(pointer) {
    clearSoftDropTimer();
    if (pointer) pointer.softDropping = false;
  }

  function addControlSample(pointer, x, y, time) {
    pointer.samples.push({ x, y, time });
    if (pointer.samples.length > 30) pointer.samples.shift();
  }

  function beginBoardControl(clientX, clientY) {
    clearSoftDropTimer();
    const now = performance.now();
    state.pointer = {
      mode: "control",
      sourceX: clientX,
      sourceY: clientY,
      startX: clientX,
      startY: clientY,
      startedAt: now,
      maxDistance: 0,
      downSince: null,
      hadHorizontal: false,
      softDropping: false,
      didAction: false,
      samples: []
    };
    addControlSample(state.pointer, clientX, clientY, now);
  }

  function updateBoardControl(clientX, clientY) {
    const pointer = state.pointer;
    if (!pointer || pointer.mode !== "control" || !state.active) return;

    const now = performance.now();
    addControlSample(pointer, clientX, clientY, now);
    pointer.maxDistance = Math.max(pointer.maxDistance, Math.hypot(clientX - pointer.startX, clientY - pointer.startY));

    const dx = clientX - pointer.sourceX;
    const dy = clientY - pointer.sourceY;
    if (Math.abs(dx) >= TOUCH_HORIZONTAL_STEP && Math.abs(dx) > Math.abs(dy)) {
      const steps = Math.sign(dx) * Math.round(Math.abs(dx) / TOUCH_HORIZONTAL_STEP);
      stopSoftDrop(pointer);
      moveActiveHorizontal(steps);
      pointer.hadHorizontal = true;
      pointer.didAction = true;
      pointer.sourceX = clientX;
      pointer.sourceY = clientY;
      pointer.downSince = null;
      pointer.samples = [];
      addControlSample(pointer, clientX, clientY, now);
      return;
    }

    if (dy <= -TOUCH_HORIZONTAL_STEP && Math.abs(dy) > Math.abs(dx)) {
      const steps = -Math.round(Math.abs(dy) / TOUCH_HORIZONTAL_STEP);
      stopSoftDrop(pointer);
      moveActiveVertical(steps);
      pointer.didAction = true;
      pointer.sourceX = clientX;
      pointer.sourceY = clientY;
      pointer.downSince = null;
      pointer.samples = [];
      addControlSample(pointer, clientX, clientY, now);
      return;
    }

    const isDown = dy > 0
      && Math.abs(dx) <= dy * TOUCH_DOWN_CONE
      && dx * dx + dy * dy >= TOUCH_HORIZONTAL_STEP * TOUCH_HORIZONTAL_STEP;
    if (!isDown) {
      pointer.downSince = null;
      return;
    }

    if (pointer.downSince === null) pointer.downSince = now;
    if (!pointer.softDropping && now - pointer.downSince >= TOUCH_SOFT_DROP_LATCH_MS) {
      startSoftDrop(pointer);
    }
  }

  function isHardDropGesture(pointer, clientX, clientY, endedAt) {
    addControlSample(pointer, clientX, clientY, endedAt);
    const recent = pointer.samples.filter(sample => endedAt - sample.time <= TOUCH_SWIPE_SAMPLE_MS);
    if (recent.length < 2) return false;

    const first = recent[0];
    const last = recent[recent.length - 1];
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    if (dy <= TOUCH_SWIPE_MIN || dy <= Math.abs(dx)) return false;

    const motion = [];
    let previousVelocityY = 0;
    let peakDownSpeed = 0;
    for (let i = 1; i < recent.length; i++) {
      const dt = Math.max((recent[i].time - recent[i - 1].time) / 1000, 1 / 120);
      const velocityY = (recent[i].y - recent[i - 1].y) / dt;
      const accelerationY = (velocityY - previousVelocityY) / dt;
      peakDownSpeed = Math.max(peakDownSpeed, velocityY);
      motion.push({ velocityY, accelerationY });
      previousVelocityY = velocityY;
    }

    const accelerationRms = motion.length === 0
      ? 0
      : Math.sqrt(motion.reduce((sum, sample) => sum + sample.accelerationY * sample.accelerationY, 0) / motion.length);
    const accelerationThreshold = Math.max(TOUCH_SWIPE_ACCEL, accelerationRms * TOUCH_SWIPE_SIGNAL_FACTOR);
    const speedThreshold = pointer.hadHorizontal ? TOUCH_POST_DRAG_SPEED : 0;
    const hasDownSignal = motion.some(sample => sample.accelerationY > accelerationThreshold
      && sample.velocityY > speedThreshold);
    const canUseFallback = pointer.hadHorizontal || pointer.softDropping;
    return hasDownSignal || (canUseFallback && peakDownSpeed >= TOUCH_TRANSITION_SPEED);
  }

  function hardDropActive() {
    if (!state.active || !isValid(state.active)) return;
    const landing = landingPosition(state.active);
    if (landing.y !== state.active.y) {
      state.active = landing;
      haptic(12);
      drawBoard();
    }
  }

  function finishBoardControl(clientX, clientY) {
    const pointer = state.pointer;
    if (!pointer || pointer.mode !== "control") return;
    const endedAt = performance.now();
    const hardDrop = isHardDropGesture(pointer, clientX, clientY, endedAt);
    const wasSoftDropping = pointer.softDropping;
    clearSoftDropTimer();

    if (hardDrop) {
      hardDropActive();
    } else if (!pointer.didAction && !wasSoftDropping
      && pointer.maxDistance <= TOUCH_TAP_RADIUS
      && endedAt - pointer.startedAt <= TOUCH_TAP_MAX_MS) {
      const { rect } = boardMetrics();
      const inside = clientX >= rect.left && clientX <= rect.right
        && clientY >= rect.top && clientY <= rect.bottom;
      if (inside) rotateActive(clientX < rect.left + rect.width / 2 ? -1 : 1);
    }

    state.pointer = null;
  }

  function cancelBoardControl() {
    clearSoftDropTimer();
    state.pointer = null;
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
    cancelBoardControl();
    pushUndo();
    state.board = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
    state.groups = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
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

  function bindEvents() {
    const appShell = document.getElementById("appShell");
    for (const eventName of ["dragstart", "selectstart", "contextmenu"]) {
      appShell.addEventListener(eventName, event => event.preventDefault());
    }

    document.querySelectorAll(".tool").forEach(button => {
      button.addEventListener("click", () => setTool(button.dataset.tool));
    });
    paletteEl.addEventListener("click", event => {
      const button = event.target.closest(".swatch");
      if (button) setPaint(Number(button.dataset.color));
    });
    trayEl.addEventListener("pointerdown", event => {
      if (!event.isPrimary) return;
      const tile = event.target.closest(".piece-tile");
      if (!tile) return;
      event.preventDefault();
      const piece = Number(tile.dataset.piece);
      startPieceDrag(piece, event.clientX, event.clientY);
      trayEl.setPointerCapture(event.pointerId);
    }, { passive: false });
    trayEl.addEventListener("pointermove", event => {
      if (!event.isPrimary) return;
      if (state.pointer?.mode !== "piece") return;
      event.preventDefault();
      moveActiveTo(event.clientX, event.clientY);
    }, { passive: false });
    trayEl.addEventListener("pointerup", event => {
      if (!event.isPrimary) return;
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
      if (!event.isPrimary) return;
      event.preventDefault();
      if (state.tool === "draw") {
        state.pointer = { mode: "paint" };
        paintAt(event.clientX, event.clientY, true);
        boardCanvas.setPointerCapture(event.pointerId);
        return;
      }
      if (state.active) {
        beginBoardControl(event.clientX, event.clientY);
        boardCanvas.setPointerCapture(event.pointerId);
        return;
      }
      const pointer = pointerCell(event.clientX, event.clientY);
      if (selectPlacedPiece(pointer.x, pointer.y)) {
        beginBoardControl(event.clientX, event.clientY);
        boardCanvas.setPointerCapture(event.pointerId);
        haptic();
        drawAll();
      }
    }, { passive: false });
    boardCanvas.addEventListener("pointermove", event => {
      if (!event.isPrimary) return;
      if (!state.pointer) return;
      event.preventDefault();
      if (state.pointer?.mode === "paint") {
        paintAt(event.clientX, event.clientY, false);
      } else if (state.pointer?.mode === "control") {
        updateBoardControl(event.clientX, event.clientY);
      } else if (state.pointer?.mode === "piece") {
        moveActiveTo(event.clientX, event.clientY);
      }
    }, { passive: false });
    boardCanvas.addEventListener("pointerup", event => {
      if (!event.isPrimary) return;
      event.preventDefault();
      const pointerState = state.pointer;
      if (pointerState?.mode === "control") finishBoardControl(event.clientX, event.clientY);
      else state.pointer = null;
      try {
        boardCanvas.releasePointerCapture(event.pointerId);
      } catch (_) {
        // Pointer capture may already be gone on Safari.
      }
    }, { passive: false });
    boardCanvas.addEventListener("pointercancel", () => {
      cancelBoardControl();
    });
    boardCanvas.addEventListener("touchend", event => {
      const now = performance.now();
      if (now - lastBoardTouchEndAt < 360) event.preventDefault();
      lastBoardTouchEndAt = now;
    }, { passive: false });
    boardCanvas.addEventListener("dblclick", event => event.preventDefault());
    document.getElementById("undoBtn").addEventListener("click", () => {
      const snapshot = state.undo.pop();
      if (snapshot) {
        cancelBoardControl();
        restore(snapshot);
        haptic();
      }
    });
    document.getElementById("clearBtn").addEventListener("click", clearLines);
    document.getElementById("resetBtn").addEventListener("click", resetBoard);
    document.getElementById("resetBagBtn").addEventListener("click", resetBag);
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
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelBoardControl();
    });
  }

  setupPalette();
  bindEvents();
  drawAll();
  setupPasswordGate();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(error => {
        console.warn("Service worker registration failed:", error);
      });
    });
  }
})();
