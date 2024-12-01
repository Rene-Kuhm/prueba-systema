// lib/types/appwrite.ts
declare module "appwrite" {
    export interface Account {
        updatePreferences(prefs: Record<string, any >, userId: string): Promise<any>
    }    
}

export type User = {
  $id: string
  email: string
  name: string
  role: 'admin' | 'technician'
  approved: boolean
}

export type AuthUser = {
  $id: string
  email: string
  name: string
  role: 'admin' | 'technician'
}

export type AuthSession = {
  $id: string
  userId: string
  provider: string
  providerUid: string
  providerToken: string
  providerRefreshToken: string
  providerAccessToken: string
  providerExpiresAt: number
  ip: string
  userAgent: string
  createdAt: string
  updatedAt: string
}
