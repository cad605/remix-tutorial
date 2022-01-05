import bcrypt from 'bcrypt'
import {createCookieSessionStorage, redirect} from 'remix'
import {db} from './db.server'

type LoginForm = {
  username: string
  password: string
}
export async function register({username, password}: LoginForm) {
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await db.user.create({
    data: {
      username,
      passwordHash,
    },
  })
  return user
}

export async function login({username, password}: LoginForm) {
  const user = await db.user.findUnique({
    where: {username},
  })

  if (!user) return null

  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash)

  if (!isCorrectPassword) return null

  return user
}

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error('Must set environment variable session secret!')
}

const storage = createCookieSessionStorage({
  cookie: {
    name: 'RJ_session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
})

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession()
  session.set('userId', userId)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'))
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request)
  const userId = session.get('userId')
  if (!userId || typeof userId !== 'string') return null
  return userId
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await getUserId(request)
  if (userId === null) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
    throw redirect(`/login?${searchParams}`)
  }
  return userId
}

export async function logout(request: Request) {
  const session = await getUserSession(request)
  return redirect(`/jokes`, {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}

export async function getUser(request: Request) {
  const userId = await getUserId(request)
  if (!userId || typeof userId !== 'string') return null
  try {
    const user = db.user.findUnique({where: {id: userId}})
    return user
  } catch {
    throw logout(request)
  }
}
