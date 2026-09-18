import { ReactNode } from 'react';

import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';
import { Footer, Header } from '@/themes/default/blocks';

import { HeaderSpacer } from './header-spacer';

export default async function LandingLayout({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header: HeaderType;
  footer: FooterType;
}) {
  return (
    <div className="min-h-screen w-full bg-transparent">
      <Header header={header} />
      <HeaderSpacer />
      {children}
      <Footer footer={footer} />
    </div>
  );
}
