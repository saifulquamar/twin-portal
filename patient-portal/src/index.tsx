import React from 'react';
import { AskPanel, FloatingVoiceLauncher } from './ask';
import { AuthProvider, usePortalAuth } from './auth-context';
import { BackButton } from './back-button';
import { ClinicianBriefingCard } from './clinician-briefing';
import { FeedScreen } from './feed';
import { KnowledgeGraphCard } from './kg-graph';
import { NavigationProvider, usePortalNavigation } from './navigation-context';
import { OnboardingFlow, ProductTourModal } from './onboarding';
import {
  HomeBentoPanel,
  PatientSwitcherModal,
  ResearchScreen,
  YouAccountFooter,
  YouIdentityBadge,
} from './portal-views';
import { PreserveScreen } from './preserve';
import { SubpageHeader } from './subpage-header';

export function SwitcherExtras({
  onCloseSheet,
  setDoctorMode,
}: {
  onCloseSheet?: () => void;
  setDoctorMode?: (on: boolean) => void;
}) {
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
        onClick={() => navigateHash('#/you/checkin:ask', false)}
      >
        Speak with twin
      </button>

      <button
        type="button"
        className="secondary sm"
        onClick={() => navigateHash('#/you/preserve', false)}
      >
        Preserve yourself
      </button>
    </div>
  );
}

const portalEnhancements = {
  AuthProvider,
  usePortalAuth,
  NavigationProvider,
  usePortalNavigation,
  BackButton,
  SubpageHeader,
  OnboardingFlow,
  ProductTourModal,
  AskPanel,
  FloatingVoiceLauncher,
  ClinicianBriefingCard,
  KnowledgeGraphCard,
  FeedScreen,
  PreserveScreen,
  HomeBentoPanel,
  ResearchScreen,
  YouIdentityBadge,
  YouAccountFooter,
  PatientSwitcherModal,
  SwitcherExtras,
};

(globalThis as any).__MX_PORTAL__ = portalEnhancements;

export default portalEnhancements;
