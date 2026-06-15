'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type MobileDockPageConfigValue = {
  sentinelId: string;
  whatsappHref: string;
  whatsappLabel: string;
  whatsappOrigin: string;
  quoteLabel: string;
  quoteHref?: string;
  equipmentSlug?: string;
  equipmentName?: string;
};

type MobileDockConfigContextValue = {
  config: MobileDockPageConfigValue | null;
  setConfig: (config: MobileDockPageConfigValue | null) => void;
};

const MobileDockConfigContext = createContext<MobileDockConfigContextValue | null>(null);

export function MobileDockConfigProvider(props: { children: React.ReactNode }) {
  const [config, setConfig] = useState<MobileDockPageConfigValue | null>(null);
  const value = useMemo(() => ({ config, setConfig }), [config]);

  return (
    <MobileDockConfigContext.Provider value={value}>{props.children}</MobileDockConfigContext.Provider>
  );
}

export function useMobileDockConfig() {
  const context = useContext(MobileDockConfigContext);
  if (!context) {
    throw new Error('useMobileDockConfig must be used within MobileDockConfigProvider');
  }
  return context;
}

/**
 * Registers per-page WhatsApp context and scroll sentinel for the mobile conversion bar.
 */
export function SetMobileDockConfig(props: MobileDockPageConfigValue) {
  const { setConfig } = useMobileDockConfig();

  useEffect(() => {
    setConfig(props);
    return () => setConfig(null);
  }, [
    props.sentinelId,
    props.whatsappHref,
    props.whatsappLabel,
    props.whatsappOrigin,
    props.quoteLabel,
    props.quoteHref,
    props.equipmentSlug,
    props.equipmentName,
    setConfig,
  ]);

  return null;
}
