

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import brain from 'brain';

// Dynamic resource loader
const loadTranslations = async (language: string) => {
  try {
    console.log(`Loading translations for language: ${language}`);
    const response = await brain.get_translations_by_language({ languageCode: language });
    const data = await response.json();
    console.log(`Loaded ${Object.keys(data.translations).length} translations for ${language}`);
    return data.translations;
  } catch (error) {
    console.error(`Failed to load translations for ${language}:`, error);
    // Fallback to basic navigation translations
    const fallbackTranslations = {
      'nav.home': language === 'fr' ? 'Accueil' : 'Home',
      'nav.meetings': language === 'fr' ? 'Réunions' : 'Meetings',
      'nav.documents': language === 'fr' ? 'Documents' : 'Documents',
      'nav.tasks': language === 'fr' ? 'Tâches' : 'Tasks',
      'nav.updates': language === 'fr' ? 'Actualités du Conseil' : 'Board Updates',
      'nav.chat': language === 'fr' ? 'Chat' : 'Chat',
      'nav.language': language === 'fr' ? 'Langue' : 'Language',
      'nav.translations': language === 'fr' ? 'Gestion des Traductions' : 'Translation Management'
    };
    console.log(`Using fallback translations for ${language}`);
    return fallbackTranslations;
  }
};

// Initialize with basic resources first
const initResources = {
  en: {
    translation: {}
  },
  fr: {
    translation: {}
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: initResources,
    fallbackLng: 'en',
    debug: true, // Enable debug for troubleshooting
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false
    }
  });

// Load initial translations
const loadInitialTranslations = async () => {
  try {
    const currentLang = i18n.language || 'en';
    console.log(`Loading initial translations for: ${currentLang}`);
    const translations = await loadTranslations(currentLang);
    
    // Add resources to i18n
    i18n.addResourceBundle(currentLang, 'translation', translations, true, true);
    console.log(`Initial translations loaded for ${currentLang}`);
  } catch (error) {
    console.error('Failed to load initial translations:', error);
  }
};

// Custom function to change language and load translations
export const changeLanguageWithTranslations = async (languageCode: string) => {
  try {
    console.log(`Changing language to: ${languageCode}`);
    
    // Load translations for the new language
    const translations = await loadTranslations(languageCode);
    
    // Add/update the resource bundle
    i18n.addResourceBundle(languageCode, 'translation', translations, true, true);
    
    // Change the language
    await i18n.changeLanguage(languageCode);
    
    console.log(`Language changed to ${languageCode}`);
    return true;
  } catch (error) {
    console.error(`Failed to change language to ${languageCode}:`, error);
    throw error;
  }
};

// Function to reload translations (useful for admin interface)
export const reloadTranslations = async () => {
  try {
    const currentLang = i18n.language;
    console.log(`Reloading translations for: ${currentLang}`);
    const translations = await loadTranslations(currentLang);
    i18n.addResourceBundle(currentLang, 'translation', translations, true, true);
    console.log(`Translations reloaded for ${currentLang}`);
    return true;
  } catch (error) {
    console.error('Failed to reload translations:', error);
    throw error;
  }
};

// Load initial translations when the module loads
// loadInitialTranslations(); // Temporarily disabled to isolate loading issue

export default i18n;
