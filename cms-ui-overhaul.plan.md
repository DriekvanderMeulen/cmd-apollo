# CMS UI Overhaul Plan

## 1. Core UI Components
Create a comprehensive set of atomic components to ensure consistency and "pop".

- **[apps/cms/components/ui/input.tsx](apps/cms/components/ui/input.tsx)**: Create standardized `Input` component with consistent height, padding, border, and accent focus ring.
- **[apps/cms/components/ui/select.tsx](apps/cms/components/ui/select.tsx)**: Create standardized `Select` component (styled native select) with custom chevron icon.
- **[apps/cms/components/ui/badge.tsx](apps/cms/components/ui/badge.tsx)**: Create `Badge` component for status/roles (pill shape, color variants).
- **[apps/cms/components/ui/card.tsx](apps/cms/components/ui/card.tsx)**: Create `Card` component for content grouping (white bg, shadow, border).
- **[apps/cms/components/ui/label.tsx](apps/cms/components/ui/label.tsx)**: Create `Label` component for form fields.

## 2. Update Existing UI Components
Refine existing components to match the new design language.

- **[apps/cms/components/ui/dialog.tsx](apps/cms/components/ui/dialog.tsx)**: Update to use new `Button` styles, improve corner radius, and spacing.
- **[apps/cms/components/ui/dropdown.tsx](apps/cms/components/ui/dropdown.tsx)**: Refine menu item styles (spacing, hover states) and shadow.
- **[apps/cms/components/ui/tabs.tsx](apps/cms/components/ui/tabs.tsx)**: Update active tab style to use the accent color (underline or background).
- **[apps/cms/components/ui/settings-block.tsx](apps/cms/components/ui/settings-block.tsx)**: Refactor to use the new `Card` component.

## 3. Refactor Feature Components
Apply the new components to key features.

- **[apps/cms/components/admin/user-management-table.tsx](apps/cms/components/admin/user-management-table.tsx)**:
  - Replace hardcoded badges with `Badge`.
  - Replace search/filter inputs with `Input` and `Select`.
  - Use `Button` (ghost) for pagination and actions.
- **[apps/cms/components/objects/new-object-form.tsx](apps/cms/components/objects/new-object-form.tsx)**:
  - Replace raw inputs/selects with `Input`, `Select`, and `Label`.
- **[apps/cms/components/objects/tiptap-editor.tsx](apps/cms/components/objects/tiptap-editor.tsx)**:
  - Update toolbar to use `Button` component (ghost variant, small/icon size) for consistency.
- **[apps/cms/components/auth/sign-in-with-google.tsx](apps/cms/components/auth/sign-in-with-google.tsx)**:
  - Update button styling to be more prominent (or cleaner secondary style).

## 4. Update Pages
- **[apps/cms/app/(auth)/login/page.tsx](apps/cms/app/(auth)/login/page.tsx)**:
  - Improve layout, typography, and spacing. Use `Card` if appropriate for the login box.

## 5. Global Polish
- Check `globals.css` for any final adjustments to shadows or background colors to support the "popping" design.

