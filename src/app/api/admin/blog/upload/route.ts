import { NextResponse } from 'next/server';
import { storeAdminImage, validateAdminImageFile } from '@/lib/admin-image-upload';
import { requireDashboardAccess } from '@/lib/auth-roles';

/**
 * Uploads one blog image (cover or inline).
 */
export async function POST(request: Request) {
  try {
    const access = await requireDashboardAccess();
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

    const validation = validateAdminImageFile(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const slug = String(formData.get('slug') ?? '').trim() || undefined;
    const url = await storeAdminImage(file, { folder: 'blog', slug });
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha no upload.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
