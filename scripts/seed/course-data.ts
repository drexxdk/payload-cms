import { DEMO_PROJECT } from './demo'

export const COURSE_TITLES = {
  onboarding: DEMO_PROJECT.courseTitle,
  shapeStories: 'Shape Stories for the Classroom',
  makerChallenges: 'Middle School Maker Challenges',
  teacherLaunch: 'Teacher Launch Toolkit',
} as const

type ContentKey =
  | 'shape-noticing'
  | 'teacher-confidence-quote'
  | 'story-check-question-1'
  | 'story-check-question-2'
  | 'story-check-assignment'
  | 'shape-wall-image'
  | 'launch-checklist'
  | 'maker-constraint-question'
  | 'maker-reflection-question'
  | 'maker-review-assignment'
  | 'facilitation-tip'
  | 'student-board-image'

type PageDefinition = {
  contentKeys: ContentKey[]
  description?: string[]
  heroScope?: 'course' | 'product' | 'project' | 'projectGroup'
  title: string
}

type ChapterDefinition = {
  description?: string[]
  heroScope?: 'course' | 'product' | 'project' | 'projectGroup'
  pages: PageDefinition[]
  title: string
}

export type CourseSeedDefinition = {
  chapters: ChapterDefinition[]
  courseDescription?: string[]
  heroScope: 'course' | 'product' | 'project'
  productTitles: string[]
  title: string
}

type ContentDefinition =
  | {
      description?: string[]
      key: ContentKey
      paragraphs: string[]
      title: string
      type: 'richText'
    }
  | {
      caption?: string[]
      description?: string[]
      key: ContentKey
      mediaScope: 'course' | 'product' | 'project' | 'projectGroup'
      title: string
      type: 'image'
    }
  | {
      description?: string[]
      key: ContentKey
      questions: ContentKey[]
      title: string
      type: 'assignment'
    }
  | {
      attribution?: string
      description?: string[]
      key: ContentKey
      quote: string
      title: string
      type: 'quote'
    }
  | {
      description?: string[]
      key: ContentKey
      title: string
      type: 'question'
    }

export const COURSE_SEED_DATA: CourseSeedDefinition[] = [
  {
    title: COURSE_TITLES.onboarding,
    heroScope: 'course',
    productTitles: ['Intro to Shapes'],
    courseDescription: [
      'A practical starting course for teachers who need a clear first path through the platform, products, and lesson launch routines.',
      'It mixes orientation, classroom-ready prompts, and reusable reflection activities so staff can move from setup to delivery quickly.',
    ],
    chapters: [
      {
        title: 'Welcome and Roles',
        heroScope: 'course',
        description: [
          'This chapter helps teachers understand what they should prepare before their first student-facing session.',
        ],
        pages: [
          {
            title: 'What teachers should see first',
            description: [
              'Use this page as the opening walkthrough for teachers joining the project for the first time.',
            ],
            contentKeys: ['shape-noticing', 'teacher-confidence-quote'],
          },
          {
            title: 'Access walkthrough',
            description: [
              'Clarify what to review before inviting collaborators and students into the experience.',
            ],
            contentKeys: ['launch-checklist', 'story-check-assignment'],
          },
        ],
      },
      {
        title: 'First classroom launch',
        heroScope: 'product',
        description: [
          'These pages focus on the first live session and the routines that make the delivery feel intentional instead of improvised.',
        ],
        pages: [
          {
            title: 'Launch day checklist',
            contentKeys: ['facilitation-tip', 'shape-wall-image'],
            heroScope: 'product',
          },
          {
            title: 'Reflection prompts',
            contentKeys: ['maker-review-assignment'],
          },
        ],
      },
    ],
  },
  {
    title: COURSE_TITLES.shapeStories,
    heroScope: 'product',
    productTitles: ['Intro to Shapes'],
    courseDescription: [
      'A classroom scenario course for early-years and primary teachers who want to connect literacy moments with visual geometry routines.',
    ],
    chapters: [
      {
        title: 'Reading for geometry',
        heroScope: 'product',
        pages: [
          {
            title: 'Spot shapes while reading',
            contentKeys: ['shape-noticing', 'teacher-confidence-quote'],
          },
          {
            title: 'Turn story moments into questions',
            contentKeys: ['story-check-assignment'],
          },
        ],
      },
      {
        title: 'After-reading practice',
        heroScope: 'projectGroup',
        pages: [
          {
            title: 'Build a shape wall',
            contentKeys: ['shape-wall-image', 'facilitation-tip'],
            heroScope: 'projectGroup',
          },
          {
            title: 'Exit prompts for the class',
            contentKeys: ['story-check-question-1', 'story-check-question-2'],
          },
        ],
      },
    ],
  },
  {
    title: COURSE_TITLES.makerChallenges,
    heroScope: 'product',
    productTitles: ['Middle School Companion', 'Advanced Topics'],
    courseDescription: [
      'A more advanced scenario course focused on framing constraints, guiding group critique, and keeping maker tasks reflective.',
    ],
    chapters: [
      {
        title: 'Frame the challenge',
        heroScope: 'product',
        pages: [
          {
            title: 'Introduce the design brief',
            contentKeys: ['launch-checklist', 'teacher-confidence-quote'],
          },
          {
            title: 'Constraints and success criteria',
            contentKeys: ['maker-constraint-question', 'facilitation-tip'],
          },
        ],
      },
      {
        title: 'Prototype and reflect',
        heroScope: 'course',
        pages: [
          {
            title: 'Document the first prototype',
            contentKeys: ['student-board-image', 'shape-noticing'],
            heroScope: 'course',
          },
          {
            title: 'Team reflection',
            contentKeys: ['maker-review-assignment'],
          },
        ],
      },
    ],
  },
  {
    title: COURSE_TITLES.teacherLaunch,
    heroScope: 'project',
    productTitles: ['Intro to Shapes', 'Advanced Topics'],
    courseDescription: [
      'A teacher-facing planning course that helps coordinators prepare a launch week with shared prompts, expectations, and follow-up loops.',
    ],
    chapters: [
      {
        title: 'Prepare the week',
        heroScope: 'project',
        pages: [
          {
            title: 'Plan your opening sequence',
            contentKeys: ['launch-checklist', 'shape-noticing'],
          },
          {
            title: 'Coordinate materials and timing',
            contentKeys: ['shape-wall-image', 'facilitation-tip'],
          },
        ],
      },
      {
        title: 'Support every learner',
        heroScope: 'course',
        pages: [
          {
            title: 'Adjust prompts and pacing',
            contentKeys: ['teacher-confidence-quote', 'story-check-assignment'],
          },
          {
            title: 'Close with reflection',
            contentKeys: ['maker-reflection-question', 'maker-review-assignment'],
          },
        ],
      },
    ],
  },
]

export const COURSE_CONTENT_SEED_DATA: ContentDefinition[] = [
  {
    key: 'shape-noticing',
    type: 'richText',
    title: 'Notice Shapes in the Room',
    description: [
      'A reusable warm-up that encourages teachers and students to pay attention to geometry already present in their environment.',
    ],
    paragraphs: [
      'Invite learners to pause and look around the room before any direct instruction begins.',
      'Ask them to name three shapes they can find, explain where they spotted them, and compare which features make each shape easy or difficult to identify.',
    ],
  },
  {
    key: 'teacher-confidence-quote',
    type: 'quote',
    title: 'Teacher Confidence Quote',
    description: [
      'Use this quotation to normalize a gradual, reflective launch rather than a perfect first performance.',
    ],
    quote:
      'The first lesson does not need to prove everything. It needs to open the room, establish trust, and give teachers a clear next move.',
    attribution: 'Lead Pedagogy Coach',
  },
  {
    key: 'story-check-question-1',
    type: 'question',
    title: 'Which shape clue mattered most?',
    description: [
      'Ask learners to explain which visual clue in the story or task helped them identify the shape most confidently.',
    ],
  },
  {
    key: 'story-check-question-2',
    type: 'question',
    title: 'Where did confusion appear?',
    description: [
      'Use this question to surface which parts of the prompt, page, or example caused hesitation and why.',
    ],
  },
  {
    key: 'story-check-assignment',
    type: 'assignment',
    title: 'Story Check Reflection',
    description: [
      'A short paired assignment that groups together the first two reflection questions after a reading or prompt sequence.',
    ],
    questions: ['story-check-question-1', 'story-check-question-2'],
  },
  {
    key: 'shape-wall-image',
    type: 'image',
    title: 'Shape Wall Example',
    description: [
      'A shared visual example that teachers can use when introducing a wall or board of collected student observations.',
    ],
    caption: [
      'This image can anchor a discussion about how students document and compare shape findings across the week.',
    ],
    mediaScope: 'projectGroup',
  },
  {
    key: 'launch-checklist',
    type: 'richText',
    title: 'Launch Checklist',
    description: ['A concrete preparation checklist for the first delivery session.'],
    paragraphs: [
      'Confirm the room setup, display materials, and teacher access before learners arrive.',
      'Decide which prompt starts the session, how long the opening observation window lasts, and what evidence you want teachers to collect during the activity.',
    ],
  },
  {
    key: 'maker-constraint-question',
    type: 'question',
    title: 'Which constraint changed your approach?',
    description: [
      'Use this reflection question when learners need to explain how a design limit affected their first decisions.',
    ],
  },
  {
    key: 'maker-reflection-question',
    type: 'question',
    title: 'What would your team revise next?',
    description: [
      'A closing question that keeps reflection focused on the next iteration instead of just judging the current result.',
    ],
  },
  {
    key: 'maker-review-assignment',
    type: 'assignment',
    title: 'Prototype Review Assignment',
    description: [
      'A grouped reflection task used after teams document a first prototype or classroom attempt.',
    ],
    questions: ['maker-constraint-question', 'maker-reflection-question'],
  },
  {
    key: 'facilitation-tip',
    type: 'richText',
    title: 'Facilitation Tip: Slow the Debrief',
    description: [
      'A short facilitation reminder that works across onboarding, story-driven, and maker scenarios.',
    ],
    paragraphs: [
      'Pause longer than feels natural after asking a reflection question.',
      'The extra silence often produces more specific thinking, especially when teachers are still building confidence with observation and critique routines.',
    ],
  },
  {
    key: 'student-board-image',
    type: 'image',
    title: 'Prototype Documentation Board',
    description: [
      'A visual reference for how teams can document early prototypes, trade-offs, and revision notes in one shared place.',
    ],
    caption: [
      'Use this image as a model for documenting first attempts before the class moves into critique and revision.',
    ],
    mediaScope: 'course',
  },
]
