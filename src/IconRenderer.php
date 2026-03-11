<?php
// src/IconRenderer.php
namespace App;

use App\CacheManager;

class IconRenderer
{
    /**
     * List of available Lucide icons.
     */
    private const LUCIDE_ICONS = [
        // basic
        'home', 'search', 'menu', 'close', 'settings', 'user', 'bell', 'mail', 'lock', 'key',
        'phone', 'message-circle', 'message-square', 'send', 'image', 'camera', 'video',
        // action
        'edit', 'trash-2', 'save', 'download', 'upload', 'copy', 'share-2', 'external-link',
        // media
        'play', 'pause', 'stop-circle', 'volume-2', 'volume-x', 'music', 'headphones',
        // navigation
        'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right', 'arrow-up', 'arrow-down',
        'arrow-left', 'arrow-right', 'corner-up-right', 'move',
        // status
        'check', 'check-circle', 'x', 'x-circle', 'alert-circle', 'alert-triangle', 'info',
        // object
        'book', 'book-open', 'folder', 'folder-open', 'file', 'file-text', 'calendar',
        'clock', 'database', 'server', 'hard-drive', 'cpu', 'wifi', 'bluetooth',
        // social
        'thumbs-up', 'heart', 'star', 'github', 'twitter', 'facebook', 'instagram', 'linkedin',
        'youtube', 'chrome', 'globe', 'link', 'rss',
        // others
        'sun', 'moon', 'cloud', 'umbrella', 'droplet', 'thermometer', 'wind', 'zap',
        'map-pin', 'navigation', 'compass', 'flag', 'credit-card', 'shopping-cart',
        'package', 'truck', 'box', 'briefcase', 'coffee', 'utensils', 'watch',
        'gamepad', 'user-plus', 'user-search', 'user-cog', 'id-card', 'badge', 'building',
        'building-2', 'file-plus', 'file-signature', 'file-check', 'sheet', 'graduation-cap',
        'pen-tool', 'gauge', 'hash', 'wallet', 'bar-chart', 'trending-up', 'chart-spline',
        'bot', 'brain', 'cat', 'car', 'siren', 'search-alert'
    ];

    private $cacheManager;

    public function __construct(CacheManager $cacheManager)
    {
        $this->cacheManager = $cacheManager;
    }

    /**
     * Render an icon for a dashboard item.
     *
     * Priority order:
     * 1. Explicit Lucide icon
     * 2. Custom URL
     * 3. SimpleIcons
     * 4. Automatic favicon
     */
    public function renderIcon(array $item): string
    {
        $icon = $item['icon'] ?? null;
        $url = $item['url'] ?? '';

        if (!$url) return '';

        $domain = parse_url($url, PHP_URL_HOST);

        // flags YAML
        $iconMode = $item['iconmode'] ?? null;

        // classes CSS
        $classes = ['site-icon'];
        if ($iconMode) $classes[] = 'icon-' . $iconMode;

        $classAttr = implode(' ', $classes);

        // Auto favicon detection with caching
        if (!$icon || $icon === 'auto') {
            $iconUrl = $this->cacheManager->getIcon('favicon', $domain);
            return '<img src="' . $iconUrl . '" class="' . $classAttr . '" loading="lazy" onerror="this.onerror=null; this.src=\'https://www.google.com/s2/favicons?sz=64&domain=' . $domain . '\'">';
        }

        // Lucide icon (no cache required)
        if (in_array($icon, self::LUCIDE_ICONS)) {
            return '<i data-lucide="' . htmlspecialchars($icon) . '" class="' . $classAttr . '"></i>';
        }

        // Custom icon URL with cache fallback
        if (str_starts_with($icon, 'http')) {
            $iconUrl = $this->cacheManager->getIcon('custom', $icon);
            return '<img src="' . $iconUrl . '" class="' . $classAttr . '" loading="lazy" onerror="this.onerror=null; this.src=\'' . htmlspecialchars($icon) . '\'">';
        }

        // SimpleIcons icon with caching
        $iconUrl = $this->cacheManager->getIcon('simpleicons', $icon);
        return '<img src="' . $iconUrl . '" class="' . $classAttr . '" loading="lazy" onerror="this.onerror=null; this.src=\'https://cdn.simpleicons.org/' . htmlspecialchars($icon) . '\'">';
    }
}