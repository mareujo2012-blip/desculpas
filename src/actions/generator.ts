'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

const excuseSchema = z.object({
  situation: z.string()
    .min(5, 'A situação deve ter no mínimo 5 caracteres.')
    .max(300, 'A situação deve ter no máximo 300 caracteres.'),
})

export async function generateExcuse(_prevState: unknown, formData: FormData) {
  const session = await getSession()
  if (!session) return { error: 'Usuário não autenticado.' }

  const situationRaw = formData.get('situation')

  const parsedSituation = excuseSchema.safeParse({ situation: situationRaw })
  if (!parsedSituation.success) {
    return { error: parsedSituation.error.issues?.[0]?.message || 'Entrada inválida.' }
  }
  const situation = parsedSituation.data.situation

  if (!process.env.OPENAI_API_KEY) {
    return { error: 'A chave da API da OpenAI não está configurada. Adicione OPENAI_API_KEY no arquivo .env' }
  }

  // Rate Limiting: Máximo de 10 desculpas por hora por usuário
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const excusesLastHour = await prisma.excuse.count({
    where: {
      userId: session.userId,
      createdAt: {
        gte: oneHourAgo,
      },
    },
  })

  if (excusesLastHour >= 10) {
    return { error: 'Você atingiu o limite de 10 desculpas por hora. Volte mais tarde!' }
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em criar desculpas criativas, engraçadas e convincentes em português brasileiro.
Sua missão é gerar UMA desculpa plausível e bem elaborada para a situação informada pelo usuário.
A desculpa deve:
- Ser escrita na primeira pessoa
- Soar realista e crível
- Ter entre 2 e 4 frases
- Ser um pouco dramática mas não absurda demais
- Usar detalhes específicos para parecer mais verdadeira
Responda APENAS com a desculpa, sem aspas, sem introduções ou explicações adicionais.`,
        },
        {
          role: 'user',
          content: `Crie uma desculpa para a seguinte situação: ${situation}`,
        },
      ],
      temperature: 0.9,
      max_tokens: 250,
    })

    const excuseText = completion.choices[0]?.message?.content?.trim()

    if (!excuseText) {
      return { error: 'A OpenAI não conseguiu gerar uma desculpa. Tente novamente.' }
    }

    const newExcuse = await prisma.excuse.create({
      data: { situation, excuseText, userId: session.userId },
    })

    revalidatePath('/gerador')
    return { success: true, excuse: newExcuse }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('401') || message.includes('Incorrect API key')) {
      return { error: 'Chave da OpenAI inválida. Verifique o valor de OPENAI_API_KEY no .env' }
    }
    if (message.includes('429')) {
      return { error: 'Limite de requisições da OpenAI atingido. Aguarde alguns instantes.' }
    }
    return { error: 'Erro ao conectar com a OpenAI. Verifique sua chave e conexão.' }
  }
}

export async function getExcuseHistory() {
  const session = await getSession()
  if (!session) return []

  return prisma.excuse.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function deleteExcuse(_prevState: unknown, formData: FormData) {
  const session = await getSession()
  if (!session) return { error: 'Não autorizado.' }

  const excuseId = formData.get('excuseId') as string
  if (!excuseId) return { error: 'ID da desculpa não informado.' }

  const excuse = await prisma.excuse.findUnique({ where: { id: excuseId } })
  if (!excuse || excuse.userId !== session.userId) {
    return { error: 'Desculpa não encontrada ou sem permissão.' }
  }

  await prisma.excuse.delete({ where: { id: excuseId } })
  revalidatePath('/gerador')
  return { success: true }
}
