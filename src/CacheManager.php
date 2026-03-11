<?php
// src/CacheManager.php
namespace App;

class CacheManager
{
    private $cacheDir;
    
    public function __construct()
    {
        $this->cacheDir = __DIR__ . '/../public/cache/icons/';
        
        // Create cache directory if it does not exist
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }
    
    public function getIcon($type, $identifier)
    {
        $cacheKey = md5($type . ':' . $identifier) . '.png';
        $cacheFile = $this->cacheDir . $cacheKey;
        
        // Use cached file if it is still valid (30 days)
        if (file_exists($cacheFile) && 
            (time() - filemtime($cacheFile)) < (30 * 24 * 60 * 60)) {
            return '/cache/icons/' . $cacheKey;
        }
        
        // Try to download the icon
        try {
            $url = $this->getSourceUrl($type, $identifier);
            $imageData = @file_get_contents($url);
            
            if ($imageData && strlen($imageData) < 1024 * 50) { // 50KB
                file_put_contents($cacheFile, $imageData);
                return '/cache/icons/' . $cacheKey;
            }
        } catch (\Exception $e) {
            // Fail silently
        }
        
        // Fallback para URL original
        return $this->getSourceUrl($type, $identifier);
    }
    
    private function getSourceUrl($type, $identifier)
    {
        switch ($type) {
            case 'favicon':
                return "https://www.google.com/s2/favicons?sz=64&domain=" . urlencode($identifier);
            case 'simpleicons':
                return "https://cdn.simpleicons.org/" . urlencode($identifier);
            case 'custom':
                return $identifier;
            default:
                return "https://www.google.com/s2/favicons?sz=64&domain=" . urlencode($identifier);
        }
    }
    
    public function cleanup()
    {
        $files = glob($this->cacheDir . '*.png');
        $expireTime = time() - (30 * 24 * 60 * 60);
        
        foreach ($files as $file) {
            if (filemtime($file) < $expireTime) {
                @unlink($file);
            }
        }
    }
}