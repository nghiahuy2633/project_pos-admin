import { useEffect, useState } from 'react';
import { Header } from '@/components/ui/layouts/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n, type Lang } from '@/lib/i18n';

const SIDEBAR_COLLAPSED_KEY = 'pos_admin_sidebar_collapsed';
const UI_EVENT = 'pos-admin:ui';

export default function SettingsPage() {
  const { lang, setLang, t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1');
  }, []);

  const setSidebarCollapsed = (next: boolean) => {
    setCollapsed(next);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
    window.dispatchEvent(new Event(UI_EVENT));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title={t('settings.title')} description={t('settings.description')} />

      <div className="flex-1 space-y-8 p-6 lg:p-10">
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md rounded-[32px] overflow-hidden border-2">
          <CardContent className="p-8">
            <div className="text-sm font-black text-white">{t('settings.section.ui')}</div>

            <div className="mt-6 flex items-center justify-between gap-6 rounded-2xl border border-slate-800/60 bg-slate-900/20 px-5 py-4">
              <div className="min-w-0">
                <Label className="text-slate-200 font-bold">{t('settings.sidebar_collapse.title')}</Label>
                <div className="mt-1 text-sm text-slate-500">{t('settings.sidebar_collapse.desc')}</div>
              </div>
              <Checkbox
                className="h-5 w-5 rounded-md border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                checked={collapsed}
                onCheckedChange={(v) => setSidebarCollapsed(Boolean(v))}
              />
            </div>

            <div className="mt-6 flex items-center justify-between gap-6 rounded-2xl border border-slate-800/60 bg-slate-900/20 px-5 py-4">
              <div className="min-w-0">
                <Label className="text-slate-200 font-bold">{t('settings.language.title')}</Label>
                <div className="mt-1 text-sm text-slate-500">{t('settings.language.desc')}</div>
              </div>
              <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
                <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700 rounded-2xl h-11 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  <SelectItem value="vi">{t('settings.language.vi')}</SelectItem>
                  <SelectItem value="en">{t('settings.language.en')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-900/20 px-5 py-4 text-sm text-slate-400">
              {t('settings.apply_hint')}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="text-sm font-bold text-blue-500 hover:text-blue-400"
                onClick={() => toast.info(t('settings.suggest_toast'))}
              >
                {t('settings.suggest_more')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
