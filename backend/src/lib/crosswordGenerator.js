/**
 * Módulo de ayuda para desarrolladores backend.
 * Contiene el algoritmo idéntico al del frontend para generar la distribución y coordenadas de un crucigrama.
 */

export function generateCrossword(wordsInput, layoutMode = 'automatic') {
  const words = wordsInput
    .map((w, idx) => ({
      id: idx,
      word: w.word.trim().toUpperCase(),
      clue: w.clue.trim(),
      orientation: w.orientation || 'horizontal',
    }))
    .filter(w => w.word.length > 0);

  if (words.length === 0) {
    return { success: true, words: [], grid: {}, width: 0, height: 0 };
  }

  const conn = checkConnectivity(words);
  if (!conn.connected) {
    return { 
      success: false, 
      errorWord: conn.isolated[0], 
      reason: 'isolated' 
    };
  }

  const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length);

  const placed = new Map(); 
  const grid = new Map(); 

  function getKey(x, y) {
    return `${x},${y}`;
  }

  function canPlace(word, x, y, orientation) {
    const len = word.word.length;
    const isHoriz = orientation === 'horizontal';

    const preX = x - (isHoriz ? 1 : 0);
    const preY = y - (isHoriz ? 0 : 1);
    if (grid.has(getKey(preX, preY))) return false;

    const postX = x + (isHoriz ? len : 0);
    const postY = y + (isHoriz ? 0 : len);
    if (grid.has(getKey(postX, postY))) return false;

    for (let i = 0; i < len; i++) {
      const cx = x + (isHoriz ? i : 0);
      const cy = y + (isHoriz ? 0 : i);
      const char = word.word[i];

      const cell = grid.get(getKey(cx, cy));
      if (cell) {
        if (cell.char !== char) return false;
        if (cell.wordOrientations.includes(orientation)) return false;
      } else {
        const perpDirs = isHoriz ? [[0, -1], [0, 1]] : [[-1, 0], [1, 0]];
        for (const [dx, dy] of perpDirs) {
          if (grid.has(getKey(cx + dx, cy + dy))) {
            return false;
          }
        }
      }
    }
    return true;
  }

  function place(word, x, y, orientation) {
    const len = word.word.length;
    const isHoriz = orientation === 'horizontal';
    placed.set(word.id, { x, y, orientation });

    for (let i = 0; i < len; i++) {
      const cx = x + (isHoriz ? i : 0);
      const cy = y + (isHoriz ? 0 : i);
      const char = word.word[i];
      const key = getKey(cx, cy);

      if (!grid.has(key)) {
        grid.set(key, { 
          char, 
          wordIds: [word.id], 
          wordOrientations: [orientation], 
          indices: { [word.id]: i } 
        });
      } else {
        const cell = grid.get(key);
        cell.wordIds.push(word.id);
        cell.wordOrientations.push(orientation);
        cell.indices[word.id] = i;
      }
    }
  }

  function unplace(word, x, y, orientation) {
    const len = word.word.length;
    const isHoriz = orientation === 'horizontal';
    placed.delete(word.id);

    for (let i = 0; i < len; i++) {
      const cx = x + (isHoriz ? i : 0);
      const cy = y + (isHoriz ? 0 : i);
      const key = getKey(cx, cy);
      const cell = grid.get(key);

      if (cell) {
        if (cell.wordIds.length === 1) {
          grid.delete(key);
        } else {
          cell.wordIds = cell.wordIds.filter(id => id !== word.id);
          cell.wordOrientations = cell.wordOrientations.filter(o => o !== orientation);
          delete cell.indices[word.id];
        }
      }
    }
  }

  const unplacedIds = new Set(sortedWords.map(w => w.id));

  function solve() {
    if (unplacedIds.size === 0) return true;

    for (const wordId of unplacedIds) {
      const word = sortedWords.find(w => w.id === wordId);

      if (placed.size === 0) {
        if (layoutMode === 'manual') {
          const ori = word.orientation;
          if (canPlace(word, 0, 0, ori)) {
            place(word, 0, 0, ori);
            unplacedIds.delete(wordId);
            if (solve()) return true;
            unplacedIds.add(wordId);
            unplace(word, 0, 0, ori);
          }
        } else {
          if (canPlace(word, 0, 0, 'horizontal')) {
            place(word, 0, 0, 'horizontal');
            unplacedIds.delete(wordId);
            if (solve()) return true;
            unplacedIds.add(wordId);
            unplace(word, 0, 0, 'horizontal');
          }
        }
        continue;
      }

      for (const [placedId, pCoords] of placed.entries()) {
        const placedWord = sortedWords.find(w => w.id === placedId);
        const pIsHoriz = pCoords.orientation === 'horizontal';

        const nextOrientations = [];
        if (layoutMode === 'manual') {
          const isPerp = (word.orientation === 'horizontal' && !pIsHoriz) || (word.orientation === 'vertical' && pIsHoriz);
          if (isPerp) {
            nextOrientations.push(word.orientation);
          }
        } else {
          nextOrientations.push(pIsHoriz ? 'vertical' : 'horizontal');
        }

        for (const newOrientation of nextOrientations) {
          for (let i = 0; i < word.word.length; i++) {
            for (let j = 0; j < placedWord.word.length; j++) {
              if (word.word[i] === placedWord.word[j]) {
                const cx = pCoords.x + (pIsHoriz ? j : 0);
                const cy = pCoords.y + (pIsHoriz ? 0 : j);

                const startX = cx - (newOrientation === 'horizontal' ? i : 0);
                const startY = cy - (newOrientation === 'horizontal' ? 0 : i);

                if (canPlace(word, startX, startY, newOrientation)) {
                  place(word, startX, startY, newOrientation);
                  unplacedIds.delete(wordId);
                  if (solve()) return true;
                  unplacedIds.add(wordId);
                  unplace(word, startX, startY, newOrientation);
                }
              }
            }
          }
        }
      }
    }

    return false;
  }

  const success = solve();
  if (!success) {
    return { success: false, errorWord: words[0].word, reason: 'layout_failed' };
  }

  let minX = Infinity, minY = Infinity;
  for (const coords of placed.values()) {
    minX = Math.min(minX, coords.x);
    minY = Math.min(minY, coords.y);
  }

  const resultWords = words.map(w => {
    const coords = placed.get(w.id);
    return {
      ...w,
      x: coords.x - minX,
      y: coords.y - minY,
      orientation: coords.orientation,
    };
  });

  const normalizedGrid = {};
  let width = 0;
  let height = 0;

  for (const [key, cell] of grid.entries()) {
    const [xStr, yStr] = key.split(',');
    const x = parseInt(xStr) - minX;
    const y = parseInt(yStr) - minY;

    normalizedGrid[getKey(x, y)] = {
      char: cell.char,
      wordIds: cell.wordIds,
      wordOrientations: cell.wordOrientations,
      indices: cell.indices,
      x,
      y,
    };

    width = Math.max(width, x + 1);
    height = Math.max(height, y + 1);
  }

  return {
    success: true,
    words: resultWords,
    grid: normalizedGrid,
    width,
    height,
  };
}

export function reconstructLayout(words) {
  const grid = {};
  let width = 0;
  let height = 0;

  words.forEach(w => {
    const len = w.word.length;
    const isHoriz = w.orientation === 'horizontal';

    for (let i = 0; i < len; i++) {
      const x = w.x + (isHoriz ? i : 0);
      const y = w.y + (isHoriz ? 0 : i);
      const char = w.word[i].toUpperCase();
      const key = `${x},${y}`;

      if (!grid[key]) {
        grid[key] = {
          char,
          wordIds: [w.id],
          wordOrientations: [w.orientation],
          indices: { [w.id]: i },
          x,
          y,
        };
      } else {
        grid[key].wordIds.push(w.id);
        grid[key].wordOrientations.push(w.orientation);
        grid[key].indices[w.id] = i;
      }

      width = Math.max(width, x + 1);
      height = Math.max(height, y + 1);
    }
  });

  return {
    success: true,
    words,
    grid,
    width,
    height,
  };
}

function checkConnectivity(words) {
  if (words.length <= 1) return { connected: true, isolated: [] };

  const adj = {};
  words.forEach(w => { adj[w.id] = []; });

  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      const w1 = words[i];
      const w2 = words[j];
      const shares = w1.word.split('').some(char => w2.word.includes(char));
      if (shares) {
        adj[w1.id].push(w2.id);
        adj[w2.id].push(w1.id);
      }
    }
  }

  const visited = new Set();
  function dfs(node) {
    visited.add(node);
    adj[node].forEach(neighbor => {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    });
  }

  dfs(words[0].id);

  const isolated = [];
  words.forEach(w => {
    if (!visited.has(w.id)) {
      isolated.push(w.word);
    }
  });

  return {
    connected: visited.size === words.length,
    isolated,
  };
}
