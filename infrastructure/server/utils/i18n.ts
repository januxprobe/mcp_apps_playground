/**
 * Internationalization (i18n) utilities for MCP Apps
 *
 * This module provides reusable types and patterns for building multilingual MCP apps.
 *
 * Usage example:
 * ```typescript
 * import { SupportedLanguage, TranslationSchema } from "../../infrastructure/server/i18n.js";
 *
 * type Language = SupportedLanguage<'en' | 'nl' | 'fr'>;
 *
 * const translations: TranslationSchema<Language, {
 *   welcome: string;
 *   goodbye: string;
 * }> = {
 *   en: { welcome: "Welcome", goodbye: "Goodbye" },
 *   nl: { welcome: "Welkom", goodbye: "Tot ziens" },
 *   fr: { welcome: "Bienvenue", goodbye: "Au revoir" },
 * };
 * ```
 */

/**
 * Standard language codes
 * Extend this union type with your supported languages
 */
export type SupportedLanguage<T extends string = 'en'> = T;

/**
 * Translation schema enforcing consistent keys across all languages
 */
export type TranslationSchema<
  Lang extends string,
  Keys extends Record<string, any>
> = Record<Lang, Keys>;

/**
 * Helper to get translation function for a specific language
 *
 * @example
 * const t = getTranslations(translations, 'en');
 * console.log(t.welcome); // "Welcome"
 */
export function getTranslations<
  Lang extends string,
  Keys extends Record<string, any>
>(
  translations: TranslationSchema<Lang, Keys>,
  language: Lang,
  fallback: Lang = 'en' as Lang
): Keys {
  return translations[language] || translations[fallback];
}

/**
 * Common language codes for Belgium (as example)
 */
export const BELGIAN_LANGUAGES = ['en', 'nl', 'fr'] as const;
export type BelgianLanguage = typeof BELGIAN_LANGUAGES[number];

/**
 * Zod schema helper for language parameter
 * Use this in your tool's inputSchema to support multilingual UI
 *
 * @example
 * import { z } from "zod";
 * import { createLanguageSchema } from "../../infrastructure/server/i18n.js";
 *
 * const schema = z.object({
 *   language: createLanguageSchema(['en', 'nl', 'fr']),
 * });
 */
export function createLanguageSchema<T extends readonly string[]>(
  languages: T,
  defaultLang: T[number] = languages[0]
) {
  return {
    enum: languages as unknown as [string, ...string[]],
    optional: () => ({ default: defaultLang }),
    describe: (description: string) => description,
  };
}

/**
 * Best practices for multilingual MCP apps:
 *
 * 1. **Server-side:**
 *    - Add language parameter to tool schema (optional, default 'en')
 *    - Store translations in a constant object
 *    - Pass selected language in structuredContent to widget
 *    - Use descriptive schema hint: "Detect from user's prompt language"
 *
 * 2. **Widget-side:**
 *    - Create comprehensive TRANSLATIONS object with all UI text
 *    - Extract language from structuredContent
 *    - Create getT(language) helper function
 *    - Update all render functions to use translations
 *    - Update header dynamically based on language
 *
 * 3. **Language detection:**
 *    - Let the LLM detect language from user's prompt
 *    - Schema description guides LLM: "Detect from user's prompt language"
 *    - No need for manual language selection UI
 *
 * 4. **Common patterns:**
 *    - Header translations (title, subtitle)
 *    - Step/page titles
 *    - Field labels and placeholders
 *    - Button text
 *    - Validation error messages
 *    - Help text and tooltips
 *
 * See apps/hospi-copilot for a complete implementation example.
 */
