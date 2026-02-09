/**
 * Svetozar Technologies i18n (Internationalization) System
 * Handles multi-language support for the website
 */

class I18n {
    constructor() {
        this.currentLang = 'en';
        this.translations = {};
        this.supportedLanguages = [
            { code: 'en', name: 'English', flag: '🇬🇧' },
            { code: 'es', name: 'Español', flag: '🇪🇸' },
            { code: 'ja', name: '日本語', flag: '🇯🇵' },
            { code: 'ar', name: 'العربية', flag: '🇦🇪' },
            { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
            { code: 'ru', name: 'Русский', flag: '🇷🇺' },
            { code: 'fr', name: 'Français', flag: '🇫🇷' },
            { code: 'zh', name: '中文', flag: '🇨🇳' }
        ];

        // Determine base path for translations (handles subpages like /localmind/)
        this.basePath = this.getBasePath();

        this.init();
    }

    getBasePath() {
        // Check if we're in a subdirectory
        const path = window.location.pathname;
        if (path.includes('/localmind/') || path.includes('/localwrite/') || path.includes('/localpdf/')) {
            return '../';
        }
        return './';
    }

    async init() {
        // Get saved language preference or detect from browser
        const savedLang = localStorage.getItem('svetozar-lang');
        const browserLang = navigator.language.split('-')[0];

        // Use saved language, or browser language if supported, otherwise default to English
        const langCode = savedLang ||
                        (this.supportedLanguages.some(l => l.code === browserLang) ? browserLang : 'en');

        await this.loadLanguage(langCode);
        this.renderLanguageSelector();
        this.setupEventListeners();
    }

    async loadLanguage(langCode) {
        try {
            const url = `${this.basePath}translations/${langCode}.json`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load ${langCode} from ${url}`);

            this.translations = await response.json();
            this.currentLang = langCode;

            // Save preference
            localStorage.setItem('svetozar-lang', langCode);

            // Apply translations
            this.applyTranslations();

            // Handle RTL for Arabic
            this.handleRTL();

            // Update HTML lang attribute
            document.documentElement.lang = langCode;

            console.log(`Language loaded: ${langCode}`);
        } catch (error) {
            console.error(`Error loading language ${langCode}:`, error);
            if (langCode !== 'en') {
                // Fallback to English
                await this.loadLanguage('en');
            }
        }
    }

    applyTranslations() {
        // Apply all translations using data-i18n attributes
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
        const selectorMobile = document.getElementById('languageSelectorMobile');

        const currentLangData = this.supportedLanguages.find(l => l.code === this.currentLang);
        if (!currentLangData) return;

        const selectorHTML = `
            <button class="lang-selector-btn" aria-label="Select language" type="button">
                <span class="lang-flag">${currentLangData.flag}</span>
                <span class="lang-code">${this.currentLang.toUpperCase()}</span>
                <svg class="lang-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </button>
            <div class="lang-dropdown">
                ${this.supportedLanguages.map(lang => `
                    <button
                        type="button"
                        class="lang-option ${lang.code === this.currentLang ? 'active' : ''}"
                        data-lang="${lang.code}"
                    >
                        <span class="lang-flag">${lang.flag}</span>
                        <span class="lang-name">${lang.name}</span>
                        ${lang.code === this.currentLang ? '<span class="lang-check">✓</span>' : ''}
                    </button>
                `).join('')}
            </div>
        `;

        if (selector) selector.innerHTML = selectorHTML;
        if (selectorMobile) selectorMobile.innerHTML = selectorHTML;

        // Setup event listeners after rendering
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Remove old listeners by cloning elements
        document.querySelectorAll('.lang-selector-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });

        // Toggle dropdown for all selectors
        document.querySelectorAll('.lang-selector-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const dropdown = btn.nextElementSibling;
                if (!dropdown) return;

                // Close all other dropdowns
                document.querySelectorAll('.lang-dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.remove('active');
                });

                dropdown.classList.toggle('active');
            };
        });

        // Close dropdown when clicking outside
        document.removeEventListener('click', this.closeDropdowns);
        this.closeDropdowns = () => {
            document.querySelectorAll('.lang-dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        };
        document.addEventListener('click', this.closeDropdowns);

        // Language option clicks
        document.querySelectorAll('.lang-option').forEach(option => {
            option.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const langCode = option.getAttribute('data-lang');

                if (langCode && langCode !== this.currentLang) {
                    await this.loadLanguage(langCode);
                    this.renderLanguageSelector();
                }

                document.querySelectorAll('.lang-dropdown').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            };
        });
    }
}

// Initialize i18n when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.i18n = new I18n();
    });
} else {
    window.i18n = new I18n();
}
