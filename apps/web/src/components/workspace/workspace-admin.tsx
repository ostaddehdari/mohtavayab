'use client';

import {
  faArrowRight,
  faBars,
  faCheck,
  faChevronLeft,
  faCircleCheck,
  faCopy,
  faEllipsisVertical,
  faGear,
  faKey,
  faMagnifyingGlass,
  faRobot,
  faShieldHalved,
  faUserPlus,
  faUsers,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type FormEvent } from 'react';

type Tab = 'members' | 'roles' | 'invitations' | 'service';

const initialMembers = [
  {
    name: 'علی رضایی',
    email: 'ali@hadi.ir',
    role: 'مالک',
    status: 'فعال',
    avatar: 'ع',
    tone: 'cyan',
  },
  {
    name: 'مریم کریمی',
    email: 'maryam@hadi.ir',
    role: 'مدیر',
    status: 'فعال',
    avatar: 'م',
    tone: 'violet',
  },
  {
    name: 'رضا احمدی',
    email: 'reza@hadi.ir',
    role: 'تحلیل‌گر',
    status: 'فعال',
    avatar: 'ر',
    tone: 'amber',
  },
  {
    name: 'زهرا اکبری',
    email: 'zahra@hadi.ir',
    role: 'ناشر',
    status: 'فعال',
    avatar: 'ز',
    tone: 'green',
  },
];

const roles = [
  ['مالک', 'همهٔ مجوزها و مالکیت فضای کاری', '۱ عضو', '۱۶ مجوز'],
  ['مدیر', 'اعضا، منابع، محتوا و حساب‌های خدمت', '۱ عضو', '۱۵ مجوز'],
  ['تحلیل‌گر', 'مشاهده منابع، محتوا و تحلیل‌ها', '۱ عضو', '۵ مجوز'],
  ['ویراستار', 'مشاهده و ویرایش نسخه‌های محتوا', '۰ عضو', '۵ مجوز'],
  ['ناشر', 'ویرایش، تأیید و انتشار محتوا', '۱ عضو', '۶ مجوز'],
  ['مشاهده‌گر', 'دسترسی فقط‌خواندنی به محتوا', '۰ عضو', '۲ مجوز'],
];

export function WorkspaceAdmin() {
  const [compact, setCompact] = useState(false);
  const [tab, setTab] = useState<Tab>('members');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invited, setInvited] = useState<string[]>(['editor@hadi.ir']);
  const [serviceSecret, setServiceSecret] = useState('');

  const submitInvite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const emailValue = data.get('email');
    const email = typeof emailValue === 'string' ? emailValue.trim() : '';
    if (email) setInvited((items) => [email, ...items]);
    setInviteOpen(false);
  };

  const createService = () => {
    setServiceSecret('mhsa_Q7j3…N9xK');
  };

  return (
    <div className={`workspace-console ${compact ? 'workspace-console--compact' : ''}`}>
      <aside className="workspace-rail" aria-label="تنظیمات فضای کاری">
        <div className="workspace-rail__brand">
          <Link href="/" aria-label="هادی، صفحه اصلی">
            <span>ه</span>
            {!compact && <strong>هادی</strong>}
          </Link>
          <button
            type="button"
            aria-label={compact ? 'بازکردن سایدبار' : 'جمع‌کردن سایدبار'}
            onClick={() => setCompact((value) => !value)}
          >
            <FontAwesomeIcon icon={compact ? faChevronLeft : faBars} />
          </button>
        </div>
        <div className="workspace-identity">
          <span>هـ</span>
          {!compact && (
            <div>
              <small>فضای کاری فعال</small>
              <strong>رسانه هادی</strong>
              <b>پلن حرفه‌ای</b>
            </div>
          )}
        </div>
        <nav>
          <button
            className={tab === 'members' ? 'active' : ''}
            onClick={() => setTab('members')}
            type="button"
          >
            <FontAwesomeIcon icon={faUsers} />
            {!compact && 'اعضا'}
          </button>
          <button
            className={tab === 'roles' ? 'active' : ''}
            onClick={() => setTab('roles')}
            type="button"
          >
            <FontAwesomeIcon icon={faShieldHalved} />
            {!compact && 'نقش‌ها و مجوزها'}
          </button>
          <button
            className={tab === 'invitations' ? 'active' : ''}
            onClick={() => setTab('invitations')}
            type="button"
          >
            <FontAwesomeIcon icon={faUserPlus} />
            {!compact && 'دعوت‌ها'}
            {!compact && <b>{invited.length}</b>}
          </button>
          <button
            className={tab === 'service' ? 'active' : ''}
            onClick={() => setTab('service')}
            type="button"
          >
            <FontAwesomeIcon icon={faRobot} />
            {!compact && 'حساب‌های خدمت'}
          </button>
        </nav>
        <div className="workspace-rail__footer">
          <FontAwesomeIcon icon={faGear} />
          {!compact && (
            <span>
              <strong>تنظیمات عمومی</strong>
              <small>نام، نشان و سیاست‌ها</small>
            </span>
          )}
        </div>
      </aside>

      <div className="workspace-content">
        <header className="workspace-topbar">
          <div>
            <Link href="/dashboard">
              <FontAwesomeIcon icon={faArrowRight} /> بازگشت به داشبورد
            </Link>
            <span>/</span>
            <b>تنظیمات فضای کاری</b>
          </div>
          <div className="workspace-user">
            <span>ع</span>
            <div>
              <strong>علی رضایی</strong>
              <small>مالک فضای کاری</small>
            </div>
          </div>
        </header>

        <main id="main-content" className="workspace-main">
          <div className="workspace-heading">
            <div>
              <p>مدیریت تیم</p>
              <h1>
                {tab === 'members'
                  ? 'اعضای فضای کاری'
                  : tab === 'roles'
                    ? 'نقش‌ها و مجوزها'
                    : tab === 'invitations'
                      ? 'دعوت‌های در انتظار'
                      : 'حساب‌های خدمت'}
              </h1>
              <span>دسترسی هر شخص و سرویس را دقیق، قابل‌ردیابی و مستقل مدیریت کنید.</span>
            </div>
            <button
              className="button button--primary"
              type="button"
              onClick={() => setInviteOpen(true)}
            >
              <FontAwesomeIcon icon={faUserPlus} /> دعوت عضو جدید
            </button>
          </div>

          <section className="workspace-stats" aria-label="خلاصه فضای کاری">
            <article>
              <i>
                <FontAwesomeIcon icon={faUsers} />
              </i>
              <div>
                <small>اعضای فعال</small>
                <strong>۴</strong>
                <span>از ۲۰ صندلی</span>
              </div>
            </article>
            <article>
              <i>
                <FontAwesomeIcon icon={faShieldHalved} />
              </i>
              <div>
                <small>نقش‌های فعال</small>
                <strong>۶</strong>
                <span>کنترل‌شده با RBAC</span>
              </div>
            </article>
            <article>
              <i>
                <FontAwesomeIcon icon={faUserPlus} />
              </i>
              <div>
                <small>دعوت باز</small>
                <strong>{invited.length}</strong>
                <span>انقضا پس از ۷۲ ساعت</span>
              </div>
            </article>
            <article>
              <i>
                <FontAwesomeIcon icon={faCircleCheck} />
              </i>
              <div>
                <small>وضعیت امنیت</small>
                <strong>عالی</strong>
                <span>مرز Tenant فعال</span>
              </div>
            </article>
          </section>

          <AnimatePresence mode="wait">
            {tab === 'members' && (
              <motion.section
                key="members"
                className="workspace-panel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="workspace-panel__head">
                  <div>
                    <h2>فهرست اعضا</h2>
                    <p>هر عضو فقط داده‌های فضای کاری مجاز خود را می‌بیند.</p>
                  </div>
                  <label>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    <span className="sr-only">جست‌وجوی اعضا</span>
                    <input type="search" placeholder="جست‌وجوی نام یا ایمیل…" />
                  </label>
                </div>
                <div className="workspace-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>عضو</th>
                        <th>نقش</th>
                        <th>وضعیت</th>
                        <th>آخرین فعالیت</th>
                        <th>
                          <span className="sr-only">عملیات</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {initialMembers.map((member, index) => (
                        <tr key={member.email}>
                          <td>
                            <span className={`member-avatar member-avatar--${member.tone}`}>
                              {member.avatar}
                            </span>
                            <div>
                              <strong>{member.name}</strong>
                              <small>{member.email}</small>
                            </div>
                          </td>
                          <td>
                            <button type="button" className="role-chip">
                              {member.role} <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                          </td>
                          <td>
                            <span className="member-status">
                              <i />
                              {member.status}
                            </span>
                          </td>
                          <td>{index === 0 ? 'هم‌اکنون' : `${index * 2} ساعت پیش`}</td>
                          <td>
                            <button
                              type="button"
                              className="quiet-icon"
                              aria-label={`عملیات ${member.name}`}
                            >
                              <FontAwesomeIcon icon={faEllipsisVertical} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.section>
            )}

            {tab === 'roles' && (
              <motion.section
                key="roles"
                className="role-grid"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {roles.map(([name, description, count, permissions], index) => (
                  <article key={name}>
                    <div>
                      <i>
                        <FontAwesomeIcon icon={index < 2 ? faKey : faShieldHalved} />
                      </i>
                      <span>
                        <strong>{name}</strong>
                        <small>{description}</small>
                      </span>
                    </div>
                    <footer>
                      <b>{count}</b>
                      <span>{permissions}</span>
                      <button type="button">مشاهده جزئیات</button>
                    </footer>
                  </article>
                ))}
              </motion.section>
            )}

            {tab === 'invitations' && (
              <motion.section
                key="invites"
                className="workspace-panel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="workspace-panel__head">
                  <div>
                    <h2>دعوت‌های فعال</h2>
                    <p>پیوندها یک‌بارمصرف‌اند و پس از ۷۲ ساعت منقضی می‌شوند.</p>
                  </div>
                </div>
                <div className="invite-list">
                  {invited.map((email, index) => (
                    <article key={email}>
                      <span>
                        <FontAwesomeIcon icon={faUserPlus} />
                      </span>
                      <div>
                        <strong>{email}</strong>
                        <small>{index ? 'ویراستار' : 'تحلیل‌گر'} · ارسال‌شده امروز</small>
                      </div>
                      <b>در انتظار</b>
                      <button type="button">لغو دعوت</button>
                    </article>
                  ))}
                </div>
              </motion.section>
            )}

            {tab === 'service' && (
              <motion.section
                key="service"
                className="workspace-panel service-account-panel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="workspace-panel__head">
                  <div>
                    <h2>حساب‌های خدمت</h2>
                    <p>برای Workerها و اتصال‌های ماشینی، با حداقل Scope لازم.</p>
                  </div>
                  <button type="button" className="button button--primary" onClick={createService}>
                    <FontAwesomeIcon icon={faKey} /> ساخت حساب
                  </button>
                </div>
                {serviceSecret ? (
                  <div className="one-time-secret" role="status">
                    <FontAwesomeIcon icon={faCheck} />
                    <div>
                      <strong>Secret فقط همین یک‌بار نمایش داده می‌شود</strong>
                      <code>{serviceSecret}</code>
                    </div>
                    <button type="button" aria-label="کپی Secret">
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                  </div>
                ) : (
                  <div className="service-empty">
                    <FontAwesomeIcon icon={faRobot} />
                    <h3>دسترسی ماشینی امن</h3>
                    <p>
                      Secret خام ذخیره نمی‌شود؛ فقط Hash کلیددار و Scopeهای مجاز نگهداری می‌شوند.
                    </p>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {inviteOpen && (
          <motion.div
            className="invite-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="invite-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="invite-title"
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96 }}
            >
              <button
                className="invite-close"
                type="button"
                aria-label="بستن"
                onClick={() => setInviteOpen(false)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
              <i>
                <FontAwesomeIcon icon={faUserPlus} />
              </i>
              <h2 id="invite-title">دعوت عضو جدید</h2>
              <p>نقش اولیه را انتخاب کنید؛ مدیر بعداً می‌تواند آن را تغییر دهد.</p>
              <form onSubmit={submitInvite}>
                <label>
                  ایمیل کاری
                  <input name="email" type="email" required placeholder="name@example.com" />
                </label>
                <label>
                  نقش
                  <select name="role">
                    <option>تحلیل‌گر</option>
                    <option>ویراستار</option>
                    <option>ناشر</option>
                    <option>مشاهده‌گر</option>
                    <option>مدیر</option>
                  </select>
                </label>
                <small>
                  <FontAwesomeIcon icon={faShieldHalved} /> دعوت برای امنیت بیشتر پس از ۷۲ ساعت
                  منقضی می‌شود.
                </small>
                <div>
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => setInviteOpen(false)}
                  >
                    انصراف
                  </button>
                  <button type="submit" className="button button--primary">
                    ارسال دعوت
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
