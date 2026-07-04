import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { requireStaff } from '@/lib/server/staff-auth'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

function hasValidSignature(type: string, bytes: Uint8Array) {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (type === 'image/png') return bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index])
  if (type === 'image/webp') {
    return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
      && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  }
  return false
}

export async function POST(request: Request) {
  const auth = await requireStaff(['admin'])
  if ('error' in auth) return auth.error

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image to upload.' }, { status: 400 })
  if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: 'Only JPG, PNG, and WebP images are allowed.' }, { status: 400 })
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'Image must be 5 MB or smaller.' }, { status: 400 })

  const path = `covers/${new Date().getUTCFullYear()}/${randomUUID()}.${EXTENSIONS[file.type]}`
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  if (!hasValidSignature(file.type, bytes)) return NextResponse.json({ error: 'The selected file is not a valid image.' }, { status: 400 })
  const { error } = await auth.admin.storage.from('article-covers').upload(path, buffer, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) {
    console.error('[article cover upload]', error.message)
    return NextResponse.json({ error: 'Image upload failed. Check that the article-covers bucket migration is applied.' }, { status: 500 })
  }

  const { data } = auth.admin.storage.from('article-covers').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
