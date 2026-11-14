import React, { useState } from 'react';
import { AskPanel } from './ask';
import { BackButton } from './back-button';
import { ClinicianBriefingCard } from './clinician-briefing';
import { FeedScreen } from './feed';
import { KnowledgeGraphCard } from './kg-graph';
import { NavigationProvider, usePortalNavigation } from './navigation-context';
import { OnboardingFlow, ProductTourModal } from './onboarding';
import { PreserveScreen } from './preserve';
import { SubpageHeader } from './subpage-header';

export function SwitcherExtras({
  onCloseSheet,
  setDoctorMode,
}: {
  onCloseSheet?: () => void;
  setDoctorMode?: (on: boolean) => void;
}) {
  const [showTour, setShowTour] = useState(false);
  const { navigate } = usePortalNavigation();

  const navigateHash = (hashRoute: string, doctor?: boolean) => {
    if (typeof doctor === 'boolean' && setDoctorMode) {
      setDoctorMode(doctor);
    }
    if (onCloseSheet) {
      onCloseSheet();
    }
    navigate(hashRoute);
  };

  return (
    <>
      <div className="mx-switcher-extras">
        <button
          type="button"
          className="secondary sm"
          onClick={() => {
            try {
              localStorage.removeItem('mx-onb-flow-v1');
            } catch {
              // ignore
            }
            navigateHash('#/welcome', false);
          }}
        >
          + Onboard a new person
        </button>

        <button
          type="button"
          className="secondary sm"
          onClick={() => navigateHash('#/me/preserve', false)}
        >
          Preserve yourself (3D + Voice)
        </button>

        <button
          type="button"
          className="secondary sm"
          onClick={() => setShowTour(true)}
        >
          1-Min Product Video &amp; Sandbox
        </button>
      </div>

      {showTour && (
        <ProductTourModal
          onClose={() => setShowTour(false)}
          onNavigateSandbox={(route, enableDoctor) => {
            setShowTour(false);
            navigateHash(route, enableDoctor);
          }}
        />
      )}
    </>
  );
}

const portalEnhancements = {
  NavigationProvider,
  usePortalNavigation,
  BackButton,
  SubpageHeader,
  OnboardingFlow,
  ProductTourModal,
  AskPanel,
  ClinicianBriefingCard,
  KnowledgeGraphCard,
  FeedScreen,
  PreserveScreen,
  SwitcherExtras,
};

(globalThis as any).__MX_PORTAL__ = portalEnhancements;

export default portalEnhancements;
