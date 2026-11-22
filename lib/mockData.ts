export * from './constants'

import { INDIAN_STATES, INDIAN_CITIES } from './constants'
import type { Property } from '@/types'

// Aliases for backwards compatibility
export const MOCK_STATES = INDIAN_STATES
export const MOCK_CITIES = INDIAN_CITIES
export const MOCK_PROPERTIES: Property[] = []
