import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/server/staff-auth'

const ARTICLE_FIELDS = ['id', 'title', 'cat', 'excerpt', 'date', 'read', 'readTime', 'color', 'body', 'image', 'author'] as const

function articlePayload(input: Record<string, unknown>) {
  return Object.fromEntries(ARTICLE_FIELDS.filter(key => key in input).map(key => [key, input[key]]))
}

export async function GET(request: NextRequest) {
  const auth = await requireStaff(request, ['admin'])
  if ('error' in auth) return auth.error
  const { data, error } = await auth.admin.from('articles').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Articles could not be loaded.' }, { status: 500 })
  return NextResponse.json({ articles: data || [] })
}

export async function POST(request: NextRequest) {
  const auth = await requireStaff(request, ['admin'])
  if ('error' in auth) return auth.error
  const payload = articlePayload(await request.json())
  if (!String(payload.title || '').trim() || !String(payload.excerpt || '').trim()) {
    return NextResponse.json({ error: 'Title and excerpt are required.' }, { status: 400 })
  }
  const { data, error } = await auth.admin.from('articles').insert(payload).select().single()
  if (error) return NextResponse.json({ error: 'Article could not be published.' }, { status: 500 })
  return NextResponse.json({ article: data }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireStaff(request, ['admin'])
  if ('error' in auth) return auth.error
  const input = await request.json()
  const id = String(input.id || '')
  if (!id) return NextResponse.json({ error: 'Article id is required.' }, { status: 400 })
  const payload = articlePayload(input)
  delete payload.id
  const { data, error } = await auth.admin.from('articles').update(payload).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: 'Article could not be updated.' }, { status: 500 })
  return NextResponse.json({ article: data })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireStaff(request, ['admin'])
  if ('error' in auth) return auth.error
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Article id is required.' }, { status: 400 })
  const { error } = await auth.admin.from('articles').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Article could not be deleted.' }, { status: 500 })
  return NextResponse.json({ success: true })
}
