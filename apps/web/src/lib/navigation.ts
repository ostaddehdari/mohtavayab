import {
  faArrowRightArrowLeft,
  faCalendarDays,
  faChartLine,
  faCircleNodes,
  faCompass,
  faFileLines,
  faGaugeHigh,
  faMagnifyingGlass,
  faRobot,
  faSatelliteDish,
  faShieldHalved,
  faUsersGear,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

export type NavigationItem = {
  id: string;
  label: string;
  href: string;
  icon: IconDefinition;
  permission: string;
  badge?: string;
};

export type NavigationGroup = {
  id: string;
  label: string;
  items: NavigationItem[];
};

export const navigationGroups: NavigationGroup[] = [
  {
    id: 'observe',
    label: 'رصد و استخراج',
    items: [
      {
        id: 'overview',
        label: 'نمای کلی',
        href: '/dashboard',
        icon: faGaugeHigh,
        permission: 'dashboard.read',
      },
      {
        id: 'sources',
        label: 'منابع و رقبا',
        href: '/dashboard#sources',
        icon: faSatelliteDish,
        permission: 'sources.read',
      },
      {
        id: 'extract',
        label: 'صف استخراج',
        href: '/dashboard#extract',
        icon: faCompass,
        permission: 'jobs.read',
        badge: '۱۲',
      },
      {
        id: 'library',
        label: 'کتابخانه محتوا',
        href: '/dashboard#library',
        icon: faFileLines,
        permission: 'content.read',
      },
      {
        id: 'search',
        label: 'جست‌وجوی پیشرفته',
        href: '/dashboard#search',
        icon: faMagnifyingGlass,
        permission: 'search.use',
      },
    ],
  },
  {
    id: 'create',
    label: 'تولید و انتشار',
    items: [
      {
        id: 'ai',
        label: 'استودیو و هوش مصنوعی',
        href: '/dashboard#studio',
        icon: faRobot,
        permission: 'content.transform',
      },
      {
        id: 'transfer',
        label: 'انتقال محتوا',
        href: '/dashboard#transfer',
        icon: faArrowRightArrowLeft,
        permission: 'publish.plan',
      },
      {
        id: 'calendar',
        label: 'تقویم انتشار',
        href: '/dashboard#calendar',
        icon: faCalendarDays,
        permission: 'schedule.read',
      },
    ],
  },
  {
    id: 'insight',
    label: 'تحلیل و مدیریت',
    items: [
      {
        id: 'analytics',
        label: 'ترند و تحلیل رقبا',
        href: '/dashboard#analytics',
        icon: faChartLine,
        permission: 'analytics.read',
      },
      {
        id: 'graph',
        label: 'گراف ارتباط',
        href: '/dashboard#graph',
        icon: faCircleNodes,
        permission: 'graph.read',
      },
      {
        id: 'accounts',
        label: 'حساب‌ها و دسترسی',
        href: '/dashboard#accounts',
        icon: faUsersGear,
        permission: 'accounts.read',
      },
      {
        id: 'audit',
        label: 'امنیت و ممیزی',
        href: '/dashboard#audit',
        icon: faShieldHalved,
        permission: 'audit.read',
      },
    ],
  },
];

export const allNavigationItems = navigationGroups.flatMap((group) => group.items);
