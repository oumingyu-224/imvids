'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Coins,
  ImageIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Sparkles,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

import { authClient, signOut, useSession } from '@/core/auth/client';
import { Link, useRouter } from '@/core/i18n/navigation';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useAppContext } from '@/shared/contexts/app';
import { cn } from '@/shared/lib/utils';
import type { User as UserType } from '@/shared/models/user';
import { UserNav } from '@/shared/types/blocks/common';
import { SignModal } from './sign-modal';

function formatCredits(value: number) {
  if (value < 1000) return `${value}`;

  const formatted = value / 1000;
  const rounded =
    formatted >= 10 ? Math.round(formatted) : Math.round(formatted * 10) / 10;

  return `${rounded}K`;
}

function estimateTextWidth(text: string, fontSize: number, weight = 500) {
  const perChar = fontSize * (weight >= 600 ? 0.62 : 0.56);
  return Math.round(text.length * perChar);
}

function extractSessionUser(data: any): UserType | null {
  const u = data?.user ?? data?.data?.user ?? null;
  return u && typeof u === 'object' ? (u as UserType) : null;
}

export function SignUser({
  isScrolled,
  signButtonSize = 'sm',
  userNav,
  containerClassName,
  signInClassName,
  avatarButtonClassName,
  signedInActionsClassName,
}: {
  isScrolled?: boolean;
  signButtonSize?: 'default' | 'sm' | 'lg' | 'icon';
  userNav?: UserNav;
  containerClassName?: string;
  signInClassName?: string;
  avatarButtonClassName?: string;
  signedInActionsClassName?: string;
}) {
  const t = useTranslations('common.sign');
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuWidth, setMenuWidth] = useState(320);
  const [signModalInitialMode, setSignModalInitialMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // get app context values
  const {
    configs,
    setIsShowSignModal,
    isCheckSign,
    setIsCheckSign,
    user,
    setUser,
    fetchUserInfo,
    showOneTap,
  } = useAppContext();

  // get session
  const { data: session, isPending } = useSession();
  const sessionUser = extractSessionUser(session);
  const sessionUserId = sessionUser?.id ?? '';
  const currentUserId = user?.id ?? '';

  // In dev (React StrictMode) effects can run twice; ensure we don't spam getSession().
  const didFallbackSyncRef = useRef(false);

  // one tap initialized
  const oneTapInitialized = useRef(false);

  // set is check sign
  useEffect(() => {
    setIsCheckSign(isPending);
  }, [isPending]);

  // show one tap if not initialized
  useEffect(() => {
    if (
      configs &&
      configs.google_client_id &&
      configs.google_one_tap_enabled === 'true' &&
      !session &&
      !isPending &&
      !oneTapInitialized.current
    ) {
      oneTapInitialized.current = true;
      showOneTap(configs);
    }
  }, [configs, session, isPending]);

  // set user
  useEffect(() => {
    if (sessionUser && sessionUserId !== currentUserId) {
      setUser(sessionUser as UserType);
      fetchUserInfo();
    } else if (!sessionUser && currentUserId && !isPending) {
      // Only clear user when session is definitively resolved (not pending).
      // This prevents a race where fetchUserInfo() sets user but useSession
      // hasn't re-fetched yet, which would incorrectly clear the user.
      setUser(null);
    }
  }, [sessionUser?.id, sessionUserId, currentUserId, isPending, setUser, fetchUserInfo]);

  // Fallback: if the session cookie is present but useSession lags, do a single refresh.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (didFallbackSyncRef.current) return;
    if (isPending) return;
    if (sessionUser || user) return;

    didFallbackSyncRef.current = true;
    void (async () => {
      try {
        const res: any = await authClient.getSession();
        const fresh = extractSessionUser(res?.data ?? res);
        if (fresh?.id) {
          setUser(fresh);
          fetchUserInfo();
        }
      } catch {
        // ignore
      }
    })();
  }, [isPending, sessionUser, user?.id, setUser, fetchUserInfo]);

  const userDisplayName =
    user?.name?.trim() || user?.email?.split('@')[0] || 'User';
  const userDisplayEmail = user?.email || '';
  const currentCredits = user?.credits?.remainingCredits || 0;
  const creditsDisplay = formatCredits(currentCredits);
  const myWorksItem = userNav?.items?.find(
    (item) => item.url === '/settings/my-works'
  );
  const myWorksHref = myWorksItem?.url || '/settings/my-works';
  const myWorksTarget = myWorksItem?.target || '_self';
  const myWorksLabel = t('my_works_title');

  useEffect(() => {
    const themeWidth = 32;
    const avatarWidth = 40;
    const outerGap = 12;
    const actionGap = 8;
    const buttonPaddingX = 24;
    const iconWidth = 16;

    const creditsWidth =
      buttonPaddingX +
      iconWidth +
      actionGap +
      estimateTextWidth(creditsDisplay, 14, 600);

    const worksWidth =
      buttonPaddingX +
      iconWidth +
      actionGap +
      estimateTextWidth(myWorksLabel, 14, 500);

    const nextWidth =
      themeWidth +
      outerGap +
      creditsWidth +
      outerGap +
      worksWidth +
      outerGap +
      avatarWidth;

    setMenuWidth(nextWidth);
  }, [creditsDisplay, myWorksLabel]);

  const widthRatio = menuWidth / 368;
  const topPaddingX = Math.round(18 * widthRatio);
  const topPaddingY = Math.round(16 * widthRatio);
  const topGap = Math.round(14 * widthRatio);
  const avatarSize = Math.round(54 * widthRatio);
  const nameSize = Math.max(14, Math.round(17 * widthRatio));
  const emailSize = Math.max(11, Math.round(13 * widthRatio));
  const badgeHeight = Math.round(24 * widthRatio);
  const badgePx = Math.round(12 * widthRatio);
  const sectionPy = Math.round(8 * widthRatio);
  const itemHeight = Math.round(44 * widthRatio);
  const itemPx = Math.round(18 * widthRatio);
  const itemGap = Math.round(14 * widthRatio);
  const itemTextSize = Math.max(13, Math.round(15 * widthRatio));
  const iconSize = Math.max(15, Math.round(18 * widthRatio));
  const creditBadgeHeight = Math.round(24 * widthRatio);
  const creditBadgeMinWidth = Math.round(24 * widthRatio);
  const creditBadgePx = Math.round(8 * widthRatio);
  const signOutPy = Math.round(6 * widthRatio);
  const signOutHeight = Math.round(46 * widthRatio);

  return (
    <>
      {isCheckSign || !mounted ? (
        <div>
          <Loader2 className="size-4 animate-spin" />
        </div>
      ) : user && user.name ? (
        <div className={cn('flex items-center gap-3', signedInActionsClassName)}>
          <div className="flex items-center gap-2">
            <Link
              href="/settings/credits"
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#f0d9b8] bg-[#fff8ee] px-3 text-sm font-semibold text-[#d68b22] transition-colors hover:bg-[#fff1de] dark:border-[#5f451d] dark:bg-[#251c11] dark:text-[#f2ba5b] dark:hover:bg-[#2d2215]"
            >
              <Coins className="size-4" />
              <span>{creditsDisplay}</span>
            </Link>

            <Link
              href={myWorksHref}
              target={myWorksTarget}
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-medium text-[#1773ea] transition-colors hover:bg-sky-100 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300 dark:hover:bg-sky-400/15"
            >
              <ImageIcon className="size-4" />
              <span>{myWorksLabel}</span>
            </Link>
          </div>

          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'relative h-10 w-10 rounded-full p-0',
                  avatarButtonClassName
                )}
              >
                <Avatar>
                  <AvatarImage
                    src={user.image || ''}
                    alt={userDisplayName}
                  />
                  <AvatarFallback>{userDisplayName.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="overflow-hidden rounded-[16px] border border-slate-200/90 bg-white p-0 shadow-[0_10px_28px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[#0f1115] dark:shadow-[0_12px_28px_rgba(0,0,0,0.42)]"
              style={{ width: `${menuWidth}px` }}
            >
              <Link
                href="/settings/profile"
                onClick={() => setMenuOpen(false)}
                className="block border-b border-slate-200/90 transition-colors hover:bg-sky-50 dark:border-white/10 dark:hover:bg-sky-400/10"
                style={{
                  paddingLeft: `${topPaddingX}px`,
                  paddingRight: `${topPaddingX}px`,
                  paddingTop: `${topPaddingY}px`,
                  paddingBottom: `${topPaddingY}px`,
                }}
              >
                <div className="flex items-start" style={{ gap: `${topGap}px` }}>
                  <Avatar
                    className="border border-slate-200 dark:border-white/10"
                    style={{ width: `${avatarSize}px`, height: `${avatarSize}px` }}
                  >
                    <AvatarImage
                      src={user.image || ''}
                      alt={userDisplayName}
                    />
                    <AvatarFallback>{userDisplayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate font-semibold text-slate-900 dark:text-white"
                      style={{ fontSize: `${nameSize}px`, lineHeight: '1.05' }}
                    >
                      {userDisplayName}
                    </p>
                    <p
                      className="mt-[2px] truncate text-slate-500 dark:text-slate-400"
                      style={{ fontSize: `${emailSize}px`, lineHeight: '1.2' }}
                    >
                      {userDisplayEmail}
                    </p>
                    <div
                      className="mt-[8px] inline-flex items-center rounded-full bg-slate-100 font-semibold tracking-[0.04em] text-slate-500 uppercase dark:bg-white/8 dark:text-slate-300"
                      style={{
                        height: `${badgeHeight}px`,
                        paddingLeft: `${badgePx}px`,
                        paddingRight: `${badgePx}px`,
                        fontSize: `${Math.max(10, Math.round(11 * widthRatio))}px`,
                      }}
                    >
                      {user.isAdmin ? t('admin_title') : t('free_plan_title')}
                    </div>
                  </div>
                </div>
              </Link>

              <div style={{ paddingTop: `${sectionPy}px`, paddingBottom: `${sectionPy}px` }}>
                <DropdownMenuItem
                  asChild
                  className="mx-0 flex rounded-none focus:bg-sky-50 focus:text-[#1773ea] dark:focus:bg-sky-400/10 dark:focus:text-sky-300"
                  style={{ height: `${itemHeight}px`, paddingLeft: `${itemPx}px`, paddingRight: `${itemPx}px` }}
                >
                  <Link
                    className="flex w-full cursor-pointer items-center leading-none"
                    style={{ gap: `${itemGap}px`, fontSize: `${itemTextSize}px` }}
                    href={myWorksHref}
                    target={myWorksTarget}
                    onClick={() => setMenuOpen(false)}
                  >
                    <ImageIcon style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
                    <span className="font-medium">{t('my_works_title')}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  asChild
                  className="mx-0 flex rounded-none focus:bg-sky-50 focus:text-[#1773ea] dark:focus:bg-sky-400/10 dark:focus:text-sky-300"
                  style={{ height: `${itemHeight}px`, paddingLeft: `${itemPx}px`, paddingRight: `${itemPx}px` }}
                >
                  <Link
                    className="flex w-full cursor-pointer items-center leading-none"
                    style={{ gap: `${itemGap}px`, fontSize: `${itemTextSize}px` }}
                    href="/create"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Sparkles style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
                    <span className="font-medium">{t('create_title')}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  asChild
                  className="mx-0 flex rounded-none focus:bg-sky-50 focus:text-[#1773ea] dark:focus:bg-sky-400/10 dark:focus:text-sky-300"
                  style={{ height: `${itemHeight}px`, paddingLeft: `${itemPx}px`, paddingRight: `${itemPx}px` }}
                >
                  <Link
                    className="flex w-full cursor-pointer items-center leading-none"
                    style={{ gap: `${itemGap}px`, fontSize: `${itemTextSize}px` }}
                    href="/settings/credits"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Coins style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
                    <span className="font-medium leading-none">{t('credits_label_title')}</span>
                    <span
                      className="ml-auto inline-flex items-center justify-center rounded-full bg-[#fff3df] font-semibold leading-none text-[#d68b22] dark:bg-[#2a1f12] dark:text-[#f2ba5b]"
                      style={{
                        height: `${creditBadgeHeight}px`,
                        minWidth: `${creditBadgeMinWidth}px`,
                        paddingLeft: `${creditBadgePx}px`,
                        paddingRight: `${creditBadgePx}px`,
                        fontSize: `${Math.max(10, Math.round(12 * widthRatio))}px`,
                      }}
                    >
                      {creditsDisplay}
                    </span>
                  </Link>
                </DropdownMenuItem>

                {user.isAdmin ? (
                  <DropdownMenuItem
                    asChild
                    className="mx-0 flex rounded-none focus:bg-sky-50 focus:text-[#1773ea] dark:focus:bg-sky-400/10 dark:focus:text-sky-300"
                    style={{ height: `${itemHeight}px`, paddingLeft: `${itemPx}px`, paddingRight: `${itemPx}px` }}
                  >
                    <Link
                      className="flex w-full cursor-pointer items-center leading-none"
                      style={{ gap: `${itemGap}px`, fontSize: `${itemTextSize}px` }}
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
                      <span className="font-medium">{t('admin_title')}</span>
                    </Link>
                  </DropdownMenuItem>
                ) : null}
              </div>

              {userNav?.show_sign_out && (
                <>
                  <DropdownMenuSeparator className="bg-slate-200/90 dark:bg-white/10" />
                  <div style={{ paddingTop: `${signOutPy}px`, paddingBottom: `${signOutPy}px` }}>
                    <DropdownMenuItem
                      className="mx-0 flex w-auto cursor-pointer rounded-none text-slate-700 focus:bg-sky-50 focus:text-[#1773ea] dark:text-slate-200 dark:focus:bg-sky-400/10 dark:focus:text-sky-300"
                      style={{
                        height: `${signOutHeight}px`,
                        paddingLeft: `${itemPx}px`,
                        paddingRight: `${itemPx}px`,
                        fontSize: `${itemTextSize}px`,
                        gap: `${itemGap}px`,
                      }}
                      onClick={() =>
                        {
                          setMenuOpen(false);
                          signOut({
                            fetchOptions: {
                              onSuccess: () => {
                                router.push('/');
                              },
                            },
                          });
                        }
                      }
                    >
                      <LogOut style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
                      <span className="font-medium">{t('sign_out_title')}</span>
                    </DropdownMenuItem>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div
          className={cn(
            'flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit',
            containerClassName
          )}
        >
          <Button
            size={signButtonSize}
            type="button"
            className={cn(
              'ml-4 cursor-pointer border border-sky-200 bg-[#1773ea] text-white ring-0 hover:bg-[#0f63d8] dark:border-sky-400/20 dark:bg-[#1773ea] dark:hover:bg-[#0f63d8]',
              isScrolled && 'lg:hidden',
              signInClassName
            )}
            onClick={() => {
              setSignModalInitialMode('sign-in');
              setIsShowSignModal(true);
            }}
          >
            {t('sign_in_up_title')}
          </Button>
          <SignModal callbackUrl={pathname || '/'} initialMode={signModalInitialMode} />
        </div>
      )}
    </>
  );
}
