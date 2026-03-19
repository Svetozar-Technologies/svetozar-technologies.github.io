/**
 * LocalCode i18n (Internationalization) System
 * Handles multi-language support for the website
 */

class I18n {
    constructor() {
        this.currentLang = 'en';
        this.translations = {};
        this.supportedLanguages = [
            { code: 'en', name: 'English', flag: '\u{1F1EC}\u{1F1E7}' },
            { code: 'es', name: 'Espa\u00f1ol', flag: '\u{1F1EA}\u{1F1F8}' },
            { code: 'ja', name: '\u65E5\u672C\u8A9E', flag: '\u{1F1EF}\u{1F1F5}' },
            { code: 'ar', name: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629', flag: '\u{1F1E6}\u{1F1EA}' },
            { code: 'hi', name: '\u0939\u093F\u0928\u094D\u0926\u0940', flag: '\u{1F1EE}\u{1F1F3}' },
            { code: 'ru', name: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439', flag: '\u{1F1F7}\u{1F1FA}' },
            { code: 'fr', name: 'Fran\u00e7ais', flag: '\u{1F1EB}\u{1F1F7}' },
            { code: 'zh', name: '\u4E2D\u6587', flag: '\u{1F1E8}\u{1F1F3}' }
        ];
        this.init();
    }

    async init() {
        const savedLang = localStorage.getItem('localcode-lang');
        const browserLang = navigator.language.split('-')[0];
        const langCode = savedLang ||
                        (this.supportedLanguages.some(l => l.code === browserLang) ? browserLang : 'en');
        await this.loadLanguage(langCode);
        this.renderLanguageSelector();
        this.setupEventListeners();
    }

    async loadLanguage(langCode) {
        try {
            const response = await fetch(`translations/${langCode}.json`);
            if (!response.ok) throw new Error(`Failed to load ${langCode}`);
            this.translations = await response.json();
            this.currentLang = langCode;
            localStorage.setItem('localcode-lang', langCode);
            this.applyTranslations();
            this.handleRTL();
            document.documentElement.lang = langCode;
        } catch (error) {
            console.error(`Error loading language ${langCode}:`, error);
            if (langCode !== 'en') await this.loadLanguage('en');
        }
    }

    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.innerHTML = translation;
                }
            }
        });
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations;
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return null;
            }
        }
        return value;
    }

    handleRTL() {
        const isRTL = this.translations.rtl === true;
        if (isRTL) {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.classList.add('rtl');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.classList.remove('rtl');
        }
    }

    renderLanguageSelector() {
        const selector = document.getElementById('languageSelector');
        if (!selector) return;
        const currentLangData = this.supportedLanguages.find(l => l.code === this.currentLang);
        selector.innerHTML = `
            <button class="lang-selector-btn" aria-label="Select language">
                <span class="lang-flag">${currentLangData.flag}</span>
                <span class="lang-code">${this.currentLang.toUpperCase()}</span>
                <svg class="lang-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </button>
            <div class="lang-dropdown">
                ${this.supportedLanguages.map(lang => `
                    <button class="lang-option ${lang.code === this.currentLang ? 'active' : ''}" data-lang="${lang.code}">
                        <span class="lang-flag">${lang.flag}</span>
                        <span class="lang-name">${lang.name}</span>
                        ${lang.code === this.currentLang ? '<span class="lang-check">\u2713</span>' : ''}
                    </button>
                `).join('')}
            </div>
        `;
    }

    setupEventListeners() {
        const selectorBtn = document.querySelector('.lang-selector-btn');
        const dropdown = document.querySelector('.lang-dropdown');
        if (selectorBtn && dropdown) {
            selectorBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });
            document.addEventListener('click', () => dropdown.classList.remove('active'));
        }
        document.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', async (e) => {
                e.stopPropagation();
                const langCode = option.getAttribute('data-lang');
                if (langCode !== this.currentLang) {
                    await this.loadLanguage(langCode);
                    this.renderLanguageSelector();
                }
                dropdown.classList.remove('active');
            });
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.i18n = new I18n(); });
} else {
    window.i18n = new I18n();
}
