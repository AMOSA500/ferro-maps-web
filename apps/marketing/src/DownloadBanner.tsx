import downloadBanner from './assets/download-banner.png'

function AppleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83z" />
      <path d="M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

function GooglePlayIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3.18 23.76c.3.17.64.24.99.2l12.6-7.27-2.75-2.75-10.84 9.82z" fill="#EA4335"/>
      <path d="M22.33 10.5L19.37 8.8l-3.09 3.09 3.09 3.09 2.99-1.72c.85-.49.85-1.77-.03-2.26z" fill="#FBBC04"/>
      <path d="M2.17.24C1.8.45 1.54.86 1.54 1.4v21.2c0 .54.26.95.63 1.16l12.6-11.64L2.17.24z" fill="#4285F4"/>
      <path d="M3.17.24l12.6 11.48-2.75 2.75L.63 1.16C.26.95 0 .54 0 0 0-.54.26-.95.63-1.16L3.17.24z" fill="#34A853"/>
    </svg>
  )
}

export default function DownloadBanner() {
  const btnBase =
    'flex items-center justify-center gap-2 bg-black text-white rounded-md px-4 py-2 w-auto inline-flex'

  return (
    <section
      id="download-banner"
      className="bg-ferro-primary overflow-hidden"
    >
      {/* Backward-compat anchor — scrollTo('download') from Hero/Header finds this */}
      <div id="download" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-16 py-8 md:py-0 md:h-[350px] flex flex-col md:flex-row md:items-center">

        {/* Bird — lg and above only, sits at bottom-left of banner */}
        <div className="hidden lg:block absolute bottom-4 left-[7%] h-80 w-[30%] overflow-hidden">
          <img
            src={downloadBanner}
            alt="Ferro Maps mascot"
            className="h-full w-auto object-contain"
          />
        </div>

        {/* Content — pushed right to clear the bird */}
        <div className="w-full lg:w-[60%] relative z-10 lg:ml-auto">
          <h2 className="text-white font-bold text-[32px] md:text-[42px] leading-tight">
            Start earning smarter{' '}
            <span className="text-ferro-signal">today.</span>
          </h2>

          <p className="text-black text-[18px] md:text-[20px] font-medium leading-tight mt-5 mb-6 w-full">
            Join Ferro Maps and know where demand is highest before you drive there.
          </p>

          <div className="flex flex-row items-center justify-center gap-3 md:gap-4">
            <a
              href="https://apps.apple.com/gb/app/ferromaps/id6783352319"
              target="_blank"
              rel="noopener noreferrer"
              className={btnBase}
            >
              <AppleIcon />
              <div className="flex flex-col leading-none">
                <span className="text-[7px] text-neutral-300">Download on the</span>
                <span className="text-[14px] font-semibold">App Store</span>
              </div>
            </a>

            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className={btnBase}
            >
              <GooglePlayIcon />
              <div className="flex flex-col leading-none">
                <span className="text-[7px] text-neutral-300">GET IT ON</span>
                <span className="text-[14px] font-semibold">Google Play</span>
              </div>
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
