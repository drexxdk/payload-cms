import { DEMO_PROJECT } from './demo'

export const PRODUCTS = [
  {
    title: 'Intro to Shapes',
    isbn: '978-0-123456-47-2',
    productType: 'Preschool',
    courses: [DEMO_PROJECT.courseTitle],
  },
  {
    title: 'Advanced Topics',
    isbn: '978-1-234567-89-7',
    productType: 'Upper-level school',
    courses: [],
  },
  {
    title: 'Middle School Companion',
    isbn: '',
    productType: 'Middle school',
    courses: [DEMO_PROJECT.courseTitle],
  },
] as const