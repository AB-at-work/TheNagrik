'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './CapyLoader.module.css';

interface CapyLoaderProps {
  fullScreen?: boolean;
}

export function CapyLoader({ fullScreen = false }: CapyLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const inlineStyles: React.CSSProperties = fullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        width: '100%',
      };

  const loaderContent = (
    <div 
      className={fullScreen ? styles.fullscreenContainer : styles.inlineContainer}
      style={inlineStyles}
    >
      <div className={styles.capybaraloader} aria-label="Loading...">
        <div className={styles.capybara}>
          <div className={styles.capyhead}>
            <div className={styles.capyear}>
              <div className={styles.capyear2}></div>
            </div>
            <div className={styles.capyear}></div>
            <div className={styles.capymouth}>
              <div className={styles.capylips}></div>
              <div className={styles.capylips}></div>
            </div>
            <div className={styles.capyeye}></div>
            <div className={styles.capyeye}></div>
          </div>
          <div className={styles.capyleg}></div>
          <div className={styles.capyleg2}></div>
          <div className={styles.capyleg2}></div>
          <div className={styles.capy}></div>
        </div>
        <div className={styles.loader}>
          <div className={styles.loaderline}></div>
        </div>
      </div>
    </div>
  );

  if (fullScreen && mounted) {
    return createPortal(loaderContent, document.body);
  }

  return loaderContent;
}
