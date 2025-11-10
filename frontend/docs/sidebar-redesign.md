# Sidebar Redesign Plan

## Goals
- Provide a navigation experience that reflects KhoshGolpo’s hierarchy and brand.
- Support users across desktop, tablet, and mobile with intuitive interactions.
- Offer a scalable structure that can absorb future sections without clutter.

## Information Architecture
- **Primary**: Dashboard, Threads, Notifications, Profile.
- **Engagement**: Signals, Warmth Engine, Playbooks, Community prompts (future).
- **Admin**: Moderation, Team, Security, Analytics (future).
- **Footer Cluster**: Profile summary, status badges, sign-out.
- Organize each group within labeled sections; expose relevant badges for counts/alerts.
- Provide optional pinning/favorites area for future personalization.

## Layout & Responsiveness
- **Desktop (≥1280px)**: Fixed 280 px rail, vertical flex layout, scrollable body.
- **Medium (1024–1279px)**: Narrow to ~240 px, reduce padding while keeping text.
- **Mobile (<1024px)**: Slide-in drawer overlay; maintain same sections but stacked.
- **Collapsed Mode**: 72 px icon rail with tooltips; invoked by desktop toggle, state persisted in storage.
- Ensure header/main content consume remaining width with no extra padding offsets.

## Visual System
- Branded top block: logo avatar + “KhoshGolpo”, subtle gradient background.
- Active item styling: accent left border, elevated background, bold typography.
- Badges: pill with accent background; align at end to preserve single-line layout.
- Section headers: muted uppercase, small-caps, minimal divider line.
- Profile card: avatar, first name + role, quick access to settings.

## Interaction & Accessibility
- Collapse/expand toggle adjacent to logo; keyboard accessible and announces state.
- Hover/focus tooltips for icon-only collapsed items (use Radix Tooltip or custom).
- Keyboard: arrow navigation between items; `Esc` closes mobile drawer; focus trap when open.
- Play CTA (e.g., “New warm thread”) near top, styled as primary gradient button.
- Provide API for sidebar items to include hotkey hints (e.g., `Ctrl+K` search).

## Implementation Outline
- Create `src/config/navigation.ts` exporting typed section items with metadata (icon, badge key, permission).
- Build reusable UI:
  - `SidebarSection` component for headings and item grouping.
  - `SidebarItem` handling active styles, badges, collapsed truncation, and tooltips.
  - `SidebarFooter` for profile/status/sign-out region.
- Main `AppSidebar`:
  - Imports config; maps through sections.
  - Manages `collapsed` state synced with local storage (e.g., `usePersistedState` hook).
  - Media query hook to auto-expand on mobile when drawer opens.
  - Integrates with auth context for user data and action handlers.
- Ensure layout uses CSS grid/flex to keep badges on same line (`flex-1` label, `ml-auto` badge).
- Add Storybook entries or CSS snapshots for primary, collapsed, and mobile states.

## Next Steps
1. Finalize navigation taxonomy with product stakeholders.
2. Design high-fidelity mockups to validate spacing, colors, and iconography.
3. Implement components per outline; add tests for responsive behavior and accessibility.
4. Integrate analytics to track sidebar usage and inform future personalization.


