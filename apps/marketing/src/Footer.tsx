import { Link } from 'react-router-dom'

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
)

const GooglePlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3.18 23.76c.3.17.64.24.99.2l12.6-7.27-2.75-2.75-10.84 9.82z" fill="#EA4335"/>
    <path d="M22.33 10.5L19.37 8.8l-3.09 3.09 3.09 3.09 2.99-1.72c.85-.49.85-1.77-.03-2.26z" fill="#FBBC04"/>
    <path d="M2.17.24C1.8.45 1.54.86 1.54 1.4v21.2c0 .54.26.95.63 1.16l12.6-11.64L2.17.24z" fill="#4285F4"/>
    <path d="M3.17.24l12.6 11.48-2.75 2.75L.63 1.16C.26.95 0 .54 0 0 0-.54.26-.95.63-1.16L3.17.24z" fill="#34A853"/>
  </svg>
)

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

const overline =
  'text-[11px] font-semibold text-neutral-500 tracking-widest uppercase'

const navLink =
  'text-[12px] text-neutral-300 hover:font-bold hover:text-white transition-all duration-fast cursor-pointer'

export default function Footer() {
  const storeBtn =
    'flex items-center justify-center gap-2 bg-black text-white rounded-md px-4 py-2 w-auto inline-flex hover:-translate-y-0.5 transition-all duration-fast'

  return (
    <footer className="bg-surface-inverse text-white py-12 px-6 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-4 lg:gap-20 max-w-6xl mx-auto px-0 md:px-4 lg:px-10">

        <div>
          <p className={`${overline} mb-5`}>PRODUCT</p>
          <ul className="flex flex-col gap-3">
            {[
              { label: 'Why Ferro Maps', id: 'why-ferro-maps' },
              { label: 'How it works', id: 'how-it-works' },
              { label: 'Testimonials', id: 'driver-stories' },
            ].map(({ label, id }) => (
              <li key={id}>
                <span className={navLink} onClick={() => scrollTo(id)}>
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className={`${overline} mb-5`}>COMPANY</p>
          <ul className="flex flex-col gap-3">
            <li>
              <span className={navLink} onClick={() => scrollTo('contact')}>
                Contact
              </span>
            </li>
          </ul>
        </div>

        <div>
          <p className={`${overline} mb-5`}>LEGAL</p>
          <ul className="flex flex-col gap-3">
            {['Privacy Policy', 'Terms & Conditions', 'Cookies'].map((label) => (
              <li key={label}>
                {label === 'Privacy Policy' ? (
                  <Link to="/privacy-policy" className={navLink.replace('cursor-pointer', '')}>
                    {label}
                  </Link>
                ) : label === 'Terms & Conditions' ? (
                  <Link to="/terms-conditions" className={navLink.replace('cursor-pointer', '')}>
                    {label}
                  </Link>
                ) : (
                  <a href="#" className={navLink.replace('cursor-pointer', '')}>
                    {label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:-ml-10">
          <p className={`${overline} mb-5`}>DOWNLOAD THE APP</p>

          <div className="flex flex-row items-start gap-2 mb-7">
            <a
              href="https://apps.apple.com/gb/app/ferromaps/id6783352319"
              target="_blank"
              rel="noopener noreferrer"
              className={storeBtn}
            >
              <AppleIcon />
              <div className="flex flex-col leading-none">
                <span className="text-[7px] text-neutral-300">Download on the</span>
                <span className="text-[14px] font-bold whitespace-nowrap">App Store</span>
              </div>
            </a>

            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className={storeBtn}
            >
              <GooglePlayIcon />
              <div className="flex flex-col leading-none">
                <span className="text-[7px] text-neutral-300">GET IT ON</span>
                <span className="text-[14px] font-bold whitespace-nowrap">Google Play</span>
              </div>
            </a>
          </div>

          <p className={`${overline} mb-4`}>JOIN US</p>

          <div className="flex gap-4">
            <a href="#" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-neutral-300 hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            <a href="#" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-neutral-300 hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-700 mt-10 pt-5 max-w-6xl mx-auto px-0 md:px-4 lg:px-10 flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <p className="text-[11px] text-neutral-500">
          Ferro Maps @ 2026. All rights reserved.
        </p>

        <div className="flex flex-wrap gap-4 md:gap-6">
          <span className="text-[11px] text-neutral-500">All systems operational</span>
          <span className="text-[11px] text-neutral-500">London, United Kingdom</span>
          <span className="text-[11px] text-neutral-500">Made for drivers</span>
        </div>
      </div>
    </footer>
  )
}