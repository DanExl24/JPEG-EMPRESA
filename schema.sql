--
-- PostgreSQL database dump
--

\restrict fmxNOhWUMNQCfItn71T87VXbuUW1xs0WEucFqw6e2uFAugJMrsAZnUyvU7gYGfX

-- Dumped from database version 18.4 (be2730e)
-- Dumped by pg_dump version 18.4

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
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA neon_auth;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" uuid NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp with time zone,
    "refreshTokenExpiresAt" timestamp with time zone,
    scope text,
    password text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: invitation; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.invitation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    email text NOT NULL,
    role text,
    status text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "inviterId" uuid NOT NULL
);


--
-- Name: jwks; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.jwks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "publicKey" text NOT NULL,
    "privateKey" text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "expiresAt" timestamp with time zone
);


--
-- Name: member; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.member (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


--
-- Name: organization; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.organization (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    "createdAt" timestamp with time zone NOT NULL,
    metadata text
);


--
-- Name: project_config; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.project_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    endpoint_id text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    trusted_origins jsonb NOT NULL,
    social_providers jsonb NOT NULL,
    email_provider jsonb,
    email_and_password jsonb,
    allow_localhost boolean NOT NULL,
    plugin_configs jsonb,
    webhook_config jsonb
);


--
-- Name: session; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.session (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" uuid NOT NULL,
    "impersonatedBy" text,
    "activeOrganizationId" text
);


--
-- Name: user; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role text,
    banned boolean,
    "banReason" text,
    "banExpires" timestamp with time zone
);


--
-- Name: verification; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.verification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: activities; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
-- Name: activity_submissions; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: activity_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_submissions_id_seq OWNED BY public.activity_submissions.id;


--
-- Name: badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.badges (
    id integer NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    icon_emoji text DEFAULT '🏆'::text NOT NULL,
    xp_required integer DEFAULT 0 NOT NULL
);


--
-- Name: badges_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.badges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: badges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.badges_id_seq OWNED BY public.badges.id;


--
-- Name: cohorts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cohorts (
    id integer NOT NULL,
    cohort_number text NOT NULL,
    program_id integer NOT NULL
);


--
-- Name: cohorts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cohorts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cohorts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cohorts_id_seq OWNED BY public.cohorts.id;


--
-- Name: competencies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.competencies (
    id integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    program_id integer NOT NULL
);


--
-- Name: competencies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.competencies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: competencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.competencies_id_seq OWNED BY public.competencies.id;


--
-- Name: dialogues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dialogues (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    content text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: dialogues_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dialogues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dialogues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dialogues_id_seq OWNED BY public.dialogues.id;


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    apprentice_id integer NOT NULL,
    cohort_id integer NOT NULL,
    status text NOT NULL
);


--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- Name: evaluations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evaluations (
    id integer NOT NULL,
    assessment_judgment text DEFAULT 'pending'::text NOT NULL,
    apprentice_id integer NOT NULL,
    learning_outcome_id integer NOT NULL,
    updated_by integer
);


--
-- Name: evaluations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.evaluations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: evaluations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.evaluations_id_seq OWNED BY public.evaluations.id;


--
-- Name: learning_outcomes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_outcomes (
    id integer NOT NULL,
    code text NOT NULL,
    competency_id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: learning_outcomes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.learning_outcomes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: learning_outcomes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.learning_outcomes_id_seq OWNED BY public.learning_outcomes.id;


--
-- Name: training_programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_programs (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: training_programs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.training_programs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: training_programs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.training_programs_id_seq OWNED BY public.training_programs.id;


--
-- Name: user_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_badges (
    id integer NOT NULL,
    user_id integer NOT NULL,
    badge_key text NOT NULL,
    awarded_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_badges_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_badges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_badges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_badges_id_seq OWNED BY public.user_badges.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vocabulary; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: vocabulary_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vocabulary_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vocabulary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vocabulary_id_seq OWNED BY public.vocabulary.id;


--
-- Name: activities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- Name: activity_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_submissions ALTER COLUMN id SET DEFAULT nextval('public.activity_submissions_id_seq'::regclass);


--
-- Name: badges id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges ALTER COLUMN id SET DEFAULT nextval('public.badges_id_seq'::regclass);


--
-- Name: cohorts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cohorts ALTER COLUMN id SET DEFAULT nextval('public.cohorts_id_seq'::regclass);


--
-- Name: competencies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competencies ALTER COLUMN id SET DEFAULT nextval('public.competencies_id_seq'::regclass);


--
-- Name: dialogues id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dialogues ALTER COLUMN id SET DEFAULT nextval('public.dialogues_id_seq'::regclass);


--
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- Name: evaluations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluations ALTER COLUMN id SET DEFAULT nextval('public.evaluations_id_seq'::regclass);


--
-- Name: learning_outcomes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_outcomes ALTER COLUMN id SET DEFAULT nextval('public.learning_outcomes_id_seq'::regclass);


--
-- Name: training_programs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_programs ALTER COLUMN id SET DEFAULT nextval('public.training_programs_id_seq'::regclass);


--
-- Name: user_badges id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges ALTER COLUMN id SET DEFAULT nextval('public.user_badges_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vocabulary id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary ALTER COLUMN id SET DEFAULT nextval('public.vocabulary_id_seq'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invitation; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.invitation (id, "organizationId", email, role, status, "expiresAt", "createdAt", "inviterId") FROM stdin;
\.


--
-- Data for Name: jwks; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.jwks (id, "publicKey", "privateKey", "createdAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: member; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.member (id, "organizationId", "userId", role, "createdAt") FROM stdin;
\.


--
-- Data for Name: organization; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.organization (id, name, slug, logo, "createdAt", metadata) FROM stdin;
\.


--
-- Data for Name: project_config; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.project_config (id, name, endpoint_id, created_at, updated_at, trusted_origins, social_providers, email_provider, email_and_password, allow_localhost, plugin_configs, webhook_config) FROM stdin;
048a8b7d-4202-414d-b65f-71fc1f989be6	SENA ADSO	ep-misty-river-ahzjwssa	2026-06-22 20:56:42.569+00	2026-06-22 20:56:42.569+00	[]	[{"id": "google", "isShared": true}]	{"type": "shared"}	{"enabled": true, "disableSignUp": false, "emailVerificationMethod": "otp", "requireEmailVerification": false, "autoSignInAfterVerification": true, "sendVerificationEmailOnSignIn": false, "sendVerificationEmailOnSignUp": false}	t	{"magicLink": {"config": {"expiresIn": 5, "disableSignUp": false}, "enabled": false}, "phoneNumber": {"config": {"otp_expires_in": 300}, "enabled": false}, "organization": {"config": {"creatorRole": "owner", "membershipLimit": 100, "organizationLimit": 10, "sendInvitationEmail": false}, "enabled": true}}	{"enabled": false, "enabledEvents": [], "timeoutSeconds": 5}
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.session (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId", "impersonatedBy", "activeOrganizationId") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth."user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role, banned, "banReason", "banExpires") FROM stdin;
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: activity_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_submissions (id, activity_id, apprentice_id, passed, submitted_at, answers, review_status) FROM stdin;
\.


--
-- Data for Name: badges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.badges (id, key, name, description, icon_emoji, xp_required) FROM stdin;
\.


--
-- Data for Name: cohorts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cohorts (id, cohort_number, program_id) FROM stdin;
\.


--
-- Data for Name: competencies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.competencies (id, code, name, program_id) FROM stdin;
1	COMP-230101	Asistencia en Procedimientos Clínicos y Hospitalarios	1
\.


--
-- Data for Name: dialogues; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dialogues (id, title, description, content, created_at, updated_at) FROM stdin;
1	Control de Signos Vitales	Conversación estándar entre enfermera y paciente al inicio del turno de control de signos vitales.	[{"speaker":"Nurse","textEn":"Hello, I am here to check your blood pressure and heart rate.","textEs":"Hola, estoy aquí para revisar su presión arterial y frecuencia cardíaca."},{"speaker":"Patient","textEn":"Okay, nurse. My arm is ready.","textEs":"Está bien, enfermera. Mi brazo está listo."},{"speaker":"Nurse","textEn":"Excellent. Your blood pressure is 120/80, which is perfectly normal.","textEs":"Excelente. Su presión arterial es 120/80, lo cual es perfectamente normal."}]	2026-07-27 21:41:02.323	2026-07-27 21:41:02.323
2	SALUDO		[{"speaker":"Nurse","textEn":"HELLO","textEs":"HOLA"}]	2026-07-27 21:43:13.861	2026-07-27 21:43:13.861
3	Conversation example	This is a English conversation	[{"speaker":"Nurse","textEn":"Hi","textEs":"Hola"}]	2026-07-27 22:11:19.474	2026-07-27 22:11:19.474
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.enrollments (id, apprentice_id, cohort_id, status) FROM stdin;
\.


--
-- Data for Name: evaluations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.evaluations (id, assessment_judgment, apprentice_id, learning_outcome_id, updated_by) FROM stdin;
\.


--
-- Data for Name: learning_outcomes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.learning_outcomes (id, code, competency_id, name) FROM stdin;
1	RAP-01	1	Administrar medicamentos y tratamientos básicos según prescripción médica.
2	RAP-02	1	Monitorear y registrar signos vitales del paciente de acuerdo a protocolos clínicos.
\.


--
-- Data for Name: training_programs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.training_programs (id, name) FROM stdin;
1	Programa de Formación en Enfermería
\.


--
-- Data for Name: user_badges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_badges (id, user_id, badge_key, awarded_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, nombre, apellido, cedula, correo, password_hash, rol, failed_attempts, locked_until, created_at, updated_at, xp) FROM stdin;
3	Laura	Gomez	1234567890	\N	d365a8b38216e2d4147f60b7d12472e7:0a2b424fe59064d5018305c338a6c017845d6dee432f83efe53a59d95de0028e32e7035f73aaf8a3a6706090e000366da2b8d50c0289974af1747408d38078ed	APRENDIZ	0	\N	2026-06-22 21:02:30.468	2026-07-09 22:37:00.461	0
2	Instructor	de Prueba	INST001	instructor@nursingacademy.local	a790a1aabb5fd6445a1a57025541ac04:d1d0d99d1e21aae4684a80880b35939e290f0f1753637a87e2f5830a0b6ed3eaee8d2473bfc7665c46641b3b86d2fe23e1df9a34664334ef1e9269205352d35f	INSTRUCTOR	0	\N	2026-06-22 21:02:30.12	2026-07-27 21:42:13.38	0
1	Administrador	General	ADMIN001	admin@nursingacademy.local	ad9f46cea75f9855c8a9b74fb66147f5:2bc0cb59501299e777b4e6f64274ed63c9fe28c3c3942258609afc09ba39d0e315f23c1cc9533864f4b496145d9dfd6ec19d6102d8f5a5d81662a190e592e7cc	ADMIN	0	\N	2026-06-22 21:02:29.779	2026-07-09 19:55:41.065	0
\.


--
-- Data for Name: vocabulary; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vocabulary (id, word_en, word_es, category, definition, example, created_at, updated_at) FROM stdin;
1	Blood pressure	Presión arterial	Signos Vitales	Fuerza ejercida por la sangre contra las paredes de los vasos sanguíneos.	The patient's blood pressure is 120/80 mmHg.	2026-07-27 21:41:01.635	2026-07-27 21:41:01.635
2	Heart rate	Frecuencia cardíaca	Signos Vitales	Número de latidos del corazón por minuto.	Normal heart rate ranges from 60 to 100 bpm.	2026-07-27 21:41:01.635	2026-07-27 21:41:01.635
3	Stethoscope	Estetoscopio	Equipos	Instrumento para auscultar sonidos del corazón y pulmones.	Use the stethoscope to listen to heart sounds.	2026-07-27 21:41:01.635	2026-07-27 21:41:01.635
4	Intravenous line	Vía intravenosa	Procedimientos	Acceso directo al torrente sanguíneo a través de una vena.	Insert an IV line before administering medication.	2026-07-27 21:41:01.635	2026-07-27 21:41:01.635
\.


--
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activities_id_seq', 46, true);


--
-- Name: activity_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_submissions_id_seq', 5, true);


--
-- Name: badges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.badges_id_seq', 1, false);


--
-- Name: cohorts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cohorts_id_seq', 1, false);


--
-- Name: competencies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.competencies_id_seq', 1, true);


--
-- Name: dialogues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.dialogues_id_seq', 3, true);


--
-- Name: enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.enrollments_id_seq', 1, false);


--
-- Name: evaluations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.evaluations_id_seq', 1, false);


--
-- Name: learning_outcomes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.learning_outcomes_id_seq', 2, true);


--
-- Name: training_programs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.training_programs_id_seq', 1, true);


--
-- Name: user_badges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_badges_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: vocabulary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vocabulary_id_seq', 4, true);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: invitation invitation_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT invitation_pkey PRIMARY KEY (id);


--
-- Name: jwks jwks_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.jwks
    ADD CONSTRAINT jwks_pkey PRIMARY KEY (id);


--
-- Name: member member_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: organization organization_slug_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_slug_key UNIQUE (slug);


--
-- Name: project_config project_config_endpoint_id_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_endpoint_id_key UNIQUE (endpoint_id);


--
-- Name: project_config project_config_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: activity_submissions activity_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_submissions
    ADD CONSTRAINT activity_submissions_pkey PRIMARY KEY (id);


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- Name: cohorts cohorts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cohorts
    ADD CONSTRAINT cohorts_pkey PRIMARY KEY (id);


--
-- Name: competencies competencies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competencies
    ADD CONSTRAINT competencies_pkey PRIMARY KEY (id);


--
-- Name: dialogues dialogues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dialogues
    ADD CONSTRAINT dialogues_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: evaluations evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_pkey PRIMARY KEY (id);


--
-- Name: learning_outcomes learning_outcomes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_outcomes
    ADD CONSTRAINT learning_outcomes_pkey PRIMARY KEY (id);


--
-- Name: training_programs training_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_programs
    ADD CONSTRAINT training_programs_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vocabulary vocabulary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary
    ADD CONSTRAINT vocabulary_pkey PRIMARY KEY (id);


--
-- Name: account_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "account_userId_idx" ON neon_auth.account USING btree ("userId");


--
-- Name: invitation_email_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX invitation_email_idx ON neon_auth.invitation USING btree (email);


--
-- Name: invitation_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "invitation_organizationId_idx" ON neon_auth.invitation USING btree ("organizationId");


--
-- Name: member_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "member_organizationId_idx" ON neon_auth.member USING btree ("organizationId");


--
-- Name: member_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "member_userId_idx" ON neon_auth.member USING btree ("userId");


--
-- Name: organization_slug_uidx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE UNIQUE INDEX organization_slug_uidx ON neon_auth.organization USING btree (slug);


--
-- Name: session_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "session_userId_idx" ON neon_auth.session USING btree ("userId");


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX verification_identifier_idx ON neon_auth.verification USING btree (identifier);


--
-- Name: activity_submissions_activity_id_apprentice_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX activity_submissions_activity_id_apprentice_id_key ON public.activity_submissions USING btree (activity_id, apprentice_id);


--
-- Name: badges_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX badges_key_key ON public.badges USING btree (key);


--
-- Name: cohorts_cohort_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX cohorts_cohort_number_key ON public.cohorts USING btree (cohort_number);


--
-- Name: competencies_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX competencies_code_key ON public.competencies USING btree (code);


--
-- Name: user_badges_user_id_badge_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_badges_user_id_badge_key_key ON public.user_badges USING btree (user_id, badge_key);


--
-- Name: users_cedula_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_cedula_key ON public.users USING btree (cedula);


--
-- Name: users_correo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_correo_key ON public.users USING btree (correo);


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_inviterId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: activities activities_learning_outcome_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_learning_outcome_id_fkey FOREIGN KEY (learning_outcome_id) REFERENCES public.learning_outcomes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: activity_submissions activity_submissions_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_submissions
    ADD CONSTRAINT activity_submissions_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cohorts cohorts_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cohorts
    ADD CONSTRAINT cohorts_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.training_programs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: competencies competencies_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competencies
    ADD CONSTRAINT competencies_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.training_programs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: enrollments enrollments_apprentice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_apprentice_id_fkey FOREIGN KEY (apprentice_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: enrollments enrollments_cohort_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES public.cohorts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: evaluations evaluations_apprentice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_apprentice_id_fkey FOREIGN KEY (apprentice_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: evaluations evaluations_learning_outcome_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_learning_outcome_id_fkey FOREIGN KEY (learning_outcome_id) REFERENCES public.learning_outcomes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: evaluations evaluations_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: learning_outcomes learning_outcomes_competency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_outcomes
    ADD CONSTRAINT learning_outcomes_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competencies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_badges user_badges_badge_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_badge_key_fkey FOREIGN KEY (badge_key) REFERENCES public.badges(key) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_badges user_badges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict fmxNOhWUMNQCfItn71T87VXbuUW1xs0WEucFqw6e2uFAugJMrsAZnUyvU7gYGfX

