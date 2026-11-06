const foundations = [
  {
    title: 'چندمستاجری امن',
    text: 'مرزبندی Workspace و کنترل دسترسی از ابتدا در معماری لحاظ شده است.',
  },
  {
    title: 'Providerهای ایزوله',
    text: 'هر شبکه در Runner مستقل اجرا می‌شود و به داده‌های هسته دسترسی مستقیم ندارد.',
  },
  {
    title: 'گردش‌کار پایدار',
    text: 'استخراج، انتظار و انتشار برای بازیابی پس از قطع طراحی شده‌اند.',
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="hero" aria-labelledby="page-title">
        <span className="eyebrow">هادی / محتوا‌یاب</span>
        <h1 id="page-title">زیرساخت هوشمند مدیریت محتوای چندشبکه‌ای</h1>
        <p>
          اسکلت اجرایی پروژه آماده است. اتصال حساب، استخراج، جست‌وجوی فارسی، تحلیل و انتشار
          زمان‌بندی‌شده در استیج‌های بعد روی همین پایه ساخته می‌شوند.
        </p>
        <div className="status" role="status">
          <span aria-hidden="true" />
          محیط توسعه S04 آمادهٔ توسعه است
        </div>
      </section>

      <section className="grid" aria-label="پایه‌های معماری">
        {foundations.map((item) => (
          <article key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
