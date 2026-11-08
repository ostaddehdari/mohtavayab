'use client';

import {
  faArrowRight,
  faCheck,
  faClock,
  faDesktop,
  faKey,
  faMobileScreen,
  faShieldHalved,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StatusBadge, Surface } from '@mohtavayab/ui';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useState } from 'react';

const sessions = [
  {
    id: 'current',
    label: 'Chrome روی Windows',
    location: 'شبکهٔ فعلی · همین دستگاه',
    time: 'اکنون',
    current: true,
    icon: faDesktop,
  },
  {
    id: 'mobile',
    label: 'Chrome روی Android',
    location: 'شبکهٔ شناخته‌شده',
    time: '۲ ساعت پیش',
    current: false,
    icon: faMobileScreen,
  },
];

export function SecurityCenter() {
  const [activeSessions, setActiveSessions] = useState(sessions);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  return (
    <main id="main-content" className="security-shell">
      <header className="security-topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">ه</span>
          <span>
            <strong>هادی</strong>
            <small>مرکز فرمان محتوا</small>
          </span>
        </Link>
        <Link className="button button--ghost" href="/dashboard">
          <FontAwesomeIcon icon={faArrowRight} /> بازگشت به داشبورد
        </Link>
      </header>
      <div className="security-container">
        <div className="security-heading">
          <div>
            <span className="eyebrow">مرکز امنیت حساب</span>
            <h1>امنیت و نشست‌ها</h1>
            <p>روش‌های ورود، دستگاه‌ها و رویدادهای حساس حساب را از اینجا کنترل کنید.</p>
          </div>
          <div className="security-score">
            <span>
              <FontAwesomeIcon icon={faShieldHalved} />
            </span>
            <div>
              <strong>{mfaEnabled ? 'عالی' : 'خوب'}</strong>
              <small>امتیاز امنیت حساب</small>
            </div>
          </div>
        </div>

        <section className="security-overview" aria-label="خلاصه امنیت">
          <Surface>
            <span className="security-state security-state--ok">
              <FontAwesomeIcon icon={faCheck} />
            </span>
            <div>
              <strong>رمز عبور امن</strong>
              <small>آخرین تغییر: ۳ روز پیش</small>
            </div>
            <StatusBadge tone="positive">فعال</StatusBadge>
          </Surface>
          <Surface>
            <span
              className={`security-state ${mfaEnabled ? 'security-state--ok' : 'security-state--warn'}`}
            >
              <FontAwesomeIcon icon={mfaEnabled ? faCheck : faTriangleExclamation} />
            </span>
            <div>
              <strong>تأیید دومرحله‌ای</strong>
              <small>{mfaEnabled ? 'Authenticator متصل است' : 'برای امنیت بیشتر فعال کنید'}</small>
            </div>
            <StatusBadge tone={mfaEnabled ? 'positive' : 'warning'}>
              {mfaEnabled ? 'فعال' : 'پیشنهادشده'}
            </StatusBadge>
          </Surface>
          <Surface>
            <span className="security-state security-state--ok">
              <FontAwesomeIcon icon={faDesktop} />
            </span>
            <div>
              <strong>دستگاه‌های شناخته‌شده</strong>
              <small>{activeSessions.length} نشست فعال</small>
            </div>
            <StatusBadge tone="info">زیر نظر</StatusBadge>
          </Surface>
        </section>

        <div className="security-grid">
          <Surface className="mfa-panel" aria-labelledby="mfa-title">
            <div className="security-panel-head">
              <span>
                <FontAwesomeIcon icon={faKey} />
              </span>
              <div>
                <h2 id="mfa-title">تأیید دومرحله‌ای</h2>
                <p>حتی در صورت افشای رمز عبور، ورود بدون کد دوم ممکن نیست.</p>
              </div>
            </div>
            <div className="mfa-visual">
              <div className="mfa-phone">
                <FontAwesomeIcon icon={faShieldHalved} />
                <span>۴ ۸ ۲ ۱ ۹ ۶</span>
                <small>کد هر ۳۰ ثانیه تغییر می‌کند</small>
              </div>
              <ul>
                <li>
                  <FontAwesomeIcon icon={faCheck} />
                  سازگار با Google/Microsoft Authenticator
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} />
                  ۱۰ کد بازیابی یک‌بارمصرف
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} />
                  راز رمزگذاری‌شده با AES-256-GCM
                </li>
              </ul>
            </div>
            <button
              className={`button ${mfaEnabled ? 'button--ghost' : 'button--primary'}`}
              type="button"
              onClick={() => setMfaEnabled((value) => !value)}
            >
              {mfaEnabled ? 'مدیریت کدهای بازیابی' : 'فعال‌سازی MFA'}
            </button>
          </Surface>

          <Surface className="sessions-panel" aria-labelledby="sessions-title">
            <div className="security-panel-head">
              <span>
                <FontAwesomeIcon icon={faDesktop} />
              </span>
              <div>
                <h2 id="sessions-title">نشست‌های فعال</h2>
                <p>اگر دستگاهی را نمی‌شناسید، همان لحظه دسترسی‌اش را قطع کنید.</p>
              </div>
            </div>
            <div className="session-list">
              {activeSessions.map((session) => (
                <motion.article layout key={session.id}>
                  <span className="session-device">
                    <FontAwesomeIcon icon={session.icon} />
                  </span>
                  <div>
                    <strong>
                      {session.label}
                      {session.current && <em>دستگاه فعلی</em>}
                    </strong>
                    <small>{session.location}</small>
                  </div>
                  <span className="session-time">
                    <FontAwesomeIcon icon={faClock} /> {session.time}
                  </span>
                  {!session.current && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveSessions((items) => items.filter((item) => item.id !== session.id))
                      }
                    >
                      خروج
                    </button>
                  )}
                </motion.article>
              ))}
            </div>
            <button
              className="text-action danger-action"
              type="button"
              onClick={() => setActiveSessions((items) => items.filter((item) => item.current))}
            >
              خروج از همهٔ دستگاه‌های دیگر
            </button>
          </Surface>
        </div>

        <Surface className="security-log" aria-labelledby="security-log-title">
          <div className="security-panel-head">
            <span>
              <FontAwesomeIcon icon={faClock} />
            </span>
            <div>
              <h2 id="security-log-title">آخرین رویدادهای امنیتی</h2>
              <p>هیچ IP، توکن یا کد یک‌بارمصرف خام در این گزارش ذخیره نمی‌شود.</p>
            </div>
          </div>
          <div className="security-events">
            <div>
              <span className="security-state security-state--ok">
                <FontAwesomeIcon icon={faCheck} />
              </span>
              <div>
                <strong>ورود موفق با رمز عبور</strong>
                <small>Chrome روی Windows · اکنون</small>
              </div>
            </div>
            <div>
              <span className="security-state">
                <FontAwesomeIcon icon={faKey} />
              </span>
              <div>
                <strong>رمز عبور تغییر کرد</strong>
                <small>۳ روز پیش</small>
              </div>
            </div>
          </div>
        </Surface>
      </div>
    </main>
  );
}
