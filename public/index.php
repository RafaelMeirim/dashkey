<?php

require __DIR__ . '/../vendor/autoload.php';

use Symfony\Component\Yaml\Yaml;
use App\CacheManager;
use App\IconRenderer;
use App\Translator;


/*
|--------------------------------------------------------------------------
| Load Dashboard Settings
|--------------------------------------------------------------------------
|
| Loads the main configuration file where users can customize
| the dashboard appearance and behavior.
|
*/

$settings = require __DIR__ . '/../config/settings.php';
$theme = require __DIR__ . '/../config/themes/default.php';
$locale = $settings['locale'] ?? 'en_US';
$translator = new Translator($locale);
// DEBUG: Verificar se o tradutor está funcionando
error_log('Locale atual: ' . $locale);
error_log('Tradução search_placeholder: ' . $translator->trans('search_placeholder'));

// Passar traduções para o JavaScript
$jsTranslations = $translator->getJsTranslations();

// DEBUG: Verificar se as traduções estão sendo geradas
error_log('Traduções JS: ' . print_r($jsTranslations, true));

/*
|--------------------------------------------------------------------------
| Load Selected Theme
|--------------------------------------------------------------------------
|
| The theme name comes from settings.php.
| If the theme file does not exist, the system falls back to "default".
|
*/

$themeName = $settings['theme'] ?? 'default';

$themesPath = __DIR__ . '/../config/themes/';
$themeFile = $themesPath . $themeName . '.php';

if (!file_exists($themeFile)) {
    $themeFile = $themesPath . 'default.php';
}

$theme = require $themeFile;


/*
|--------------------------------------------------------------------------
| Apply User Style Overrides
|--------------------------------------------------------------------------
|
| Users can optionally override specific CSS variables
| inside settings.php. Null values are ignored.
|
*/

$styleOverrides = $settings['style'] ?? [];

$theme = array_merge($theme, array_filter($styleOverrides));
$typography = $settings['typography'] ?? [];
$layout = $settings['layout'] ?? [];
$background = $settings['background'] ?? [];

/*
|--------------------------------------------------------------------------
| Load Services Configuration (YAML)
|--------------------------------------------------------------------------
|
| This file contains all categories and bookmark items
| displayed on the dashboard.
|
*/

$data = Yaml::parseFile(__DIR__ . '/../config/services.yaml');

$categories = $data['categories'] ?? [];


/*
|--------------------------------------------------------------------------
| Initialize Core Services
|--------------------------------------------------------------------------
|
| CacheManager handles favicon/icon caching.
| IconRenderer generates the icon HTML for each item.
|
*/

$cacheManager = new CacheManager();

$iconRenderer = new IconRenderer($cacheManager);

?>

<!DOCTYPE html>
<html lang="<?= $locale === 'en_US' ? 'en' : 'pt-BR' ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">

    <!-- Prevent search engine indexing -->
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
    <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
    <meta name="bingbot" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
    <meta name="slurp" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
    <meta name="yandex" content="noindex, nofollow, noarchive">

    <meta name="description" content="Personal favorites dashboard">
    <meta name="author" content="<?= htmlspecialchars($settings['author']) ?>">

    <!-- Dynamic title -->
    <title><?= htmlspecialchars($settings['site_title']) ?></title>

    <link rel="icon" href="/icons/favicon.ico" type="image/x-icon">

    <!-- Base stylesheet -->
    <link rel="stylesheet" href="assets/style.css">

    <!-- Theme variables injected by PHP -->
    <style id="theme-vars">
    :root {

    --color-bg: <?= $theme['color_bg'] ?>;
    --color-surface: <?= $theme['color_surface'] ?>;
    --color-surface-hover: <?= $theme['color_surface_hover'] ?>;
    --color-text: <?= $theme['color_text'] ?>;
    --color-text-secondary: <?= $theme['color_text_secondary'] ?>;
    --color-accent: <?= $theme['color_accent'] ?>;

    --launcher-bg: <?= $theme['launcher_bg'] ?>;
    --launcher-box-bg: <?= $theme['launcher_box_bg'] ?>;
    --launcher-border: <?= $theme['launcher_border'] ?>;

    /* Typography */

    --font-size-base: <?= $typography['font_size_base'] ?>;
    --font-size-title: <?= $typography['font_size_title'] ?>;
    --font-size-card: <?= $typography['font_size_card'] ?>;
    --font-size-input: <?= $typography['font_size_input'] ?>;
    --font-family: <?= $typography['font_family'] ?>;


    /* Layout */

    --border-radius-card: <?= $layout['border_radius_card'] ?>;
    --border-radius-launcher: <?= $layout['border_radius_launcher'] ?>;
    --grid-gap: <?= $layout['grid_gap'] ?>;

    }
    </style>

    <style>
    <?php if (!empty($background['image'])): ?>

    body {
        background-image: url("<?= htmlspecialchars($background['image']) ?>");
        background-size: <?= $background['size'] ?>;
        background-position: <?= $background['position'] ?>;
        background-repeat: <?= $background['repeat'] ?>;
    }

    <?php endif; ?>
    </style>

    <!-- Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

</head>
<body>
<header class="header">
    <input 
        id="search" 
        class="search-input-fake" 
        type="hidden" 
        placeholder="<?= $translator->trans('search_fake_placeholder') ?>" 
        readonly
    >

    <div class="search-container">
        <input
            type="search"
            id="searchInput"
            class="search-input"
            placeholder="<?= $translator->trans('search_placeholder') ?>"
            autocomplete="off"
            inputmode="search"
            <?php
                $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
                $isMobile = preg_match('/Mobile|Android|iPhone|iPad|iPod/i', $userAgent);
                echo $isMobile ? '' : 'autofocus';
            ?>
        />
    </div>
</header>

<main class="main-grid" id="grid">
<?php foreach ($categories as $cat): ?>
    <?php
        // Do not display categories that contain ONLY secret items
        $allItemsSecret = true;
        foreach ($cat['items'] as $item) {
            if (!isset($item['secret']) || $item['secret'] !== true) {
                $allItemsSecret = false;
                break;
            }
        }
        if ($allItemsSecret) continue;
    ?>

    <section class="column">
        <h2 class="column-title"><?= htmlspecialchars($cat['name']) ?></h2>
        <?php foreach ($cat['items'] as $item): ?>
            <?php
                $isSecret = isset($item['secret']) && $item['secret'] === true;
                if ($isSecret) continue;
            ?>

            <a
                class="card"
                href="<?= htmlspecialchars($item['url']) ?>"
                target="_blank"
                data-name="<?= strtolower($item['name']) ?>"
                data-keywords="<?= strtolower(implode(' ', $item['keywords'] ?? [])) ?>"
                data-secret="false"
                data-category="<?= htmlspecialchars($cat['name']); ?>"
            >
                <span class="icon">
                    <?= $iconRenderer->renderIcon($item); ?>
                </span>
                <span class="title"><?= htmlspecialchars($item['name']) ?></span>
            </a>
        <?php endforeach; ?>
    </section>
<?php endforeach; ?>
</main>

<!-- Global launcher -->
<div id="launcher" class="launcher hidden">
    <div class="launcher-box">
        <div class="launcher-input-mobile" id="launcherInputMobile">
            <input 
                type="text" 
                id="mobileSearchInput" 
                placeholder="<?= $translator->trans('search_placeholder') ?>" 
                autocomplete="off" 
            />
        </div>
        <div class="launcher-input-area" id="launcherInput"></div>
        <div class="launcher-results" id="results"></div>
    </div>
</div>

<script>
var I18N = <?php echo json_encode($jsTranslations); ?>;
var CURRENT_LOCALE = '<?php echo $locale; ?>';
window.APP_CONFIG = {
    searchDebounce: <?= $settings['search']['debounce'] ?? 0 ?>
};
</script>

<script src="assets/app.js"></script>

<!-- Secret icon system (loads all items, including secret ones, but only displays them in JS) -->
<script>
// Loads all items (including secret ones) into JavaScript.
const allItems = <?php echo json_encode($categories); ?>;

document.addEventListener('DOMContentLoaded', function() {
    window.secretItems = [];
    allItems.forEach(category => {
        category.items.forEach(item => {
            if (item.secret === true) {
                window.secretItems.push({
                    name: item.name,
                    url: item.url,
                    icon: item.icon || '',
                    keywords: item.keywords || [],
                    secret: true
                });
            }
        });
    });
});
</script>
</body>
</html>