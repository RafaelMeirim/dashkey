<?php

/*
|--------------------------------------------------------------------------
| Dashboard Settings
|--------------------------------------------------------------------------
|
| This file contains the basic configuration for the dashboard.
| It is safe for beginners to edit.
|
| If you are not sure what a setting does, simply leave it as default.
|
| Changes here will affect the appearance of the entire dashboard.
|
*/


return [

    /*
    |--------------------------------------------------------------------------
    | Site Name
    |--------------------------------------------------------------------------
    |
    | This is the title displayed in the browser tab.
    |
    */

    "site_title" => "Dashkey",
    "author" => "Rafael Meirim",

    /*
    |--------------------------------------------------------------------------
    | LOCALE
    |--------------------------------------------------------------------------
    |
    | "pt_BR" // "en_US"
    |
    */

    "locale" => "en_US",

    /*
    |--------------------------------------------------------------------------
    | Default Theme
    |--------------------------------------------------------------------------
    |
    | Available themes:
    |
    | - default
    | - nord
    | - ocean
    | - midnight
    | - light
    | - dracula
    | - solarized
    | - github-dark
    |
    | In the future the user will be able to override this locally
    | using a browser preference.
    |
    */

    "theme" => "default",

    /*
    |--------------------------------------------------------------------------
    | Search Settings
    |--------------------------------------------------------------------------
    |
    | Controls launcher search behavior.
    |
    */

    "search" => [

        /*
        |----------------------------------------------------------------------
        | Search Debounce Delay
        |----------------------------------------------------------------------
        |
        | Delay in milliseconds before triggering search.
        |
        | Recommended values:
        |
        | 0    = instant search (best for small dashboards)
        | 150  = recommended for 200+ bookmarks
        | 150+ = safer for very large collections
        |
        */

        "debounce" => 0,

    ],


    /*
    |--------------------------------------------------------------------------
    | Custom Style Overrides (Optional)
    |--------------------------------------------------------------------------
    |
    | You can override specific CSS variables here.
    | Leave as NULL to use the selected theme defaults.
    |
    */

    "style" => [

        /* Main background color */
        "color_bg" => null,

        /* Card / surface color */
        "color_surface" => null,

        /* Card hover color */
        "color_surface_hover" => null,

        /* Primary text color */
        "color_text" => null,

        /* Secondary text color */
        "color_text_secondary" => null,

        /* Accent color (links, highlights, etc) */
        "color_accent" => null,

        /* Launcher background overlay */
        "launcher_bg" => null,

        /* Launcher box background */
        "launcher_box_bg" => null,

        /* Launcher border color */
        "launcher_border" => null,
    ],


    /*
    |--------------------------------------------------------------------------
    | Typography Settings
    |--------------------------------------------------------------------------
    |
    | Controls fonts and font sizes.
    |
    */

    "typography" => [

        /* Base font size used throughout the dashboard */
        "font_size_base" => "14px",

        /* Category title size */
        "font_size_title" => "20px",

        /* Card title size */
        "font_size_card" => "14px",

        /* Search input font size */
        "font_size_input" => "18px",

        /* Main font family */
        "font_family" => "system-ui, -apple-system, sans-serif",

    ],


    /*
    |--------------------------------------------------------------------------
    | Layout Settings
    |--------------------------------------------------------------------------
    |
    | Control spacing and card rounding.
    |
    */

    "layout" => [

        /* Card border radius */
        "border_radius_card" => "8px",

        /* Launcher border radius */
        "border_radius_launcher" => "12px",

        /* Grid spacing between columns */
        "grid_gap" => "24px",

    ],


    /*
    |--------------------------------------------------------------------------
    | Background Settings
    |--------------------------------------------------------------------------
    |
    | Optional background image or gradient.
    | Leave empty to use theme background color.
    |
    */

    "background" => [

        /* Background image URL */
        "image" => null,

        /*
        Example:
        "image" => "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986",
        */

        /* Background size (cover / contain) */
        "size" => "cover",

        /* Background position */
        "position" => "center",

        /* Background repeat */
        "repeat" => "no-repeat",

    ],


];