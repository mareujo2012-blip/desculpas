'use server'

import { prisma } from '@/lib/prisma'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

export async function register(_prevState: unknown, formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (existingUser) {
    return { error: 'E-mail já está em uso.' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { name: name || null, email, password: hashedPassword },
  })

  await createSession(user.id)
  redirect('/gerador')
}

export async function login(_prevState: unknown, formData: FormData) {
  const identifier = formData.get('identifier') as string
  const password = formData.get('password') as string

  if (!identifier || !password) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }

  let user = await prisma.user.findUnique({ where: { email: identifier } })

  // Inicialização do Super Admin "mdaros" no primeiro login
  if (!user && identifier === 'mdaros') {
    const hashedPassword = await bcrypt.hash(password, 10)
    user = await prisma.user.create({
      data: { 
        name: 'Administrador', 
        email: 'mdaros', 
        password: hashedPassword, 
        role: 'ADMIN' 
      },
    })
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: 'Credenciais incorretas.' }
  }

  // Garante que mdaros sempre tenha role ADMIN caso tenha perdido
  if (user.email === 'mdaros' && user.role !== 'ADMIN') {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    })
  }

  await createSession(user.id)
  
  if (user.role === 'ADMIN') {
    redirect('/admin')
  }

  redirect('/gerador')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
