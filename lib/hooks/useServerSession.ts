import { useState, useCallback } from 'react'

export function useServerSession() {
  const [isCreating, setIsCreating] = useState(false)
  const [sessionSignerId, setSessionSignerId] = useState<string | null>(null)

  const createSessionSigner = useCallback(async (userId: string, chainId: number = 11155111) => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/privy/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, chainId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create session signer')
      }

      const data = await response.json()
      setSessionSignerId(data.sessionSignerId)
      return data.sessionSignerId
    } catch (error) {
      console.error('Error creating session signer:', error)
      throw error
    } finally {
      setIsCreating(false)
    }
  }, [])

  const getSessionSigner = useCallback(async (sessionSignerId: string) => {
    try {
      const response = await fetch(`/api/privy/session?sessionSignerId=${sessionSignerId}`)
      
      if (!response.ok) {
        throw new Error('Failed to get session signer')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting session signer:', error)
      throw error
    }
  }, [])

  return {
    isCreating,
    sessionSignerId,
    createSessionSigner,
    getSessionSigner,
  }
}
