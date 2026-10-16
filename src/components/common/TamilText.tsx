/**
 * GramVoice TN - Tamil Typography & Text Component
 */
import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface TamilTextProps {
  en: string;
  ta?: string;
  className?: string;
  as?: React.ElementType;
}

export const TamilText: React.FC<TamilTextProps> = ({ en, ta, className = '', as: Component = 'span' }) => {
  const { language } = useLanguage();
  const text = (language === 'ta' && ta) ? ta : en;
  const isTamil = language === 'ta' && Boolean(ta);

  return (
    <Component className={`${isTamil ? 'font-tamil leading-relaxed tracking-normal' : 'font-sans'} ${className}`}>
      {text}
    </Component>
  );
};
