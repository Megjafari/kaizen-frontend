import { createContext } from 'react'
import type { ProfileContextType } from './ProfileContextType'

export const ProfileContext = createContext<ProfileContextType | null>(null)