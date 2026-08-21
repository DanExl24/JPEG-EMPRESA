import type {
  WordInputItem,
  CrosswordWord,
  PlacedWordCoordinates,
  GridCell,
  CrosswordGenerationResult,
  ConnectivityResult
} from '../types/crossword.types'

/**
 * Genera la distribución y coordenadas de un crucigrama cruzado a partir de una lista de palabras.
 * Resuelve las coordenadas y orientaciones para formar un único crucigrama conectado.
 */
export function generateCrossword(
  wordsInput: WordInputItem[],
  layoutMode: 'automatic' | 'manual' = 'automatic'
): CrosswordGenerationResult {
  // 1. Limpiar y validar palabras
  const words: CrosswordWord[] = wordsInput
    .map((w, idx) => ({
      id: idx,
      word: w.word.trim().toUpperCase(),
      clue: w.clue.trim(),
      orientation: (w.orientation || 'horizontal') as 'horizontal' | 'vertical',
    }))
    .filter(w => w.word.length > 0)

  if (words.length === 0) {
    return { success: true, words: [], grid: {}, width: 0, height: 0 }
  }

  // 2. Si hay más de una palabra, validar conectividad básica (que compartan letras)
  const conn: ConnectivityResult = checkConnectivity(words)
  if (!conn.connected) {
    return {
      success: false,
      errorWord: conn.isolated[0],
      reason: 'isolated'
    }
  }

  // Ordenar por longitud de palabra descendente (heurística clásica para facilitar colocación)
  const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length)

  const placed = new Map<number, PlacedWordCoordinates>()
  const grid = new Map<string, GridCell>()

  function getKey(x: number, y: number): string {
    return `${x},${y}`
  }

  function canPlace(word: CrosswordWord, x: number, y: number, orientation: 'horizontal' | 'vertical'): boolean {
    const len = word.word.length
    const isHoriz = orientation === 'horizontal'

    // Celda inmediatamente anterior al inicio
    const preX = x - (isHoriz ? 1 : 0)
    const preY = y - (isHoriz ? 0 : 1)
    if (grid.has(getKey(preX, preY))) return false

    // Celda inmediatamente posterior al final
    const postX = x + (isHoriz ? len : 0)
    const postY = y + (isHoriz ? 0 : len)
    if (grid.has(getKey(postX, postY))) return false

    for (let i = 0; i < len; i++) {
      const cx = x + (isHoriz ? i : 0)
      const cy = y + (isHoriz ? 0 : i)
      const char = word.word[i]

      const cell = grid.get(getKey(cx, cy))
      if (cell) {
        if (cell.char !== char) return false
        if (cell.wordOrientations.includes(orientation)) return false
      } else {
        const perpDirs = isHoriz ? [[0, -1], [0, 1]] : [[-1, 0], [1, 0]]
        for (const [dx, dy] of perpDirs) {
          if (dx !== undefined && dy !== undefined && grid.has(getKey(cx + dx, cy + dy))) {
            return false
          }
        }
      }
    }
    return true
  }

  function place(word: CrosswordWord, x: number, y: number, orientation: 'horizontal' | 'vertical'): void {
    const len = word.word.length
    const isHoriz = orientation === 'horizontal'
    placed.set(word.id, { x, y, orientation })

    for (let i = 0; i < len; i++) {
      const cx = x + (isHoriz ? i : 0)
      const cy = y + (isHoriz ? 0 : i)
      const char = word.word[i] || ''
      const key = getKey(cx, cy)

      const existingCell = grid.get(key)
      if (!existingCell) {
        grid.set(key, {
          char,
          wordIds: [word.id],
          wordOrientations: [orientation],
          indices: { [word.id]: i }
        })
      } else {
        existingCell.wordIds.push(word.id)
        existingCell.wordOrientations.push(orientation)
        existingCell.indices[word.id] = i
      }
    }
  }

  function unplace(word: CrosswordWord, x: number, y: number, orientation: 'horizontal' | 'vertical'): void {
    const len = word.word.length
    const isHoriz = orientation === 'horizontal'
    placed.delete(word.id)

    for (let i = 0; i < len; i++) {
      const cx = x + (isHoriz ? i : 0)
      const cy = y + (isHoriz ? 0 : i)
      const key = getKey(cx, cy)
      const cell = grid.get(key)

      if (cell) {
        if (cell.wordIds.length === 1) {
          grid.delete(key)
        } else {
          cell.wordIds = cell.wordIds.filter(id => id !== word.id)
          cell.wordOrientations = cell.wordOrientations.filter(o => o !== orientation)
          delete cell.indices[word.id]
        }
      }
    }
  }

  const unplacedIds = new Set<number>(sortedWords.map(w => w.id))

  function solve(): boolean {
    if (unplacedIds.size === 0) return true

    for (const wordId of unplacedIds) {
      const word = sortedWords.find(w => w.id === wordId)
      if (!word) continue

      if (placed.size === 0) {
        const ori = layoutMode === 'manual' ? word.orientation : 'horizontal'
        if (canPlace(word, 0, 0, ori)) {
          place(word, 0, 0, ori)
          unplacedIds.delete(wordId)
          if (solve()) return true
          unplacedIds.add(wordId)
          unplace(word, 0, 0, ori)
        }
        continue
      }

      for (const [placedId, pCoords] of placed.entries()) {
        const placedWord = sortedWords.find(w => w.id === placedId)
        if (!placedWord) continue
        const pIsHoriz = pCoords.orientation === 'horizontal'

        const nextOrientations: ('horizontal' | 'vertical')[] = []
        if (layoutMode === 'manual') {
          const isPerp = (word.orientation === 'horizontal' && !pIsHoriz) || (word.orientation === 'vertical' && pIsHoriz)
          if (isPerp) {
            nextOrientations.push(word.orientation)
          }
        } else {
          nextOrientations.push(pIsHoriz ? 'vertical' : 'horizontal')
        }

        for (const newOrientation of nextOrientations) {
          for (let i = 0; i < word.word.length; i++) {
            for (let j = 0; j < placedWord.word.length; j++) {
              if (word.word[i] === placedWord.word[j]) {
                const cx = pCoords.x + (pIsHoriz ? j : 0)
                const cy = pCoords.y + (pIsHoriz ? 0 : j)

                const startX = cx - (newOrientation === 'horizontal' ? i : 0)
                const startY = cy - (newOrientation === 'horizontal' ? 0 : i)

                if (canPlace(word, startX, startY, newOrientation)) {
                  place(word, startX, startY, newOrientation)
                  unplacedIds.delete(wordId)
                  if (solve()) return true
                  unplacedIds.add(wordId)
                  unplace(word, startX, startY, newOrientation)
                }
              }
            }
          }
        }
      }
    }

    return false
  }

  const success = solve()
  if (!success) {
    return { success: false, errorWord: words[0]?.word || '', reason: 'layout_failed' }
  }

  let minX = Infinity
  let minY = Infinity
  for (const coords of placed.values()) {
    minX = Math.min(minX, coords.x)
    minY = Math.min(minY, coords.y)
  }

  const resultWords: CrosswordWord[] = words.map(w => {
    const coords = placed.get(w.id)!
    return {
      ...w,
      x: coords.x - minX,
      y: coords.y - minY,
      orientation: coords.orientation,
    }
  })

  const normalizedGrid: Record<string, GridCell> = {}
  let width = 0
  let height = 0

  for (const [key, cell] of grid.entries()) {
    const [xStr, yStr] = key.split(',')
    const x = parseInt(xStr || '0', 10) - minX
    const y = parseInt(yStr || '0', 10) - minY

    normalizedGrid[getKey(x, y)] = {
      char: cell.char,
      wordIds: cell.wordIds,
      wordOrientations: cell.wordOrientations,
      indices: cell.indices,
      x,
      y,
    }

    width = Math.max(width, x + 1)
    height = Math.max(height, y + 1)
  }

  return {
    success: true,
    words: resultWords,
    grid: normalizedGrid,
    width,
    height,
  }
}

export function reconstructLayout(words: CrosswordWord[]): CrosswordGenerationResult {
  const grid: Record<string, GridCell> = {}
  let width = 0
  let height = 0

  words.forEach(w => {
    const len = w.word.length
    const isHoriz = w.orientation === 'horizontal'
    const wx = w.x || 0
    const wy = w.y || 0

    for (let i = 0; i < len; i++) {
      const x = wx + (isHoriz ? i : 0)
      const y = wy + (isHoriz ? 0 : i)
      const char = (w.word[i] || '').toUpperCase()
      const key = `${x},${y}`

      const existing = grid[key]
      if (!existing) {
        grid[key] = {
          char,
          wordIds: [w.id],
          wordOrientations: [w.orientation],
          indices: { [w.id]: i },
          x,
          y,
        }
      } else {
        existing.wordIds.push(w.id)
        existing.wordOrientations.push(w.orientation)
        existing.indices[w.id] = i
      }

      width = Math.max(width, x + 1)
      height = Math.max(height, y + 1)
    }
  })

  return {
    success: true,
    words,
    grid,
    width,
    height,
  }
}

function checkConnectivity(words: CrosswordWord[]): ConnectivityResult {
  if (words.length <= 1) return { connected: true, isolated: [] }

  const adj: Record<number, number[]> = {}
  words.forEach(w => { adj[w.id] = [] })

  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      const w1 = words[i]!
      const w2 = words[j]!
      const shares = w1.word.split('').some(char => w2.word.includes(char))
      if (shares) {
        adj[w1.id]!.push(w2.id)
        adj[w2.id]!.push(w1.id)
      }
    }
  }

  const visited = new Set<number>()
  function dfs(node: number): void {
    visited.add(node)
    adj[node]?.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        dfs(neighbor)
      }
    })
  }

  const firstWord = words[0]
  if (firstWord) {
    dfs(firstWord.id)
  }

  const isolated: string[] = []
  words.forEach(w => {
    if (!visited.has(w.id)) {
      isolated.push(w.word)
    }
  })

  return {
    connected: visited.size === words.length,
    isolated,
  }
}
