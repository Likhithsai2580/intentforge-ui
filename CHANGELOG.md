# Changelog

All notable changes to this project will be documented in this file.

## [0.1.3] - 2026-04-12

### Fixed
- Fixed a layout issue where the search bar submit button was cut off on mobile devices by adding `min-w-0` to the input element and refining container padding.
- Improved pagination responsiveness on small screens by reducing the maximum number of visible page buttons.

## [0.1.2] - 2026-04-12

### Added
- Created an SEO Optimization Research Report (`seo_optimization_report.md`).
- Added a visually hidden (`sr-only`) microcopy block to `ProSearchContent` to provide SEO context on the homepage without disrupting the user interface.

### Changed
- Massively expanded `src/app/about/page.tsx` with high keyword density paragraphs explaining the intent-first nature of IntentForge and Oxiverse for search engine web crawlers.

## [0.1.1] - 2026-04-06

### Added
- Official Oxiverse brand logos for Light and Dark modes.
- IntentForge search engine logo integration in the Search Bar.
- Animated brand logo on the Home Page.

### Changed
- Replaced text-based branding with high-quality SVG/PNG assets.
- Updated Header and Footer to include brand icons.
- Enhanced Dark Mode support for theme-aware image switching in Tailwind v4.

### Fixed
- Tailwind v4 `dark:` variant connectivity with the `.dark` CSS class.
