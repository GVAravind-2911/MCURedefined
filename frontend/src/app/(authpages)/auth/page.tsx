'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import axios from 'axios'
import Image from 'next/image'
import '@/styles/auth.css'

export default function Auth() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      email: (formData.get('email') as string).trim(),
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      name: isSignUp ? (formData.get('name') as string).trim() : undefined,
    }

    if (isSignUp) {
      if (!data.email || !data.password || !data.name || !data.confirmPassword) {
      setError('All fields are required')
      setIsLoading(false)
      return
      }

      if (data.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
      }

      if (data.password !== data.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
      }

      try {
        console.log(data);
      const response = await axios.post('/api/auth/signup', data)

      if (response.status !== 201) {
        throw new Error(response.data.error || 'Registration failed')
      }
      } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed')
      setIsLoading(false)
      return
      }
    }

    try {
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        throw new Error('Invalid credentials')
      }

      router.push('/')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        <div className="auth-box">
          <Image src="/images/MainLogo.svg" className='mainlogo' alt="Logo" width={100} height={100} />
          <div className="auth-toggle">
            <button 
              className={!isSignUp ? 'active' : ''} 
              onClick={() => setIsSignUp(false)}
              type="button"
            >
              Sign In
            </button>
            <button 
              className={isSignUp ? 'active' : ''} 
              onClick={() => setIsSignUp(true)}
              type="button"
            >
              Sign Up
            </button>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="off"
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
              />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className={isLoading ? 'loading' : ''}
            >
              {isLoading ? (isSignUp ? 'Signing up...' : 'Signing in...') : 
                (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}