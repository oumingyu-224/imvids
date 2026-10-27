import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { deletePrompt, findPrompt } from '@/shared/models/prompt';
import { getUserInfo } from '@/shared/models/user';

export default async function PromptDeletePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.CATEGORIES_WRITE,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const user = await getUserInfo();
  if (!user) {
    redirect('/sign-in');
  }

  const promptData = await findPrompt({ id });
  if (!promptData || promptData.userId !== user.id) {
    redirect('/admin/prompts');
  }

  async function handleDelete() {
    'use server';

    await requirePermission({ code: PERMISSIONS.CATEGORIES_WRITE });

    await deletePrompt(id);
    redirect('/admin/prompts');
  }

  return (
    <form action={handleDelete}>
      <button type="submit">Confirm delete</button>
    </form>
  );
}
