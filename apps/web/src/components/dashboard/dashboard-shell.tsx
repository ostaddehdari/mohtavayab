'use client';

import {
  faBars,
  faBell,
  faBolt,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faClock,
  faCloudArrowDown,
  faEllipsis,
  faMagnifyingGlass,
  faPlus,
  faRotate,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faTelegram, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MetricCard, StatusBadge, Surface } from '@mohtavayab/ui';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { navigationGroups } from '@/lib/navigation';

const providers = [
  {
    name: 'خبر فوری ایران',
    network: 'تلگرام',
    icon: faTelegram,
    color: '#37aee2',
    count: '۲,۴۸۰',
    status: 'همگام',
  },
  {
    name: 'روایت شهر',
    network: 'اینستاگرام',
    icon: faInstagram,
    color: '#e65b95',
    count: '۱,۱۲۰',
    status: 'همگام',
  },
  {
    name: 'کانال بازار',
    network: 'ایتا',
    icon: faBolt,
    color: '#f2a531',
    count: '۸۷۴',
    status: 'در انتظار',
  },
  {
    name: 'دیدبان فناوری',
    network: 'یوتیوب',
    icon: faYoutube,
    color: '#ff4e45',
    count: '۳۱۶',
    status: 'همگام',
  },
];

const queue = [
  {
    title: 'استخراج تاریخچه @IranPulse',
    meta: 'تلگرام · ۸,۳۴۰ پیام',
    progress: 76,
    time: '۸ دقیقه',
  },
  { title: 'پایش هشتگ #ایران', meta: 'اینستاگرام · جست‌وجوی زنده', progress: 44, time: '۱۴ دقیقه' },
  {
    title: 'همگام‌سازی کانال فناوری',
    meta: 'ایتا · ۲۴ فایل رسانه',
    progress: 18,
    time: '۲۲ دقیقه',
  },
];

function IconButton({
  label,
  icon,
  onClick,
  className = '',
}: {
  label: string;
  icon: typeof faBars;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      className={`icon-button ${className}`}
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  );
}

export function DashboardShell() {
  const [compact, setCompact] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/mohtavayab/api/workspaces/preferences', {
      credentials: 'include',
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : undefined))
      .then((preference: { sidebar_mode?: string } | undefined) => {
        if (preference?.sidebar_mode === 'compact') setCompact(true);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const toggleCompact = () => {
    setCompact((current) => {
      const next = !current;
      const csrf = document.cookie
        .split('; ')
        .find((item) => item.startsWith('mh_csrf='))
        ?.split('=')[1];
      void fetch('/mohtavayab/api/workspaces/preferences', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'content-type': 'application/json', ...(csrf ? { 'x-csrf-token': csrf } : {}) },
        body: JSON.stringify({ sidebar_mode: next ? 'compact' : 'expanded' }),
      }).catch(() => undefined);
      return next;
    });
  };

  return (
    <div className={`dashboard-shell ${compact ? 'dashboard-shell--compact' : ''}`}>
      <motion.aside
        className="dashboard-sidebar"
        aria-label="منوی داشبورد"
        animate={{ width: compact ? 'var(--sidebar-compact)' : 'var(--sidebar-expanded)' }}
        transition={{ duration: 0.24 }}
      >
        <div className="sidebar-head">
          <Link className="brand" href="/" aria-label="هادی، صفحه اصلی">
            <span className="brand-mark" aria-hidden="true">
              ه
            </span>
            <AnimatePresence initial={false}>
              {!compact && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <strong>هادی</strong>
                  <small>مرکز فرمان محتوا</small>
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <IconButton
            label={compact ? 'بازکردن سایدبار' : 'جمع‌کردن سایدبار'}
            icon={compact ? faChevronLeft : faChevronRight}
            onClick={toggleCompact}
          />
        </div>

        <nav className="sidebar-nav" aria-label="بخش‌های سامانه">
          {navigationGroups.map((group) => (
            <div className="nav-group" key={group.id}>
              {!compact && <span className="nav-group__label">{group.label}</span>}
              {group.items.map((item) => (
                <Link
                  className={item.id === 'overview' ? 'active' : ''}
                  href={item.href}
                  key={item.id}
                  title={compact ? item.label : undefined}
                >
                  <FontAwesomeIcon icon={item.icon} fixedWidth />
                  {!compact && <span>{item.label}</span>}
                  {!compact && item.badge && <b>{item.badge}</b>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-profile">
          <span className="avatar" aria-hidden="true">
            ع
          </span>
          {!compact && (
            <div>
              <strong>علی رضایی</strong>
              <small>مدیر فضای کاری</small>
            </div>
          )}
          {!compact && <FontAwesomeIcon icon={faEllipsis} />}
        </div>
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              className="mobile-backdrop"
              aria-label="بستن منو"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="mobile-drawer"
              aria-label="منوی موبایل"
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
            >
              <div className="sidebar-head">
                <span className="brand">
                  <span className="brand-mark">ه</span>
                  <span>
                    <strong>هادی</strong>
                    <small>مرکز فرمان محتوا</small>
                  </span>
                </span>
                <IconButton label="بستن منو" icon={faXmark} onClick={() => setMobileOpen(false)} />
              </div>
              <nav className="sidebar-nav">
                {navigationGroups
                  .flatMap((group) => group.items)
                  .map((item) => (
                    <Link
                      className={item.id === 'overview' ? 'active' : ''}
                      href={item.href}
                      key={item.id}
                      onClick={() => setMobileOpen(false)}
                    >
                      <FontAwesomeIcon icon={item.icon} fixedWidth />
                      <span>{item.label}</span>
                    </Link>
                  ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="dashboard-workspace">
        <header className="dashboard-header">
          <IconButton
            label="بازکردن منو"
            icon={faBars}
            className="mobile-menu-button"
            onClick={() => setMobileOpen(true)}
          />
          <form
            className="global-search"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <label className="sr-only" htmlFor="global-search">
              جست‌وجوی سراسری
            </label>
            <input id="global-search" type="search" placeholder="جست‌وجوی محتوا، منبع یا هشتگ…" />
            <kbd>Ctrl K</kbd>
          </form>
          <div className="header-actions">
            <button type="button" className="queue-status">
              <span className="pulse" /> صف سالم <b>۱۲</b>
            </button>
            <IconButton label="اعلان‌ها، ۳ مورد خوانده‌نشده" icon={faBell} />
            <Link href="/workspace" className="workspace-picker">
              <span className="avatar avatar--workspace">هـ</span>
              <span>
                <small>فضای کاری</small>
                <strong>رسانه هادی</strong>
              </span>
              <FontAwesomeIcon icon={faChevronLeft} />
            </Link>
          </div>
        </header>

        <main id="main-content" className="dashboard-main">
          <div className="dashboard-titlebar">
            <div>
              <p>یکشنبه، ۱۷ آبان ۱۴۰۵</p>
              <h1>صبح بخیر، علی 👋</h1>
              <span>
                سامانه در ۲۴ ساعت گذشته <strong>۴,۷۹۰ محتوای تازه</strong> پیدا کرده است.
              </span>
            </div>
            <div>
              <button className="button button--ghost" type="button">
                <FontAwesomeIcon icon={faRotate} /> همگام‌سازی
              </button>
              <button className="button button--primary" type="button">
                <FontAwesomeIcon icon={faPlus} /> استخراج جدید
              </button>
            </div>
          </div>

          <section className="metrics-grid" aria-label="شاخص‌های کلیدی">
            <MetricCard label="محتوای امروز" value="۴,۷۹۰" hint="۱۲.۴٪ بیشتر از دیروز" />
            <MetricCard label="منابع فعال" value="۱۸ / ۲۰" hint="۲ منبع نیازمند توجه" />
            <MetricCard label="انتقال موفق" value="۹۸.۷٪" hint="۱,۸۴۰ انتشار این هفته" />
            <MetricCard label="اعتبار پردازش" value="۷۶٪" hint="۲۴,۶۰۰ عملیات باقی‌مانده" />
          </section>

          <div className="dashboard-grid dashboard-grid--main">
            <Surface className="activity-chart" aria-labelledby="activity-title">
              <div className="panel-head">
                <div>
                  <h2 id="activity-title">نبض محتوا</h2>
                  <p>حجم استخراج‌شده در هفت روز گذشته</p>
                </div>
                <select aria-label="بازه زمانی">
                  <option>۷ روز اخیر</option>
                  <option>۳۰ روز اخیر</option>
                </select>
              </div>
              <div className="chart-summary">
                <strong>۲۸,۴۳۰</strong>
                <span>کل محتوا</span>
                <StatusBadge tone="positive">↑ ۱۸.۲٪</StatusBadge>
              </div>
              <div
                className="line-chart"
                role="img"
                aria-label="نمودار روند افزایشی استخراج محتوا از شنبه تا جمعه"
              >
                <svg viewBox="0 0 720 210" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#22d3ee" stopOpacity=".35" />
                      <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    className="chart-area"
                    d="M0 174 C70 160 92 122 154 138 S250 116 308 126 S400 42 462 78 S560 103 610 55 S680 44 720 18 L720 210 L0 210 Z"
                  />
                  <path
                    className="chart-line"
                    d="M0 174 C70 160 92 122 154 138 S250 116 308 126 S400 42 462 78 S560 103 610 55 S680 44 720 18"
                  />
                </svg>
                <div className="chart-days">
                  <span>شنبه</span>
                  <span>یکشنبه</span>
                  <span>دوشنبه</span>
                  <span>سه‌شنبه</span>
                  <span>چهارشنبه</span>
                  <span>پنجشنبه</span>
                  <span>جمعه</span>
                </div>
              </div>
            </Surface>

            <Surface className="trend-panel" aria-labelledby="trend-title">
              <div className="panel-head">
                <div>
                  <h2 id="trend-title">ترندهای امروز</h2>
                  <p>پرتکرارترین موضوع‌ها</p>
                </div>
                <button type="button" className="text-action">
                  مشاهده همه
                </button>
              </div>
              <ol className="trend-list">
                <li>
                  <span>۱</span>
                  <div>
                    <strong>#ایران</strong>
                    <small>۱۲,۴۸۰ محتوا</small>
                  </div>
                  <b>+۲۴٪</b>
                </li>
                <li>
                  <span>۲</span>
                  <div>
                    <strong>هوش مصنوعی</strong>
                    <small>۸,۲۱۰ محتوا</small>
                  </div>
                  <b>+۱۸٪</b>
                </li>
                <li>
                  <span>۳</span>
                  <div>
                    <strong>اقتصاد دیجیتال</strong>
                    <small>۶,۷۴۰ محتوا</small>
                  </div>
                  <b>+۱۲٪</b>
                </li>
                <li>
                  <span>۴</span>
                  <div>
                    <strong>نمایشگاه رسانه</strong>
                    <small>۴,۰۹۰ محتوا</small>
                  </div>
                  <b>+۹٪</b>
                </li>
              </ol>
            </Surface>
          </div>

          <div className="dashboard-grid dashboard-grid--lower">
            <Surface id="extract" className="queue-panel" aria-labelledby="queue-title">
              <div className="panel-head">
                <div>
                  <h2 id="queue-title">صف استخراج فعال</h2>
                  <p>۳ عملیات در حال اجرا، ۹ عملیات در انتظار</p>
                </div>
                <Link className="text-action" href="#extract">
                  مدیریت صف
                </Link>
              </div>
              <div className="queue-list">
                {queue.map((job) => (
                  <article key={job.title}>
                    <div className="job-icon">
                      <FontAwesomeIcon icon={faCloudArrowDown} />
                    </div>
                    <div className="job-detail">
                      <strong>{job.title}</strong>
                      <small>{job.meta}</small>
                      <div className="progress">
                        <span style={{ width: `${job.progress}%` }} />
                      </div>
                    </div>
                    <div className="job-time">
                      <b>{job.progress}٪</b>
                      <small>
                        <FontAwesomeIcon icon={faClock} /> {job.time}
                      </small>
                    </div>
                  </article>
                ))}
              </div>
            </Surface>

            <Surface id="sources" className="source-panel" aria-labelledby="sources-title">
              <div className="panel-head">
                <div>
                  <h2 id="sources-title">منابع زیر نظر</h2>
                  <p>آخرین وضعیت اتصال و استخراج</p>
                </div>
                <button className="text-action" type="button">
                  افزودن منبع
                </button>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>منبع</th>
                      <th>شبکه</th>
                      <th>محتوا</th>
                      <th>وضعیت</th>
                      <th>
                        <span className="sr-only">عملیات</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((provider) => (
                      <tr key={provider.name}>
                        <td>
                          <span className="provider-icon" style={{ color: provider.color }}>
                            <FontAwesomeIcon icon={provider.icon} />
                          </span>
                          <strong>{provider.name}</strong>
                        </td>
                        <td>{provider.network}</td>
                        <td>{provider.count}</td>
                        <td>
                          <span
                            className={
                              provider.status === 'همگام'
                                ? 'table-status table-status--ok'
                                : 'table-status table-status--wait'
                            }
                          >
                            <FontAwesomeIcon
                              icon={provider.status === 'همگام' ? faCircleCheck : faClock}
                            />{' '}
                            {provider.status}
                          </span>
                        </td>
                        <td>
                          <IconButton label={`عملیات ${provider.name}`} icon={faEllipsis} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Surface>
          </div>
        </main>
      </div>
    </div>
  );
}
