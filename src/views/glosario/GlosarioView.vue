<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">

    <!-- Header -->
    <div class="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 text-white">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
          <span class="material-symbols-outlined text-3xl">menu_book</span>
        </div>
        <div>
          <h2 class="text-2xl font-black">Glosario Clínico</h2>
          <p class="text-emerald-100 text-sm mt-0.5">Definiciones detalladas de conceptos clínicos y médicos</p>
        </div>
      </div>
      <div class="mt-4 relative">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar concepto..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-white/50"
        />
      </div>
    </div>

    <!-- Alphabet filter -->
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="letter in alphabet"
        :key="letter"
        @click="activeLetter = activeLetter === letter ? null : letter"
        :class="`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
          activeLetter === letter
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'bg-white text-gray-500 border border-gray-200 hover:border-emerald-400 hover:text-emerald-600'
        }`"
      >{{ letter }}</button>
      <button
        v-if="activeLetter"
        @click="activeLetter = null"
        class="px-3 h-8 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
      >Todas</button>
    </div>

    <!-- Glossary list -->
    <div class="space-y-3">
      <div
        v-for="term in filteredTerms"
        :key="term.term"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
      >
        <button
          class="w-full flex items-center justify-between gap-4 p-5 text-left"
          @click="toggle(term.term)"
        >
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <span class="text-lg font-black text-emerald-600">{{ term.term[0] }}</span>
            </div>
            <div>
              <p class="font-black text-gray-800">{{ term.term }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ term.area }}</p>
            </div>
          </div>
          <span class="material-symbols-outlined text-gray-400 shrink-0 transition-transform" :style="expanded.has(term.term) ? 'transform:rotate(180deg)' : ''">expand_more</span>
        </button>
        <div v-if="expanded.has(term.term)" class="px-5 pb-5 space-y-3 border-t border-gray-50">
          <p class="text-sm text-gray-700 leading-relaxed">{{ term.definition }}</p>
          <div v-if="term.related.length" class="flex flex-wrap gap-2">
            <span class="text-xs font-bold text-gray-400">Relacionados:</span>
            <span v-for="r in term.related" :key="r" class="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">{{ r }}</span>
          </div>
          <div v-if="term.example" class="bg-gray-50 rounded-xl p-3">
            <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Contexto clínico</p>
            <p class="text-xs text-gray-600 italic">{{ term.example }}</p>
          </div>
        </div>
      </div>
    </div>

    <p v-if="filteredTerms.length === 0" class="text-center text-gray-400 py-12 font-semibold">
      No se encontraron términos.
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const activeLetter = ref(null)
const expanded = ref(new Set())

function toggle(term) {
  if (expanded.value.has(term)) {
    expanded.value.delete(term)
  } else {
    expanded.value.add(term)
  }
}

const GLOSSARY = [
  { term: 'Anamnesis', area: 'Evaluación clínica', definition: 'Historia clínica obtenida a través de la entrevista al paciente o sus familiares. Incluye antecedentes personales, familiares, hábitos y motivo de consulta. Es el primer paso en la evaluación de un paciente.', related: ['Historia clínica', 'Exploración física'], example: 'Una anamnesis completa reveló antecedentes de hipertensión arterial no tratada.' },
  { term: 'Asepsia', area: 'Control de infecciones', definition: 'Ausencia de microorganismos patógenos en un área o material. Se logra mediante técnicas estériles, uso de guantes, mascarillas y desinfección de superficies. Fundamental en procedimientos invasivos.', related: ['Antisepsia', 'Esterilización', 'Desinfección'], example: 'Se mantiene asepsia estricta durante la inserción del catéter venoso central.' },
  { term: 'Bradicardia', area: 'Cardiología', definition: 'Frecuencia cardíaca inferior a 60 latidos por minuto en adultos. Puede ser fisiológica (atletas) o patológica. Los síntomas incluyen mareo, síncope y fatiga.', related: ['Taquicardia', 'Arritmia', 'ECG'], example: 'El paciente presenta bradicardia sinusal con FC de 45 lpm y síncope episódico.' },
  { term: 'Catéter', area: 'Procedimientos', definition: 'Tubo flexible de diferentes materiales (plástico, silicona) que se introduce en cavidades, vasos o conductos del cuerpo para drenar, inyectar fluidos o realizar mediciones.', related: ['Vía intravenosa', 'Sonda vesical', 'Cateterismo cardíaco'], example: 'Se colocó un catéter de Foley para monitorizar el gasto urinario.' },
  { term: 'Disnea', area: 'Respiratorio', definition: 'Sensación subjetiva de dificultad respiratoria o falta de aire. Puede clasificarse por severidad (leve, moderada, severa) y origen (cardíaca, pulmonar, psicógena). Signo de múltiples patologías.', related: ['Taquipnea', 'Hipoxia', 'EPOC'], example: 'El paciente presenta disnea de esfuerzo ante actividades moderadas como subir escaleras.' },
  { term: 'Edema', area: 'Fisiopatología', definition: 'Acumulación anormal de líquido en los tejidos corporales. Puede ser localizado (traumático) o generalizado (sistémico). Se clasifica con la escala "godet" según el grado de compresión.', related: ['Anasarca', 'Linfedema', 'Insuficiencia cardíaca'], example: 'El paciente presenta edema con godet +2 en ambos miembros inferiores.' },
  { term: 'Flebitis', area: 'Complicaciones', definition: 'Inflamación de una vena, generalmente por irritación mecánica o química. Se manifiesta con dolor, eritema, calor y a veces induración a lo largo del trayecto venoso.', related: ['Tromboflebitis', 'Extravasación', 'Flebotomía'], example: 'Se observó flebitis grado 2 en el sitio de inserción del catéter periférico.' },
  { term: 'Glicemia', area: 'Endocrinología', definition: 'Concentración de glucosa en la sangre. Los valores normales en ayunas son 70–100 mg/dL. Valores alterados indican hipoglucemia o hiperglucemia, que pueden ser emergencias médicas.', related: ['Insulina', 'Diabetes mellitus', 'Cetoacidosis'], example: 'Glicemia capilar postprandial: 185 mg/dL. Se ajusta dosis de insulina.' },
  { term: 'Hipoxia', area: 'Urgencias', definition: 'Reducción del aporte de oxígeno a los tejidos. Puede ser hipoxémica (baja saturación), anémica (escasa hemoglobina), isquémica (reducción del flujo) o histotóxica (imposibilidad de usar O₂ celular).', related: ['Cianosis', 'SpO₂', 'Hipercapnia'], example: 'Hipoxia severa con SpO₂ 82% requirió intubación orotraqueal de emergencia.' },
  { term: 'Isquemia', area: 'Cardiología', definition: 'Disminución del flujo sanguíneo a un tejido, provocando déficit de oxígeno y nutrientes. Si es prolongada puede causar necrosis (infarto). La isquemia miocárdica se manifiesta como angina de pecho.', related: ['Infarto', 'Angina', 'Trombosis'], example: 'El electrocardiograma evidenció isquemia subendocárdica en cara inferior.' },
  { term: 'Leucocitosis', area: 'Hematología', definition: 'Aumento del número de leucocitos en sangre por encima de 11.000/μL. Frecuentemente indica infección bacteriana, inflamación o stress. Puede ser fisiológica (ejercicio, embarazo) o patológica.', related: ['Neutrofilia', 'Infección', 'Hemograma'], example: 'Hemograma revela leucocitosis de 18.000/μL con predominio neutrofílico compatible con infección.' },
  { term: 'Metástasis', area: 'Oncología', definition: 'Diseminación de células cancerosas desde el tumor primario hacia otros órganos o tejidos distantes, a través del sistema linfático o sanguíneo.', related: ['Neoplasia', 'Quimioterapia', 'Biopsia'], example: 'La TC de tórax reveló metástasis pulmonares bilaterales en paciente con cáncer colorrectal.' },
  { term: 'Necrosis', area: 'Fisiopatología', definition: 'Muerte de células o tejidos debido a isquemia, infección, trauma u otras causas patológicas. Implica destrucción celular irreversible y desencadena inflamación local.', related: ['Gangrena', 'Úlcera', 'Isquemia'], example: 'Se observó necrosis tisular en la herida con bordes irregulares y tejido negro.' },
  { term: 'Oliguria', area: 'Renal', definition: 'Producción de orina inferior a 400 mL en 24 horas (o < 0.5 mL/kg/h). Es signo de insuficiencia renal aguda, deshidratación severa o shock. Requiere evaluación urgente.', related: ['Anuria', 'Insuficiencia renal', 'Diuresis'], example: 'Diuresis horaria de 15 mL/h. Se diagnosticó oliguria en contexto de sepsis.' },
  { term: 'Presión venosa central', area: 'Monitorización', definition: 'Medición de la presión en la aurícula derecha o vena cava superior. Refleja la precarga cardíaca. Valores normales: 2–8 mmHg. Se mide mediante catéter venoso central.', related: ['Catéter central', 'Precarga', 'Shock'], example: 'PVC de 2 mmHg sugiere hipovolemia. Se inicia reposición hídrica guiada.' },
  { term: 'Sepsis', area: 'Urgencias', definition: 'Respuesta sistémica disfuncional del organismo a una infección que pone en riesgo la vida. Se caracteriza por fiebre/hipotermia, taquicardia, taquipnea y disfunción orgánica. Emergencia médica.', related: ['Shock séptico', 'SRIS', 'Bacteriemia'], example: 'Criterios de sepsis: fiebre 39°C, FC 120 lpm, FR 24 rpm, lactato 3.2 mmol/L.' },
  { term: 'Taquicardia', area: 'Cardiología', definition: 'Frecuencia cardíaca superior a 100 latidos por minuto en adultos en reposo. Puede ser sinusal (fisiológica) o patológica. Causas incluyen ansiedad, fiebre, anemia, arritmias.', related: ['Bradicardia', 'Fibrilación auricular', 'ECG'], example: 'Taquicardia sinusal FC 118 lpm en paciente con fiebre de 38.8°C.' },
  { term: 'Úlcera por presión', area: 'Cuidados', definition: 'Lesión de la piel y tejidos subyacentes causada por presión prolongada sobre prominencias óseas. Se clasifica en 4 estadios según profundidad. La prevención es prioritaria en pacientes inmovilizados.', related: ['Escaras', 'Movilización', 'Apósitos'], example: 'Úlcera por presión estadio II en región sacra. Se inicia protocolo de cambios posturales cada 2 horas.' },
]

const alphabet = computed(() => {
  const letters = [...new Set(GLOSSARY.map(t => t.term[0].toUpperCase()))].sort()
  return letters
})

const filteredTerms = computed(() => {
  let terms = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term))
  if (activeLetter.value) {
    terms = terms.filter(t => t.term[0].toUpperCase() === activeLetter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    terms = terms.filter(t =>
      t.term.toLowerCase().includes(q) ||
      t.definition.toLowerCase().includes(q) ||
      t.area.toLowerCase().includes(q)
    )
  }
  return terms
})
</script>
