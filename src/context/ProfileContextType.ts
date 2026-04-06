export interface Profile {
  id: number
  height: number
  weight: number
  age: number
  gender: string
  goal: string
  profileImageUrl?: string
}

export interface ProfileContextType {
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}