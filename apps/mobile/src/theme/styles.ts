import { Platform, StyleSheet } from 'react-native';

/**
 * Ambit Mobile Design System — Centralized UI Tokens & Styles.
 * Standardizes padding, glassmorphism cards, squircle icon badges,
 * list row semantics, stat grids, modals, search bars, summary bars,
 * and header controls across all roles (Admin, Guard, Resident).
 *
 * NOTE: Import `uiStyles` from '@/theme' in every screen/component.
 * Do NOT duplicate any of these tokens with local StyleSheet.create() blocks.
 */
export const uiStyles = StyleSheet.create({
  // ─── Screen Layout ────────────────────────────────────────────────────────

  /** Horizontal padding for scroll content containers */
  scroll: {
    paddingHorizontal: 24,
  },

  // ─── Header Bar ───────────────────────────────────────────────────────────

  /** Standard 3-slot header row: [icon] [title] [icon] */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  /** Touch-optimized 46×46 glassmorphic header control button */
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /** Notification dot badge on header bell */
  notifDot: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // ─── Brand Header (Admin / tabs with Ambit wordmark) ─────────────────────

  /** Top row: Ambit wordmark + role badge */
  brandHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  brandText: {
    fontFamily: Platform.select({
      ios: 'Snell Roundhand',
      android: 'cursive',
      default: 'serif',
    }),
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
  },

  /** ADMIN role pill */
  adminBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(95, 103, 236, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(95, 103, 236, 0.25)',
  },

  adminBadgeText: {
    fontSize: 10,
    fontFamily: 'InterBold',
    color: '#5F67EC',
    letterSpacing: 1.2,
  },

  // ─── Section Group ────────────────────────────────────────────────────────

  /** Outer wrapper that adds bottom spacing between sections */
  sectionContainer: {
    marginBottom: 24,
  },

  /** Label + optional right-action row above a card */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  /** Uppercase muted section label (12px, tracked) */
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'InterBold',
    color: '#8E8D94',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginLeft: 4,
  },

  /** Glassmorphic card surface */
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },

  // ─── List Row ─────────────────────────────────────────────────────────────

  /** Standard list row: 16px vertical, 20px horizontal, min 64px tall */
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 64,
  },

  /** Pressed state overlay for list rows */
  settingRowPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.035)',
  },

  /** Left 38×38 squircle icon badge */
  settingIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 85, 104, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  /** Flex text block to the right of the icon */
  settingTextContainer: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'center',
  },

  /** Title + badge pill inline row */
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  /** Primary row title (15px) */
  itemTitle: {
    color: '#1C1B1F',
    fontSize: 15,
    lineHeight: 20,
  },

  /** Secondary row subtitle (12px, muted) */
  itemSubtitle: {
    color: '#8E8D94',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },

  /** Right-aligned value label */
  valueText: {
    fontSize: 13,
    fontFamily: 'InterMedium',
    color: '#8E8D94',
    marginRight: 6,
  },

  /** Red counter / notification badge pill */
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },

  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
  },

  /** Sub-item divider, offset to align with text (icon 38 + gap 16 + pad 20 = 74px) */
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(28, 27, 31, 0.08)',
    marginLeft: 74,
  },

  // ─── Overview Stat Grid ───────────────────────────────────────────────────

  /** 2×2 flex-wrap grid container */
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 18,
    paddingHorizontal: 16,
    rowGap: 20,
  },

  /** Single 50%-wide stat tile */
  overviewStatTile: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  /** 44×44 icon badge inside stat tile */
  statIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(74, 85, 104, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  /** Number + label stacked text */
  statTextGroup: {
    gap: 2,
    flex: 1,
  },

  // ─── Hero / Banner Card ───────────────────────────────────────────────────

  heroCard: {
    borderRadius: 28,
    overflow: 'hidden',
    minHeight: 90,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },

  heroIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(46, 125, 50, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  heroContent: {
    flex: 1,
    gap: 2,
  },

  // ─── Summary Bar (Directory / Staff screens) ──────────────────────────────

  /** Row with label+count on the left and an action button on the right */
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  /** Large bold count number under the summary label */
  summaryCount: {
    fontSize: 18,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginTop: 2,
  },

  // ─── Add / Primary Action Button ─────────────────────────────────────────

  /** Filled pill action button (e.g. "Add Guard", "Add Resident") */
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },

  addBtnText: {
    fontSize: 12,
    fontFamily: 'InterBold',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // ─── Search Bar ───────────────────────────────────────────────────────────

  /** Container adds bottom margin */
  searchContainer: {
    marginBottom: 16,
  },

  /** Glassmorphic 48px search pill */
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 14,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#1C1B1F',
    height: '100%',
    padding: 0,
  },

  // ─── Status / Tag Badges ──────────────────────────────────────────────────

  /** Inline pill status badge (Pending / Active / Gate) */
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.035)',
    marginRight: 6,
  },

  statusBadgeText: {
    fontSize: 12,
    fontFamily: 'InterSemiBold',
  },

  /** Darker tinted pill for guard gate assignment */
  gateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(74, 85, 104, 0.08)',
  },

  gateBadgeText: {
    fontSize: 11,
    fontFamily: 'InterSemiBold',
    color: '#4A5568',
  },

  // ─── Avatar Circle (directory rows) ──────────────────────────────────────

  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 85, 104, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarCircleText: {
    fontSize: 16,
    fontFamily: 'ManropeBold',
    color: '#4A5568',
    fontWeight: 'bold',
  },

  // ─── Empty State ──────────────────────────────────────────────────────────

  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },

  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#8E8D94',
  },

  // ─── Bottom-sheet Modal ───────────────────────────────────────────────────

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 17,
    fontFamily: 'ManropeBold',
    color: '#1C1B1F',
    fontWeight: 'bold',
  },

  /** 32×32 circular close button */
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /** 32×32 destructive (red) action button in modal header */
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(193, 88, 75, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // ─── Log Out Button (Profile screens) ────────────────────────────────────

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    marginTop: 10,
    backgroundColor: '#C1584B',
    shadowColor: '#C1584B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },

  logoutButtonText: {
    fontSize: 14,
    fontFamily: 'InterBold',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // ─── Footer / Version label ───────────────────────────────────────────────

  versionText: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#A3A1A8',
    textAlign: 'center',
    marginTop: 8,
  },

  // ─── Bottom link row (e.g. "Open full directory") ────────────────────────

  manageLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingVertical: 12,
  },
});
