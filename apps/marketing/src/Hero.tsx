import { useNavigate } from 'react-router-dom'
import heroPhoneScreen from './assets/hero-phone-screen.png.jpeg'

export default function Hero() {
  const navigate = useNavigate()

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" className="w-full bg-white min-h-screen flex items-center pt-10">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-16 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">

        {/* Left column */}
        <div>
          <h1 className="font-extrabold text-display text-neutral-900 font-nunito">
            <span id="hero-anchor-letter">N</span>avigation for
            <br />
            <span className="text-ferro-primary">Income.</span>
          </h1>

          <p className="text-body-lg text-neutral-700 mt-6 max-w-md">
            Know where demand is highest before you drive there. Position smarter. Earn more.
          </p>

          <div className="mt-10 flex gap-4">
            <button
              onClick={() => navigate('/waitlist')}
              className="bg-ferro-primary text-white rounded-button px-6 py-3 font-semibold hover:bg-ferro-deep transition-colors duration-fast"
            >
              Get Started
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="border border-ferro-primary text-ferro-primary bg-white rounded-button px-6 py-3 font-semibold hover:bg-ferro-tint transition-colors duration-fast"
            >
              How It Works
            </button>
          </div>
        </div>

        {/* Right column — iPhone 14 Pro style phone wireframe */}
        <div className="flex justify-center items-center w-full">
          <svg
            viewBox="0 0 280 560"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-w-[280px] h-auto"
          >
            <defs>
              <clipPath id="screen-clip">
                <rect x="4" y="4" width="272" height="552" rx="38" ry="38" />
              </clipPath>
            </defs>
            {/* Outer phone shell */}
            <rect
              x="2"
              y="2"
              width="276"
              height="556"
              rx="40"
              ry="40"
              fill="white"
              stroke="#0F1626"
              strokeWidth="4"
            />
            {/* Dynamic island pill */}
            <rect
              x="100"
              y="16"
              width="80"
              height="26"
              rx="13"
              fill="#0F1626"
            />
            {/* App screenshot — clipped to phone screen */}
            <image
              href={heroPhoneScreen}
              x="4"
              y="4"
              width="272"
              height="552"
              clipPath="url(#screen-clip)"
              preserveAspectRatio="xMidYMid slice"
            />
          </svg>
        </div>

      </div>
    </section>
  )
}
