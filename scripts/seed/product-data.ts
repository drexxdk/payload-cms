import { COURSE_TITLES } from './course-data'

export const PRODUCTS = [
  {
    title: 'Intro to Shapes',
    isbn: '978-0-123456-47-2',
    productType: 'Preschool',
    courses: [COURSE_TITLES.onboarding, COURSE_TITLES.shapeStories, COURSE_TITLES.teacherLaunch],
  },
  {
    title: 'Advanced Topics',
    isbn: '978-1-234567-89-7',
    productType: 'Upper-level school',
    courses: [COURSE_TITLES.makerChallenges, COURSE_TITLES.teacherLaunch],
  },
  {
    title: 'Middle School Companion',
    isbn: '',
    productType: 'Middle school',
    courses: [COURSE_TITLES.onboarding, COURSE_TITLES.makerChallenges],
  },
] as const
