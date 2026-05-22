import { NextResponse } from 'next/server';
import { storeEquipmentImage, validateEquipmentImageFile } from '@/lib/equipment-image-upload';
import { requireAdminAccess } from '@/lib/auth-roles';

/**
 * Uploads one equipment image for the admin gallery.
 */
export async function POST(request: Request) {
  const access = await requireAdminAccess();
  if (!access.ok) {
    return NextResponse.json(
      { error: access.status === 401 ? 'Não autenticado' : 'Sem permissão' },
      { status: access.status },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 });
  }

  const validation = validateEquipmentImageFile(file);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const slug = String(formData.get('slug') ?? '').trim() || undefined;

  const url = await storeEquipmentImage(file, slug);
  return NextResponse.json({ url });
}
