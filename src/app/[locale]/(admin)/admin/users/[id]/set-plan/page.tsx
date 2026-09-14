import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Empty } from '@/shared/blocks/common';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { FormCard } from '@/shared/blocks/form';
import { getSnowId, getUuid } from '@/shared/lib/hash';
import {
  calculateCreditExpirationTime,
  createCredit,
  CreditStatus,
  CreditTransactionScene,
  CreditTransactionType,
} from '@/shared/models/credit';
import {
  createSubscription,
  NewSubscription,
  SubscriptionStatus,
} from '@/shared/models/subscription';
import { findUserById } from '@/shared/models/user';
import { Crumb } from '@/shared/types/blocks/common';
import { Form } from '@/shared/types/blocks/form';

export default async function UserSetPlanPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  // Check if user has permission to edit users
  await requirePermission({
    code: PERMISSIONS.USERS_WRITE,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const user = await findUserById(id);
  if (!user) {
    return <Empty message="User not found" />;
  }

  const t = await getTranslations('admin.users');

  // load pricing items from locale messages
  const pt = await getTranslations({
    locale: locale,
    namespace: 'pages.pricing',
  });
  const pricingConfig = pt.raw('pricing');
  const pricingItems: any[] = pricingConfig.items || [];

  const planOptions = pricingItems.map((item: any) => ({
    title: `${item.product_name} (${item.price || item.amount})`,
    value: item.product_id,
  }));

  const crumbs: Crumb[] = [
    { title: t('set_plan.crumbs.admin'), url: '/admin' },
    { title: t('set_plan.crumbs.users'), url: '/admin/users' },
    { title: t('set_plan.crumbs.set_plan'), is_active: true },
  ];

  const form: Form = {
    fields: [
      {
        name: 'name',
        type: 'text',
        title: t('fields.name'),
        validation: { required: true },
        attributes: { disabled: true },
      },
      {
        name: 'email',
        type: 'text',
        title: t('fields.email'),
        validation: { required: true },
        attributes: { disabled: true },
      },
      {
        name: 'plan',
        type: 'select',
        title: t('set_plan.fields.plan'),
        options: planOptions,
        validation: { required: true },
      },
      {
        name: 'description',
        type: 'textarea',
        title: t('set_plan.fields.description'),
        placeholder: t('set_plan.fields.description_placeholder'),
      },
    ],
    passby: {
      user,
      pricingItems,
    },
    data: user,
    submit: {
      button: {
        title: t('set_plan.buttons.submit'),
      },
      handler: async (data, passby) => {
        'use server';

        const { user, pricingItems } = passby;

        if (!user) {
          throw new Error('no auth');
        }

        const productId = data.get('plan') as string;
        const description = data.get('description') as string;

        const pricingItem = (pricingItems as any[]).find(
          (item) => item.product_id === productId
        );
        if (!pricingItem) {
          throw new Error('pricing item not found');
        }

        const currentTime = new Date();
        const creditsValidDays = parseInt(pricingItem.valid_days) || 0;
        const credits = parseInt(pricingItem.credits) || 0;

        const currentPeriodEnd = creditsValidDays
          ? new Date(currentTime.getTime() + creditsValidDays * 86400 * 1000)
          : null;

        // create subscription
        const subscriptionNo = getSnowId();
        const newSubscription: NewSubscription = {
          id: getUuid(),
          subscriptionNo: subscriptionNo,
          subscriptionId: subscriptionNo,
          userId: user.id,
          userEmail: user.email,
          status: SubscriptionStatus.ACTIVE,
          paymentProvider: 'manual',
          productId: pricingItem.product_id,
          description: description || 'Subscription Created (manual)',
          amount: pricingItem.amount,
          currency: pricingItem.currency,
          interval: pricingItem.interval,
          intervalCount: 1,
          currentPeriodStart: currentTime,
          currentPeriodEnd: currentPeriodEnd,
          planName: pricingItem.plan_name || pricingItem.product_name,
          productName: pricingItem.product_name,
          creditsAmount: credits,
          creditsValidDays: creditsValidDays,
        };

        await createSubscription(newSubscription);

        // grant credits like payment callback does
        if (credits > 0) {
          const expiresAt = calculateCreditExpirationTime({
            creditsValidDays: creditsValidDays,
            currentPeriodEnd: currentPeriodEnd || undefined,
          });

          await createCredit({
            id: getUuid(),
            userId: user.id,
            userEmail: user.email,
            orderNo: '',
            subscriptionNo: subscriptionNo,
            transactionNo: getSnowId(),
            transactionType: CreditTransactionType.GRANT,
            transactionScene:
              pricingItem.interval === 'one-time'
                ? CreditTransactionScene.PAYMENT
                : CreditTransactionScene.SUBSCRIPTION,
            credits: credits,
            remainingCredits: credits,
            description: description || `Set plan: ${pricingItem.product_name}`,
            expiresAt: expiresAt,
            status: CreditStatus.ACTIVE,
          });
        }

        return {
          status: 'success',
          message: 'plan set successfully',
          redirect_url: `/admin/users?email=${user.email}`,
        };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('set_plan.title')} />
        <FormCard form={form} className="md:max-w-xl" />
      </Main>
    </>
  );
}
