import { z } from 'zod'
import axios from './axios'

const AuthTokenSchema = z.object({
  accessToken: z.string(),
})

const TOKEN_KEY = 'auth_token'

export const getAuthToken = async (): Promise<string> => {
  const storedToken = sessionStorage.getItem(TOKEN_KEY)
  if (storedToken) {
    return storedToken
  }

  const response = await axios.post('/auth/anon')
  const validatedToken = AuthTokenSchema.parse(response.data)
  sessionStorage.setItem(TOKEN_KEY, validatedToken.accessToken)
  return validatedToken.accessToken
}

export const getStoredToken = (): string | null => {
  return sessionStorage.getItem(TOKEN_KEY)
} 