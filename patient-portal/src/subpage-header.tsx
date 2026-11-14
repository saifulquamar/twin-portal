import React from 'react';
import { BackButton } from './back-button';
import { usePortalNavigation } from './navigation-context';
import { TAB_LABELS } from './navigation';

const DEFAULT_TITLE_ICONS: Record<string, string> = {
  'Feed your twin': 'twin',
  'Action plan': 'lifestyle',
  'Initial assessment summary': 'research',
  Timeline: 'twin',
  'Your genes': 'dna',
  'Family history': 'dna',
  'Information we need': 'research',
  'Words we use': 'research',
  'Connect a device': 'heart',
  'Results and body': 'blood',
  'Care journey': 'twin',
  'Twin versions': 'twin',
  Reports: 'share',
  'Your data': 'lock',
  'Preserve yourself': 'preserve',
  'How Mutanex works': 'twin',
  'Check-in and Ask': 'checkin',
  'All statistics': 'panel',
  'Help and support': 'checkin',
  'Your journey': 'twin',
  'Initial longevity assessment': 'research',
  'Longevity profile': 'heart',
  'Personalised profile': 'dna',
  'My health profile': 'twin',
  'Medical dossier': 'share',
  Settings: 'lock',
  'Privacy and security': 'lock',
};

export interface SubpageHeaderProps {
  title: string;
  sub?: string;
  right?: React.ReactNode;
  illus?: string;
  eyebrow?: string;
  onBack?: () => void;
  backLabel?: string;
  fallbackHash?: string;
  Icon?: React.ComponentType<{ name: string; size?: number }>;
}

/**
 * Standard portal page header built on Mutanex's native `card page-head` pattern,
 * with `<BackButton />` cleanly integrated into `.ph-top` without overflowing.
 */
export function SubpageHeader({
  title,
  sub,
  right,
  illus,
  eyebrow,
  onBack,
  backLabel,
  fallbackHash,
  Icon,
}: SubpageHeaderProps) {
  const { current, backTarget } = usePortalNavigation();
  const iconName = illus ?? DEFAULT_TITLE_ICONS[title];
  const resolvedEyebrow =
    eyebrow ?? TAB_LABELS[current.tab] ?? backTarget.backLabel ?? 'Overview';

  return (
    <header className="card page-head std-page-head">
      <div className="ph-top std-ph-top">
        <div className="std-ph-left">
          <BackButton
            label={backLabel}
            onClick={onBack}
            fallbackHash={fallbackHash}
          />
          {resolvedEyebrow ? (
            <span className="bt-l std-ph-eyebrow">
              {iconName && Icon ? <Icon name={iconName} size={16} /> : null}
              <span className="std-ph-eyebrow-text">{resolvedEyebrow}</span>
            </span>
          ) : null}
        </div>
        {right ? <div className="tb-right std-ph-right">{right}</div> : null}
      </div>
      <h1>{title}</h1>
      {sub ? <p className="tb-sub">{sub}</p> : null}
    </header>
  );
}
