export interface CreateVocabularyDto {
  wordEn: string
  wordEs: string
  category: string
  definition: string
  example?: string
}

export interface UpdateVocabularyDto extends Partial<CreateVocabularyDto> {}

export interface CreateGlossaryDto {
  term: string
  area: string
  definition: string
  related?: string[] | string
  example?: string
}

export interface UpdateGlossaryDto extends Partial<CreateGlossaryDto> {}

export interface DialogueLineDto {
  speaker: string
  textEn: string
  textEs: string
}

export interface CreateDialogueDto {
  title: string
  description?: string
  content: string // JSON string of DialogueLineDto[]
}

export interface UpdateDialogueDto extends Partial<CreateDialogueDto> {}
