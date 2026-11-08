'use client';

import {
  faArrowLeft,
  faAt,
  faCheck,
  faEye,
  faEyeSlash,
  faFingerprint,
  faKey,
  faLock,
  faShieldHalved,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type FormEvent } from 'react';

type Mode = 'login' | 'register' | 'recovery' | 'mfa';
type Notice = { tone: 'success' | 'error'; message: string };

const apiBase = '/mohtavayab/api/auth';

function deviceId(): string {
  const key = 'mohtavayab-device-id';
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const next = `web_${window.crypto.randomUUID().replaceAll('-', '')}`;
  window.localStorage.setItem(key, next);
  return next;
}

export function AuthExperience() {
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [challengeId, setChallengeId] = useState('');

  const changeMode = (next: Mode) => {
    setMode(next);
    setNotice(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setNotice(null);
    const form = new FormData(event.currentTarget);
    try {
      if (mode === 'register') {
        const response = await fetch(`${apiBase}/register`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            display_name: form.get('display_name'),
            email: form.get('email'),
            password: form.get('password'),
            accept_terms: form.get('accept_terms') === 'on',
          }),
        });
        if (!response.ok) throw new Error('ثبت‌نام انجام نشد؛ اطلاعات را دوباره بررسی کنید.');
        changeMode('login');
        setNotice({ tone: 'success', message: 'حساب ساخته شد؛ اکنون وارد شوید.' });
      } else if (mode === 'login') {
        const response = await fetch(`${apiBase}/login`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            email: form.get('email'),
            password: form.get('password'),
            device_id: deviceId(),
            remember_device: form.get('remember_device') === 'on',
          }),
        });
        const result = (await response.json()) as { status?: string; challenge_id?: string };
        if (!response.ok) throw new Error('ایمیل یا رمز عبور صحیح نیست.');
        if (result.status === 'mfa_required' && result.challenge_id) {
          setChallengeId(result.challenge_id);
          changeMode('mfa');
        } else {
          window.location.assign('/mohtavayab/dashboard');
        }
      } else if (mode === 'mfa') {
        const response = await fetch(`${apiBase}/mfa/verify`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ challenge_id: challengeId, code: form.get('code') }),
        });
        if (!response.ok) throw new Error('کد تأیید معتبر نیست یا منقضی شده است.');
        window.location.assign('/mohtavayab/dashboard');
      } else {
        const response = await fetch(`${apiBase}/password/recovery/request`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email: form.get('email') }),
        });
        if (!response.ok) throw new Error('درخواست بازیابی ثبت نشد.');
        setNotice({
          tone: 'success',
          message: 'اگر این ایمیل ثبت شده باشد، راهنمای بازیابی برای آن ارسال می‌شود.',
        });
      }
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : 'خطای ناشناخته',
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <main id="main-content" className="auth-shell">
      <section className="auth-brand-panel" aria-labelledby="auth-brand-title">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            ه
          </span>
          <span>
            <strong>هادی</strong>
            <small>مرکز فرمان محتوا</small>
          </span>
        </Link>
        <div className="auth-brand-copy">
          <span className="eyebrow">
            <i /> امنیت از اولین ورود
          </span>
          <h1 id="auth-brand-title">
            داده‌های شما،
            <br />
            زیر فرمان شما.
          </h1>
          <p>
            هویت، دستگاه و نشست‌ها در یک لایهٔ امنیتی مستقل محافظت می‌شوند؛ بدون نگهداری توکن یا IP
            خام.
          </p>
        </div>
        <ul className="auth-trust-list">
          <li>
            <FontAwesomeIcon icon={faCheck} />
            <span>
              <strong>ورود چندمرحله‌ای</strong>
              <small>TOTP و کدهای بازیابی یک‌بارمصرف</small>
            </span>
          </li>
          <li>
            <FontAwesomeIcon icon={faCheck} />
            <span>
              <strong>نشست‌های قابل کنترل</strong>
              <small>خروج از دستگاه‌های دیگر در هر زمان</small>
            </span>
          </li>
          <li>
            <FontAwesomeIcon icon={faCheck} />
            <span>
              <strong>تشخیص رفتار مشکوک</strong>
              <small>ارزیابی دستگاه و محدودهٔ شبکه بدون IP خام</small>
            </span>
          </li>
        </ul>
        <small className="auth-copyright">هادی / محتوا‌یاب · طراحی امن برای تیم‌های رسانه‌ای</small>
      </section>

      <section className="auth-form-panel" aria-live="polite">
        <div className="auth-mobile-brand">
          <Link className="brand" href="/">
            <span className="brand-mark">ه</span>
            <span>
              <strong>هادی</strong>
              <small>مرکز فرمان محتوا</small>
            </span>
          </Link>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            className="auth-card"
            key={mode}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {mode === 'login' && <LoginHeader />}
            {mode === 'register' && <RegisterHeader />}
            {mode === 'recovery' && <RecoveryHeader />}
            {mode === 'mfa' && <MfaHeader />}

            {notice && (
              <div className={`auth-notice auth-notice--${notice.tone}`} role="status">
                {notice.message}
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={(event) => {
                void submit(event);
              }}
            >
              {mode === 'register' && (
                <Field
                  name="display_name"
                  label="نام و نام خانوادگی"
                  type="text"
                  icon={faUser}
                  autoComplete="name"
                />
              )}
              {mode !== 'mfa' && (
                <Field
                  name="email"
                  label="ایمیل کاری"
                  type="email"
                  icon={faAt}
                  autoComplete="email"
                />
              )}
              {(mode === 'login' || mode === 'register') && (
                <label className="auth-field">
                  <span>رمز عبور</span>
                  <div>
                    <FontAwesomeIcon icon={faLock} />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={mode === 'register' ? 12 : 1}
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                      placeholder={
                        mode === 'register'
                          ? 'حداقل ۱۲ نویسه، شامل حرف و عدد'
                          : 'رمز عبور خود را وارد کنید'
                      }
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'پنهان‌کردن رمز' : 'نمایش رمز'}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </label>
              )}
              {mode === 'mfa' && (
                <Field
                  name="code"
                  label="کد شش‌رقمی یا کد بازیابی"
                  type="text"
                  icon={faKey}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              )}

              {mode === 'login' && (
                <div className="auth-options">
                  <label>
                    <input name="remember_device" type="checkbox" /> این دستگاه را به خاطر بسپار
                  </label>
                  <button type="button" onClick={() => changeMode('recovery')}>
                    رمز را فراموش کرده‌اید؟
                  </button>
                </div>
              )}
              {mode === 'register' && (
                <label className="terms-check">
                  <input name="accept_terms" type="checkbox" required /> قوانین استفاده و سیاست حریم
                  خصوصی را می‌پذیرم.
                </label>
              )}

              <button
                className="button button--primary auth-submit"
                type="submit"
                disabled={pending}
              >
                {pending
                  ? 'در حال بررسی…'
                  : mode === 'login'
                    ? 'ورود امن'
                    : mode === 'register'
                      ? 'ساخت حساب'
                      : mode === 'mfa'
                        ? 'تأیید و ورود'
                        : 'ارسال راهنمای بازیابی'}
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
            </form>

            {mode === 'login' && (
              <>
                <div className="auth-divider">
                  <span>یا ادامه با</span>
                </div>
                <a className="oidc-button" href={`${apiBase}/oidc/google/start`}>
                  <FontAwesomeIcon icon={faGoogle} /> Google
                </a>
              </>
            )}
            <div className="auth-switch">
              {mode === 'login' ? (
                <>
                  حساب ندارید؟{' '}
                  <button type="button" onClick={() => changeMode('register')}>
                    ثبت‌نام رایگان
                  </button>
                </>
              ) : mode === 'register' ? (
                <>
                  قبلاً ثبت‌نام کرده‌اید؟{' '}
                  <button type="button" onClick={() => changeMode('login')}>
                    وارد شوید
                  </button>
                </>
              ) : (
                <>
                  بازگشت به{' '}
                  <button type="button" onClick={() => changeMode('login')}>
                    صفحه ورود
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
}

function LoginHeader() {
  return (
    <div className="auth-heading">
      <span className="auth-heading__icon">
        <FontAwesomeIcon icon={faFingerprint} />
      </span>
      <h2>خوش آمدید</h2>
      <p>برای ادامه وارد فضای کاری خود شوید.</p>
    </div>
  );
}
function RegisterHeader() {
  return (
    <div className="auth-heading">
      <span className="auth-heading__icon">
        <FontAwesomeIcon icon={faUser} />
      </span>
      <h2>ساخت حساب هادی</h2>
      <p>در چند ثانیه اتاق فرمان محتوای خود را بسازید.</p>
    </div>
  );
}
function RecoveryHeader() {
  return (
    <div className="auth-heading">
      <span className="auth-heading__icon">
        <FontAwesomeIcon icon={faKey} />
      </span>
      <h2>بازیابی دسترسی</h2>
      <p>ایمیل حساب را وارد کنید؛ پاسخ برای همه یکسان و امن است.</p>
    </div>
  );
}
function MfaHeader() {
  return (
    <div className="auth-heading">
      <span className="auth-heading__icon">
        <FontAwesomeIcon icon={faShieldHalved} />
      </span>
      <h2>تأیید دومرحله‌ای</h2>
      <p>کد برنامهٔ Authenticator یا یکی از کدهای بازیابی را وارد کنید.</p>
    </div>
  );
}

function Field({
  name,
  label,
  type,
  icon,
  autoComplete,
  inputMode,
}: {
  name: string;
  label: string;
  type: string;
  icon: typeof faUser;
  autoComplete: string;
  inputMode?: 'numeric';
}) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div>
        <FontAwesomeIcon icon={icon} />
        <input
          name={name}
          type={type}
          required
          autoComplete={autoComplete}
          inputMode={inputMode}
          placeholder={label}
        />
      </div>
    </label>
  );
}
