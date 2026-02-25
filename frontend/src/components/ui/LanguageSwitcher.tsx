import { useMemo } from 'react'
import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type AppLanguage = 'en' | 'pt-BR'

const LANGUAGES: { code: AppLanguage; short: string; labelKey: string }[] = [
  { code: 'en', short: 'EN', labelKey: 'navbar.english' },
  { code: 'pt-BR', short: 'PT', labelKey: 'navbar.portuguese' },
]

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  const current = useMemo<AppLanguage>(() => {
    return i18n.resolvedLanguage === 'pt-BR' ? 'pt-BR' : 'en'
  }, [i18n.resolvedLanguage])

  return (
    <div className="px-4 pb-2">
      <div className="rounded-lg border border-border-subtle/30 bg-bg-card/20 p-2">
        <div className="mb-2 flex items-center gap-2 px-1">
          <Languages className="h-3.5 w-3.5 text-accent-gold" />
          <span className="font-heading text-[10px] tracking-[0.2em] text-text-muted uppercase">
            {t('navbar.language')}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {LANGUAGES.map((lang) => {
            const active = current === lang.code
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  void i18n.changeLanguage(lang.code)
                }}
                className={`rounded-md border px-2 py-1.5 text-[11px] font-semibold tracking-wider transition-colors ${
                  active
                    ? 'border-accent-gold/50 bg-accent-gold/15 text-accent-gold'
                    : 'border-border-subtle/30 bg-bg-primary/20 text-text-muted hover:border-border-subtle/50 hover:text-text-secondary'
                }`}
                aria-label={t(lang.labelKey)}
                title={t(lang.labelKey)}
              >
                {lang.short}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
