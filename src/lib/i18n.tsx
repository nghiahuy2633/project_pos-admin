import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Lang = 'vi' | 'en';

export const LANG_KEY = 'pos_admin_lang';
export const I18N_EVENT = 'pos-admin:i18n';

const translations = {
  vi: {
    'app.search.placeholder': 'Tìm kiếm...',
    'account.label': 'Tài khoản của tôi',
    'account.profile': 'Hồ sơ',
    'account.settings': 'Cài đặt',
    'account.logout': 'Đăng xuất',
    'toast.logged_out': 'Đã đăng xuất',
    'settings.title': 'Cài đặt',
    'settings.description': 'Tuỳ chỉnh trải nghiệm sử dụng',
    'settings.section.ui': 'Giao diện',
    'settings.sidebar_collapse.title': 'Thu gọn sidebar',
    'settings.sidebar_collapse.desc': 'Tăng diện tích hiển thị nội dung khi làm việc.',
    'settings.apply_hint': 'Thay đổi sẽ áp dụng ngay. Nếu bạn không thấy thay đổi, hãy tải lại trang.',
    'settings.suggest_more': 'Gợi ý thêm cài đặt',
    'settings.suggest_toast': 'Các cài đặt khác sẽ được bổ sung theo nhu cầu vận hành',
    'settings.language.title': 'Ngôn ngữ',
    'settings.language.desc': 'Chọn ngôn ngữ hiển thị trong hệ thống.',
    'settings.language.vi': 'Tiếng Việt',
    'settings.language.en': 'English',
    'sidebar.dashboard': 'Dashboard',
    'sidebar.pos': 'POS',
    'sidebar.orders': 'Đơn hàng',
    'sidebar.products': 'Thực đơn',
    'sidebar.inventory': 'Kho hàng',
    'sidebar.tables': 'Sơ đồ bàn',
    'sidebar.users': 'Nhân sự',
    'sidebar.reports': 'Báo cáo',
    'sidebar.desc.dashboard': 'Tổng quan hệ thống',
    'sidebar.desc.pos': 'Gọi món theo bàn',
    'sidebar.desc.orders': 'Quản lý đơn hàng',
    'sidebar.desc.products': 'Món ăn & Danh mục',
    'sidebar.desc.inventory': 'Quản lý tồn kho',
    'sidebar.desc.tables': 'Quản lý bàn',
    'sidebar.desc.users': 'Quản lý nhân viên',
    'sidebar.desc.reports': 'Thống kê & Phân tích',
    'login.forgot_password_unavailable': 'Chức năng quên mật khẩu chưa được hỗ trợ',
  },
  en: {
    'app.search.placeholder': 'Search...',
    'account.label': 'My account',
    'account.profile': 'Profile',
    'account.settings': 'Settings',
    'account.logout': 'Sign out',
    'toast.logged_out': 'Signed out',
    'settings.title': 'Settings',
    'settings.description': 'Customize your experience',
    'settings.section.ui': 'Appearance',
    'settings.sidebar_collapse.title': 'Collapse sidebar',
    'settings.sidebar_collapse.desc': 'Use more space for the content area.',
    'settings.apply_hint': 'Changes apply immediately. If you don’t see it, refresh the page.',
    'settings.suggest_more': 'Suggest more settings',
    'settings.suggest_toast': 'More settings will be added based on operational needs',
    'settings.language.title': 'Language',
    'settings.language.desc': 'Choose the display language for the app.',
    'settings.language.vi': 'Vietnamese',
    'settings.language.en': 'English',
    'sidebar.dashboard': 'Dashboard',
    'sidebar.pos': 'POS',
    'sidebar.orders': 'Orders',
    'sidebar.products': 'Menu',
    'sidebar.inventory': 'Inventory',
    'sidebar.tables': 'Tables',
    'sidebar.users': 'Staff',
    'sidebar.reports': 'Reports',
    'sidebar.desc.dashboard': 'System overview',
    'sidebar.desc.pos': 'Order by table',
    'sidebar.desc.orders': 'Manage orders',
    'sidebar.desc.products': 'Items & categories',
    'sidebar.desc.inventory': 'Stock management',
    'sidebar.desc.tables': 'Manage tables',
    'sidebar.desc.users': 'Manage staff',
    'sidebar.desc.reports': 'Analytics & insights',
    'login.forgot_password_unavailable': 'Forgot password is not available yet',
  },
} as const;

export type I18nKey = keyof typeof translations.vi;

const getStoredLang = (): Lang => {
  const raw = localStorage.getItem(LANG_KEY);
  if (raw === 'en' || raw === 'vi') return raw;
  return 'vi';
};

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: I18nKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => getStoredLang());

  useEffect(() => {
    const onI18nEvent = () => setLangState(getStoredLang());
    window.addEventListener(I18N_EVENT, onI18nEvent);
    return () => window.removeEventListener(I18N_EVENT, onI18nEvent);
  }, []);

  const setLang = useCallback((next: Lang) => {
    localStorage.setItem(LANG_KEY, next);
    window.dispatchEvent(new Event(I18N_EVENT));
  }, []);

  const t = useCallback(
    (key: I18nKey) => {
      return translations[lang][key] ?? translations.vi[key] ?? key;
    },
    [lang],
  );

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
