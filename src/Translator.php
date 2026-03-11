<?php

namespace App;

class Translator
{
    private array $translations = [];
    private string $locale;
    
    public function __construct(string $locale = 'pt_BR')
    {
        $this->locale = $locale;
        $this->loadTranslations();
    }
    
    private function loadTranslations(): void
    {
        $localeFile = __DIR__ . "/../config/locales/{$this->locale}.php";
        
        if (file_exists($localeFile)) {
            $this->translations = require $localeFile;
        } else {
            // Fallback para português
            $fallbackFile = __DIR__ . "/../config/locales/pt_BR.php";
            if (file_exists($fallbackFile)) {
                $this->translations = require $fallbackFile;
            }
        }
    }
    
    public function trans(string $key, array $params = []): string
    {
        $text = $this->translations[$key] ?? $key;
        
        // Replace parameters
        foreach ($params as $param => $value) {
            $text = str_replace(":{$param}", $value, $text);
        }
        
        return $text;
    }
    
    public function getLocale(): string
    {
        return $this->locale;
    }
    
    public function setLocale(string $locale): void
    {
        $this->locale = $locale;
        $this->loadTranslations();
    }
    
    public function getJsTranslations(): array
    {
        // Retorna apenas as traduções necessárias para o JavaScript
        return [
            'search_placeholder' => $this->trans('search_placeholder'),
            'search_fake_placeholder' => $this->trans('search_fake_placeholder'),
            'close_button' => $this->trans('close_button'),
            'no_results' => $this->trans('no_results'),
            'google_search' => $this->trans('google_search'),
            'tips_title' => $this->trans('tips_title'),
            'tips_description' => $this->trans('tips_description'),
            'secret_mode_active' => $this->trans('secret_mode_active'),
            'secret_mode_description' => $this->trans('secret_mode_description'),
            'secret_links_available' => $this->trans('secret_links_available'), // ESTAVA FALTANDO
            'no_secret_results' => $this->trans('no_secret_results'),
            'try_other_terms' => $this->trans('try_other_terms'),
            'recent_searches' => $this->trans('recent_searches'),
            'click_to_search' => $this->trans('click_to_search'),
            'top_favorites' => $this->trans('top_favorites'),
            'smart_search_placeholder' => $this->trans('smart_search_placeholder'),
            'uncategorized' => $this->trans('uncategorized'),
            'shortcut_secret' => $this->trans('shortcut_secret'),
            'shortcut_web_search' => $this->trans('shortcut_web_search'),
        ];
    }
}