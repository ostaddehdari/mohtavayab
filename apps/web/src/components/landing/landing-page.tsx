'use client';

import {
  faArrowLeft,
  faCheck,
  faCirclePlay,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'motion/react';
import { NetworkCanvas } from './network-canvas';
import { SmoothScroll } from './smooth-scroll';
import { StoryReveal } from './story-reveal';

const RiveTransfer = dynamic(
  () => import('./rive-transfer').then((module) => module.RiveTransfer),
  {
    ssr: false,
    loading: () => <div className="rive-loading" aria-label="در حال آماده‌سازی نمونه تعاملی" />,
  },
);

const workflow = [
  {
    number: '۰۱',
    title: 'رصد و استخراج',
    text: 'کانال، پیج، کلیدواژه و رقبا را از یک ورودی کنترل کنید.',
  },
  {
    number: '۰۲',
    title: 'جست‌وجو و تحلیل',
    text: 'محتوا، هشتگ، تعامل و ارتباط کاربران را در یک نمای واحد ببینید.',
  },
  {
    number: '۰۳',
    title: 'بازآفرینی هوشمند',
    text: 'متن و رسانه را با قواعد شما پاک‌سازی، محدود یا بازنویسی کنید.',
  },
  {
    number: '۰۴',
    title: 'انتقال و زمان‌بندی',
    text: 'فهرست منتخب را برای مقصدهای مختلف آماده و زمان‌بندی کنید.',
  },
];

const engines = [
  ['Motion', 'تعامل‌های سریع رابط و سایدبار'],
  ['GSAP', 'روایت مرحله‌ای هنگام پیمایش'],
  ['Lenis', 'اسکرول نرم و هماهنگ صفحه'],
  ['Three.js', 'گراف سه‌بعدی شبکه‌ها'],
  ['Rive', 'وضعیت زندهٔ فرایند انتقال'],
];

export function LandingPage() {
  return (
    <SmoothScroll>
      <main id="main-content" className="landing-shell">
        <header className="landing-nav" aria-label="ناوبری اصلی">
          <Link className="brand" href="/" aria-label="هادی، صفحه اصلی">
            <span className="brand-mark" aria-hidden="true">
              ه
            </span>
            <span>
              <strong>هادی</strong>
              <small>مرکز فرمان محتوا</small>
            </span>
          </Link>
          <nav aria-label="بخش‌های صفحه">
            <a href="#capabilities">قابلیت‌ها</a>
            <a href="#workflow">گردش‌کار</a>
            <a href="#experience">تجربه کاربری</a>
          </nav>
          <Link className="button button--ghost" href="/dashboard">
            ورود به داشبورد
          </Link>
        </header>

        <section className="landing-hero" aria-labelledby="page-title">
          <div className="hero-copy">
            <motion.span
              className="eyebrow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <i aria-hidden="true" /> نسل تازهٔ مدیریت محتوای چندشبکه‌ای
            </motion.span>
            <motion.h1
              id="page-title"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              از <em>رصد</em> تا انتشار؛
              <br />
              همه‌چیز در یک اتاق فرمان
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.16 }}
            >
              داده‌های تلگرام، اینستاگرام، ایتا و دیگر شبکه‌ها را استخراج، تحلیل، ویرایش و در زمان
              درست منتشر کنید؛ بدون گم‌شدن میان ده‌ها ابزار.
            </motion.p>
            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
            >
              <Link className="button button--primary" href="/dashboard">
                مشاهده نمونه داشبورد <FontAwesomeIcon icon={faArrowLeft} />
              </Link>
              <a className="button button--text" href="#workflow">
                <FontAwesomeIcon icon={faCirclePlay} /> دیدن مسیر محتوا
              </a>
            </motion.div>
            <div className="trust-row" aria-label="ویژگی‌های کلیدی">
              <span>
                <FontAwesomeIcon icon={faCheck} /> راست‌چین و فارسی
              </span>
              <span>
                <FontAwesomeIcon icon={faCheck} /> چندکاربره و امن
              </span>
              <span>
                <FontAwesomeIcon icon={faCheck} /> قابل توسعه برای صدها Provider
              </span>
            </div>
          </div>
          <div className="hero-visual-wrap">
            <NetworkCanvas />
            <div className="live-card live-card--top">
              <span className="pulse" aria-hidden="true" />
              <div>
                <strong>رصد زنده</strong>
                <small>۱۸ منبع فعال</small>
              </div>
            </div>
            <div className="live-card live-card--bottom">
              <strong dir="ltr">+24.8%</strong>
              <small>رشد تعامل این هفته</small>
            </div>
          </div>
        </section>

        <section id="capabilities" className="signal-strip" aria-label="وضعیت نمونه سامانه">
          <div>
            <strong>۱۲۸,۴۳۰</strong>
            <span>محتوای پایش‌شده</span>
          </div>
          <div>
            <strong>۲۴</strong>
            <span>Provider آماده اتصال</span>
          </div>
          <div>
            <strong>۹۸.۷٪</strong>
            <span>سلامت صف پردازش</span>
          </div>
          <div>
            <strong>زیر ۲ دقیقه</strong>
            <span>تأخیر رصد زنده</span>
          </div>
        </section>

        <StoryReveal>
          <section id="workflow" className="story-section" aria-labelledby="workflow-title">
            <div className="section-heading">
              <span className="eyebrow">یک مسیر، چهار ایستگاه</span>
              <h2 id="workflow-title">
                محتوا را پیدا کنید؛
                <br />
                معنا را از آن بیرون بکشید.
              </h2>
              <p>هر مرحله قابل مشاهده، قابل توقف و قابل ممیزی است.</p>
            </div>
            <div className="story-steps">
              {workflow.map((step) => (
                <article data-story-step key={step.number}>
                  <span>{step.number}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </StoryReveal>

        <section id="experience" className="experience-section" aria-labelledby="experience-title">
          <div className="experience-copy">
            <span className="eyebrow">حرکت هدفمند، نه تزئینی</span>
            <h2 id="experience-title">پنج موتور؛ یک تجربهٔ یکپارچه</h2>
            <p>
              هر کتابخانه فقط جایی بارگذاری می‌شود که ارزش واقعی ایجاد کند. کاربران حساس به حرکت نیز
              نسخهٔ آرام و ثابت رابط را دریافت می‌کنند.
            </p>
            <ul>
              {engines.map(([name, role]) => (
                <li key={name}>
                  <strong>{name}</strong>
                  <span>{role}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rive-stage">
            <div className="rive-stage__header">
              <span>انتقال هوشمند</span>
              <span className="status-online">در حال اجرا</span>
            </div>
            <RiveTransfer />
            <div className="transfer-progress">
              <span style={{ width: '72%' }} />
              <small>۷۲٪ آمادهٔ انتشار</small>
            </div>
          </div>
        </section>

        <section className="landing-cta" aria-labelledby="cta-title">
          <FontAwesomeIcon icon={faShieldHalved} />
          <div>
            <span className="eyebrow">کنترل در اختیار شماست</span>
            <h2 id="cta-title">نمونهٔ تعاملی داشبورد را ببینید.</h2>
            <p>سایدبار راست، نمای عملیات، صف استخراج، منابع و برنامهٔ انتشار در یک قاب.</p>
          </div>
          <Link className="button button--primary" href="/dashboard">
            ورود به اتاق فرمان <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
        </section>

        <footer className="landing-footer">
          <span>هادی / محتوا‌یاب</span>
          <small>طراحی‌شده برای مدیریت حرفه‌ای محتوای فارسی</small>
        </footer>
      </main>
    </SmoothScroll>
  );
}
