export interface WordInputItem {
  word: string
  clue: string
  orientation?: 'horizontal' | 'vertical'
}

export interface CrosswordWord extends WordInputItem {
  id: number
  orientation: 'horizontal' | 'vertical'
  x?: number
  y?: number
}

export interface PlacedWordCoordinates {
  x: number
  y: number
  orientation: 'horizontal' | 'vertical'
}

export interface GridCell {
  char: string
  wordIds: number[]
  wordOrientations: ('horizontal' | 'vertical')[]
  indices: Record<number, number>
  x?: number
  y?: number
}

export interface CrosswordGenerationResult {
  success: boolean
  words?: CrosswordWord[]
  grid?: Record<string, GridCell>
  width?: number
  height?: number
  errorWord?: string
  reason?: string
}

export interface ConnectivityResult {
  connected: boolean
  isolated: string[]
}
