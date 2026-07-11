import prisma from '../lib/db.js'

// --- VOCABULARY ---
export async function getVocabulary(req, res) {
  try {
    const list = await prisma.vocabulary.findMany()
    res.json(list)
  } catch (err) {
    res.status(500).json({ message: 'Error al listar vocabulario.', error: err.message })
  }
}

export async function createVocabularyTerm(req, res) {
  try {
    const { wordEn, wordEs, category, definition, example } = req.body
    if (!wordEn || !wordEs || !category || !definition) {
      return res.status(400).json({ message: 'Los campos en inglés, español, categoría y definición son obligatorios.' })
    }

    const created = await prisma.vocabulary.create({
      data: { wordEn, wordEs, category, definition, example }
    })
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ message: 'Error al crear término de vocabulario.', error: err.message })
  }
}

export async function updateVocabularyTerm(req, res) {
  try {
    const { id } = req.params
    const { wordEn, wordEs, category, definition, example } = req.body
    if (!wordEn || !wordEs || !category || !definition) {
      return res.status(400).json({ message: 'Los campos en inglés, español, categoría y definición son obligatorios.' })
    }

    const updated = await prisma.vocabulary.update({
      where: { id: parseInt(id) },
      data: { wordEn, wordEs, category, definition, example }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar término de vocabulario.', error: err.message })
  }
}

export async function deleteVocabularyTerm(req, res) {
  try {
    const { id } = req.params
    await prisma.vocabulary.delete({
      where: { id: parseInt(id) }
    })
    res.json({ message: 'Término de vocabulario eliminado correctamente.' })
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar término de vocabulario.', error: err.message })
  }
}

// --- DIALOGUES ---
export async function getDialogues(req, res) {
  try {
    const list = await prisma.dialogue.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(list)
  } catch (err) {
    res.status(500).json({ message: 'Error al listar diálogos.', error: err.message })
  }
}

export async function getDialogueById(req, res) {
  try {
    const { id } = req.params
    const item = await prisma.dialogue.findUnique({
      where: { id: parseInt(id) }
    })
    if (!item) return res.status(404).json({ message: 'Diálogo no encontrado.' })
    res.json(item)
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener diálogo.', error: err.message })
  }
}

export async function createDialogue(req, res) {
  try {
    const { title, description, content } = req.body
    if (!title || !content) {
      return res.status(400).json({ message: 'El título y el contenido son obligatorios.' })
    }

    // Verify content is a valid JSON string (represents array of speaker lines)
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content
      if (!Array.isArray(parsed)) throw new Error('El contenido del diálogo debe ser una lista de líneas.')
    } catch (e) {
      return res.status(400).json({ message: 'Contenido de diálogo inválido. Debe ser una lista JSON.', error: e.message })
    }

    const created = await prisma.dialogue.create({
      data: {
        title,
        description,
        content: typeof content === 'string' ? content : JSON.stringify(content)
      }
    })
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ message: 'Error al crear diálogo.', error: err.message })
  }
}

export async function updateDialogue(req, res) {
  try {
    const { id } = req.params
    const { title, description, content } = req.body
    if (!title || !content) {
      return res.status(400).json({ message: 'El título y el contenido son obligatorios.' })
    }

    // Verify JSON content
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content
      if (!Array.isArray(parsed)) throw new Error('El contenido debe ser una lista de líneas.')
    } catch (e) {
      return res.status(400).json({ message: 'Contenido de diálogo inválido.', error: e.message })
    }

    const updated = await prisma.dialogue.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        content: typeof content === 'string' ? content : JSON.stringify(content)
      }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar diálogo.', error: err.message })
  }
}

export async function deleteDialogue(req, res) {
  try {
    const { id } = req.params
    await prisma.dialogue.delete({
      where: { id: parseInt(id) }
    })
    res.json({ message: 'Diálogo eliminado correctamente.' })
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar diálogo.', error: err.message })
  }
}
