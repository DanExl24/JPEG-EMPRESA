--
-- PostgreSQL database dump
--

\restrict LfjEKF1wPca2xffxSF1WBKJB27TnljEnjlnTMao8IS6f7PR6YcL4AiMFvDmuk0b

-- Dumped from database version 18.4 (be2730e)
-- Dumped by pg_dump version 18.4

-- Started on 2026-08-10 13:12:57

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3615 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 244 (class 1259 OID 16805)
-- Name: activities; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.activities (
    id integer NOT NULL,
    title text NOT NULL,
    course text NOT NULL,
    phase text NOT NULL,
    template text NOT NULL,
    points integer DEFAULT 10 NOT NULL,
    attempts_limit text DEFAULT 'Ilimitados'::text NOT NULL,
    success_message text DEFAULT '¡Excelente trabajo! Has acertado.'::text NOT NULL,
    hint_message text DEFAULT ''::text NOT NULL,
    sopa_words text,
    crossword1_clue text,
    crossword1_word text,
    quiz_question text,
    quiz_correct text,
    quiz_incorrect text,
    match_term text,
    match_meaning text,
    listening_phrase text,
    pronounce_phrase text,
    has_student_submissions boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    fillblank_answer text,
    fillblank_sentence text,
    learning_outcome_id integer
);


ALTER TABLE public.activities OWNER TO neondb_owner;

--
-- TOC entry 243 (class 1259 OID 16804)
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activities_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3616 (class 0 OID 0)
-- Dependencies: 243
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
-- TOC entry 246 (class 1259 OID 16832)
-- Name: activity_submissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.activity_submissions (
    id integer NOT NULL,
    activity_id integer NOT NULL,
    apprentice_id integer NOT NULL,
    passed boolean DEFAULT false NOT NULL,
    submitted_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    answers text DEFAULT '[]'::text,
    review_status text DEFAULT 'graded'::text NOT NULL
);


ALTER TABLE public.activity_submissions OWNER TO neondb_owner;

--
-- TOC entry 245 (class 1259 OID 16831)
-- Name: activity_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.activity_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_submissions_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3617 (class 0 OID 0)
-- Dependencies: 245
-- Name: activity_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.activity_submissions_id_seq OWNED BY public.activity_submissions.id;


--
-- TOC entry 248 (class 1259 OID 57355)
-- Name: badges; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.badges (
    id integer NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    icon_emoji text DEFAULT '🏆'::text NOT NULL,
    xp_required integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.badges OWNER TO neondb_owner;

--
-- TOC entry 247 (class 1259 OID 57354)
-- Name: badges_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.badges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.badges_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3618 (class 0 OID 0)
-- Dependencies: 247
-- Name: badges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.badges_id_seq OWNED BY public.badges.id;


--
-- TOC entry 234 (class 1259 OID 16740)
-- Name: cohorts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cohorts (
    id integer NOT NULL,
    cohort_number text NOT NULL,
    program_id integer NOT NULL
);


ALTER TABLE public.cohorts OWNER TO neondb_owner;

--
-- TOC entry 233 (class 1259 OID 16739)
-- Name: cohorts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.cohorts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cohorts_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3619 (class 0 OID 0)
-- Dependencies: 233
-- Name: cohorts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.cohorts_id_seq OWNED BY public.cohorts.id;


--
-- TOC entry 236 (class 1259 OID 16752)
-- Name: competencies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.competencies (
    id integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    program_id integer NOT NULL
);


ALTER TABLE public.competencies OWNER TO neondb_owner;

--
-- TOC entry 235 (class 1259 OID 16751)
-- Name: competencies_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.competencies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.competencies_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3620 (class 0 OID 0)
-- Dependencies: 235
-- Name: competencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.competencies_id_seq OWNED BY public.competencies.id;


--
-- TOC entry 254 (class 1259 OID 57403)
-- Name: dialogues; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.dialogues (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    content text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.dialogues OWNER TO neondb_owner;

--
-- TOC entry 253 (class 1259 OID 57402)
-- Name: dialogues_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.dialogues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dialogues_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3621 (class 0 OID 0)
-- Dependencies: 253
-- Name: dialogues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.dialogues_id_seq OWNED BY public.dialogues.id;


--
-- TOC entry 238 (class 1259 OID 16765)
-- Name: enrollments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    apprentice_id integer NOT NULL,
    cohort_id integer NOT NULL,
    status text NOT NULL
);


ALTER TABLE public.enrollments OWNER TO neondb_owner;

--
-- TOC entry 237 (class 1259 OID 16764)
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.enrollments_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3622 (class 0 OID 0)
-- Dependencies: 237
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- TOC entry 242 (class 1259 OID 16791)
-- Name: evaluations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.evaluations (
    id integer NOT NULL,
    assessment_judgment text DEFAULT 'pending'::text NOT NULL,
    apprentice_id integer NOT NULL,
    learning_outcome_id integer NOT NULL,
    updated_by integer
);


ALTER TABLE public.evaluations OWNER TO neondb_owner;

--
-- TOC entry 241 (class 1259 OID 16790)
-- Name: evaluations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.evaluations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evaluations_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3623 (class 0 OID 0)
-- Dependencies: 241
-- Name: evaluations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.evaluations_id_seq OWNED BY public.evaluations.id;


--
-- TOC entry 240 (class 1259 OID 16778)
-- Name: learning_outcomes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.learning_outcomes (
    id integer NOT NULL,
    code text NOT NULL,
    competency_id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.learning_outcomes OWNER TO neondb_owner;

--
-- TOC entry 239 (class 1259 OID 16777)
-- Name: learning_outcomes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.learning_outcomes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learning_outcomes_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3624 (class 0 OID 0)
-- Dependencies: 239
-- Name: learning_outcomes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.learning_outcomes_id_seq OWNED BY public.learning_outcomes.id;


--
-- TOC entry 232 (class 1259 OID 16729)
-- Name: training_programs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.training_programs (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.training_programs OWNER TO neondb_owner;

--
-- TOC entry 231 (class 1259 OID 16728)
-- Name: training_programs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.training_programs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.training_programs_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3625 (class 0 OID 0)
-- Dependencies: 231
-- Name: training_programs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.training_programs_id_seq OWNED BY public.training_programs.id;


--
-- TOC entry 250 (class 1259 OID 57372)
-- Name: user_badges; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_badges (
    id integer NOT NULL,
    user_id integer NOT NULL,
    badge_key text NOT NULL,
    awarded_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_badges OWNER TO neondb_owner;

--
-- TOC entry 249 (class 1259 OID 57371)
-- Name: user_badges_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_badges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_badges_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3626 (class 0 OID 0)
-- Dependencies: 249
-- Name: user_badges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_badges_id_seq OWNED BY public.user_badges.id;


--
-- TOC entry 230 (class 1259 OID 16708)
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    nombre text NOT NULL,
    apellido text NOT NULL,
    cedula text NOT NULL,
    correo text,
    password_hash text NOT NULL,
    rol text DEFAULT 'APRENDIZ'::text NOT NULL,
    failed_attempts integer DEFAULT 0 NOT NULL,
    locked_until timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    xp integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- TOC entry 229 (class 1259 OID 16707)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3627 (class 0 OID 0)
-- Dependencies: 229
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 252 (class 1259 OID 57386)
-- Name: vocabulary; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vocabulary (
    id integer NOT NULL,
    word_en text NOT NULL,
    word_es text NOT NULL,
    category text NOT NULL,
    definition text NOT NULL,
    example text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.vocabulary OWNER TO neondb_owner;

--
-- TOC entry 251 (class 1259 OID 57385)
-- Name: vocabulary_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.vocabulary_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vocabulary_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3628 (class 0 OID 0)
-- Dependencies: 251
-- Name: vocabulary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.vocabulary_id_seq OWNED BY public.vocabulary.id;


--
-- TOC entry 3371 (class 2604 OID 16808)
-- Name: activities id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- TOC entry 3378 (class 2604 OID 16835)
-- Name: activity_submissions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_submissions ALTER COLUMN id SET DEFAULT nextval('public.activity_submissions_id_seq'::regclass);


--
-- TOC entry 3383 (class 2604 OID 57358)
-- Name: badges id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.badges ALTER COLUMN id SET DEFAULT nextval('public.badges_id_seq'::regclass);


--
-- TOC entry 3365 (class 2604 OID 16743)
-- Name: cohorts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cohorts ALTER COLUMN id SET DEFAULT nextval('public.cohorts_id_seq'::regclass);


--
-- TOC entry 3366 (class 2604 OID 16755)
-- Name: competencies id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.competencies ALTER COLUMN id SET DEFAULT nextval('public.competencies_id_seq'::regclass);


--
-- TOC entry 3390 (class 2604 OID 57406)
-- Name: dialogues id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dialogues ALTER COLUMN id SET DEFAULT nextval('public.dialogues_id_seq'::regclass);


--
-- TOC entry 3367 (class 2604 OID 16768)
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- TOC entry 3369 (class 2604 OID 16794)
-- Name: evaluations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.evaluations ALTER COLUMN id SET DEFAULT nextval('public.evaluations_id_seq'::regclass);


--
-- TOC entry 3368 (class 2604 OID 16781)
-- Name: learning_outcomes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.learning_outcomes ALTER COLUMN id SET DEFAULT nextval('public.learning_outcomes_id_seq'::regclass);


--
-- TOC entry 3364 (class 2604 OID 16732)
-- Name: training_programs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_programs ALTER COLUMN id SET DEFAULT nextval('public.training_programs_id_seq'::regclass);


--
-- TOC entry 3386 (class 2604 OID 57375)
-- Name: user_badges id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_badges ALTER COLUMN id SET DEFAULT nextval('public.user_badges_id_seq'::regclass);


--
-- TOC entry 3359 (class 2604 OID 16711)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3388 (class 2604 OID 57389)
-- Name: vocabulary id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vocabulary ALTER COLUMN id SET DEFAULT nextval('public.vocabulary_id_seq'::regclass);


--
-- TOC entry 3599 (class 0 OID 16805)
-- Dependencies: 244
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.activities (id, title, course, phase, template, points, attempts_limit, success_message, hint_message, sopa_words, crossword1_clue, crossword1_word, quiz_question, quiz_correct, quiz_incorrect, match_term, match_meaning, listening_phrase, pronounce_phrase, has_student_submissions, created_at, updated_at, fillblank_answer, fillblank_sentence, learning_outcome_id) FROM stdin;
38	Greetings and Farewells Match	Fundamentos de Enfermería	Preparación	match	10	Ilimitados	¡Excelente trabajo! Has emparejado correctamente.		\N	\N	\N	\N	\N	\N	Good afternoon	Buenas tardes	\N	\N	f	2026-07-27 21:40:58.983	2026-07-27 21:40:58.983	\N	\N	\N
39	Vocabulary Quiz: Personal Info	Fundamentos de Enfermería	Absorción	quiz	10	Ilimitados	¡Correcto!		\N	\N	\N	What is the correct translation of "Last name"?	Apellido	Primer nombre	\N	\N	\N	\N	f	2026-07-27 21:40:59.175	2026-07-27 21:40:59.175	\N	\N	\N
40	Spelling Practice: Medical Assistant	Fundamentos de Enfermería	Práctica	listening	15	Ilimitados	¡Excelente deletreo!		\N	\N	\N	\N	\N	\N	\N	\N	I am a nurse	\N	f	2026-07-27 21:40:59.485	2026-07-27 21:40:59.485	\N	\N	\N
41	RAP 1 Practice Challenge	Fundamentos de Enfermería	Cierre	pronunciation	20	Ilimitados	Pronunciación correcta.		\N	\N	\N	\N	\N	\N	\N	\N	\N	Nice to meet you too	f	2026-07-27 21:40:59.685	2026-07-27 21:40:59.685	\N	\N	\N
42	Caso Clínico: Insuficiencia Cardíaca	Cuidados Críticos UCI	Cierre	quiz	20	Ilimitados	¡Excelente! Has respondido correctamente.		\N	\N	\N	¿Qué mide un esfigmomanómetro?	Presión arterial	Ritmo cardíaco	\N	\N	\N	\N	t	2026-07-27 21:40:59.89	2026-07-27 21:40:59.89	\N	\N	\N
43	Quiz: Farmacología Básica	Farmacología Clínica	Absorción	quiz	15	Ilimitados	¡Excelente trabajo!		\N	\N	\N	¿Qué mide un esfigmomanómetro?	Presión arterial	Ritmo cardíaco	\N	\N	\N	\N	t	2026-07-27 21:41:00.095	2026-07-27 21:41:00.095	\N	\N	\N
44	Simulación: RCP Avanzado	Urgencias y Emergencias	Práctica	pronunciation	25	Ilimitados	¡Excelente! Correcto.		\N	\N	\N	\N	\N	\N	\N	\N	\N	Check the respiratory rate of the patient	f	2026-07-27 21:41:00.275	2026-07-27 21:41:00.275	\N	\N	\N
45	Lectura: Psicología del Paciente	Salud Mental y Psiquiatría	Preparación	match	10	Ilimitados	¡Excelente trabajo!		\N	\N	\N	\N	\N	\N	Intravenous	Administración en vena	\N	\N	f	2026-07-27 21:41:00.396	2026-07-27 21:41:00.396	\N	\N	\N
46	Evaluación: Cuidados Neonatales	Atención Materno-Infantil	Cierre	listening	30	Ilimitados	¡Excelente trabajo!		\N	\N	\N	\N	\N	\N	\N	\N	The patient requires immediate attention	\N	f	2026-07-27 21:41:00.512	2026-07-27 21:41:00.512	\N	\N	\N
\.


--
-- TOC entry 3601 (class 0 OID 16832)
-- Dependencies: 246
-- Data for Name: activity_submissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.activity_submissions (id, activity_id, apprentice_id, passed, submitted_at, answers, review_status) FROM stdin;