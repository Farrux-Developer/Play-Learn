/**
 * Main Workshop Landing Page (Server Component shell rendering static Hero copy + WorkshopClientShell).
 */
import { HeroHeadlineBlock, HeroPromisesStrip } from '@/components/HeroPaperHeader';
import { WorkshopClientShell } from '@/components/WorkshopClientShell';

export default function HomePage() {
  return (
    <WorkshopClientShell
      headlineSlot={<HeroHeadlineBlock />}
      promisesSlot={<HeroPromisesStrip />}
    />
  );
}
