## Apollo CMS UI Style Guide

### Tokens

- **Primary color**: `#1068FF` (Tailwind: `bg-primary` / `text-primary`)
- **Accent color**: `#FFB000`
- **Neutrals**: defined via Tailwind CSS variables in `apps/cms/app/globals.css`
- **Radii**: `--radius-ui-sm: 8px`, `--radius-ui: 10px`, `--radius-ui-lg: 14px`
- **Borders**: default `1.5px` subtle borders; use `border-neutral-200`
- **Spacing**: introduce `px-3.5` for tighter paddings where appropriate

### Components

- **Buttons** (`apps/cms/components/ui/button.tsx`)
  - Variants: `primary`, `secondary`, `secondary-gray`, `danger`
  - Primary: white text on primary background; hover slightly darker
  - Rounded: 10px radius
  - Subtle border on non-primary variants

- **Navigation** (`apps/cms/components/ui/navigation.tsx`)
  - Icons: `lucide-react`
  - Items: 10px radius, hover neutral background, active neutral-200
  - Logout uses `LogOut` icon, red text and light red hover

### Icons

- Use `lucide-react` across the app
- Sizing: `size={18}` in nav, align with text using `inline-flex`

### Usage

- Prefer `thing ? 'whatever' : null` for conditional rendering
- Keep top-level layout neutral; use primary sparingly for CTAs

### Files of Interest

- Tailwind theme: `apps/cms/app/globals.css`
- Tailwind config: `apps/cms/tailwind.config.js`
- Buttons: `apps/cms/components/ui/button.tsx`
- Navigation: `apps/cms/components/ui/navigation.tsx`


