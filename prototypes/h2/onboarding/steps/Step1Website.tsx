import { useState, type FormEvent } from 'react';
import { Button, Heading, Text } from '@/components';
import ChevronDown from '@/icons/16/ChevronDown';
import { useOnboarding } from '../onboarding-context';

const LANGUAGES = [
  'English (US)',
  'English (UK)',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Italian',
];

export function Step1Website({ onContinue }: { onContinue?: () => void } = {}) {
  const { websiteUrl, setWebsiteUrl, contentLanguage, setContentLanguage, next } = useOnboarding();
  const [localUrl, setLocalUrl] = useState(websiteUrl);
  const [langOpen, setLangOpen] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!localUrl.trim()) {
      // Default to a demo URL so the flow always advances — it's a prototype.
      setWebsiteUrl('certapro.com/austin');
    } else {
      setWebsiteUrl(localUrl.trim());
    }
    if (onContinue) onContinue();
    else next();
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 720, textAlign: 'center' }}>
        <Heading
          level={1}
          style={{ marginBottom: 12, fontSize: 44, letterSpacing: '-0.6px' }}
        >
          Let's build your content engine
        </Heading>
        <Text
          variant="primary"
          style={{
            display: 'block',
            fontSize: 18,
            color: 'var(--dark-60)',
            marginBottom: 40,
          }}
        >
          Enter your website. We handle the rest.
        </Text>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
          <input
            autoFocus
            type="text"
            placeholder="yourbusiness.com"
            value={localUrl}
            onChange={(e) => setLocalUrl(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              height: 48,
              padding: '0 20px',
              fontSize: 16,
              letterSpacing: '0.32px',
              fontFamily: 'inherit',
              color: 'var(--dark-90)',
              background: 'var(--light-100)',
              border: '1.5px solid var(--dark-15)',
              borderRadius: 10,
              outline: 'none',
              transition: 'border-color 120ms ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--dark-90)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--dark-15)';
            }}
          />
          <Button type="submit" variant="primary" size="xl">
            Analyze my business
          </Button>
        </form>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginTop: 28,
            color: 'var(--dark-60)',
            fontSize: 14,
          }}
        >
          <span>Content language</span>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                background: 'var(--light-100)',
                border: '1px solid var(--dark-15)',
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14,
                color: 'var(--dark-90)',
              }}
            >
              {contentLanguage}
              <ChevronDown size={14} color="var(--dark-60)" />
            </button>
            {langOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  background: 'var(--light-100)',
                  border: '1px solid var(--dark-8)',
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  padding: 4,
                  zIndex: 5,
                  minWidth: 160,
                }}
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setContentLanguage(lang);
                      setLangOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 10px',
                      background:
                        lang === contentLanguage ? 'var(--dark-4)' : 'transparent',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 14,
                      color: 'var(--dark-90)',
                      textAlign: 'left',
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

