'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

// Verifica se o usuário logado é realmente um administrador
async function verifyAdmin() {
  const session = await getSession()
  if (!session) return null

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user || user.role !== 'ADMIN') return null

  return user
}

export async function getUsers() {
  const admin = await verifyAdmin()
  if (!admin) throw new Error('Acesso negado: apenas administradores.')

  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: { excuses: true }
      }
    }
  })
}

export async function updateUser(userId: string, data: { name?: string; email?: string; role?: string }) {
  const admin = await verifyAdmin()
  if (!admin) return { error: 'Acesso negado: apenas administradores.' }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.role !== undefined && { role: data.role }),
      }
    })
    revalidatePath('/admin')
    return { success: true, user: updatedUser }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('Unique constraint failed')) {
      return { error: 'Este e-mail já está sendo usado por outro usuário.' }
    }
    return { error: 'Erro ao atualizar o usuário.' }
  }
}

export async function deleteUser(userId: string) {
  const admin = await verifyAdmin()
  if (!admin) return { error: 'Acesso negado: apenas administradores.' }

  if (userId === admin.id) {
    return { error: 'Você não pode excluir a si mesmo.' }
  }

  try {
    // Primeiro deleta as desculpas do usuário (cascade manual)
    await prisma.excuse.deleteMany({ where: { userId } })
    // Depois deleta o usuário
    await prisma.user.delete({ where: { id: userId } })
    
    revalidatePath('/admin')
    return { success: true }
  } catch {
    return { error: 'Erro ao excluir o usuário.' }
  }
}
