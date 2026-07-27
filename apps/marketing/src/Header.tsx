import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from './context/useAuth'

const navLinks = [
  { id: 'why-ferro-maps', label: 'Why Ferro Maps' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'testimonials', label: 'Driver Stories' },
  { id: 'contact', label: 'Contact' },
]

export default function Header() {
  const [visible, setVisible] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    let prevScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setVisible(currentScrollY < prevScrollY || currentScrollY < 10)
      prevScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleNavClick(anchorId: string) {
    setMenuOpen(false)
    if (pathname === '/') {
      document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/#' + anchorId)
    }
  }

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-40 h-5 bg-transparent"
        onMouseEnter={() => setVisible(true)}
      />
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-border-default transition-transform duration-slow ease-standard will-change-transform [backface-visibility:hidden] [-webkit-backface-visibility:hidden] ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <img src="/ferro-bird-2.png" alt="Ferro Maps" className="h-8 w-auto" />
            <span className="font-bold text-ferro-primary font-nunito text-subtitle whitespace-nowrap">Ferro Maps</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-10">
            {navLinks.map(({ id, label }) => (
              <a
                key={id}
                href={'#' + id}
                data-label={label}
                className="nav-link text-neutral-700 font-medium no-underline hover:text-ferro-primary active:text-ferro-primary"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(id)
                }}
              >
                {label}
              </a>
            ))}
            <Link
              to="/waitlist"
              className="text-neutral-700 font-medium no-underline rounded-full transition-all duration-fast ease-standard hover:bg-ferro-signal hover:text-white hover:font-bold hover:px-[19px] hover:py-[9px]"
            >
              Join Waitlist
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              className="bg-ferro-primary text-white rounded-button px-6 py-2 font-semibold whitespace-nowrap transition-colors duration-fast hover:bg-ferro-deep"
              onClick={() => handleNavClick('download')}
            >
              Get Started
            </button>
            {user ? (
              <Link
                to="/dashboard"
                className="border border-ferro-primary bg-transparent text-ferro-primary rounded-button px-6 py-2 font-semibold whitespace-nowrap transition-colors duration-fast hover:bg-ferro-primary hover:text-white no-underline"
              >
                My Dashboard
              </Link>
            ) : (
              <Link
                to="/signin"
                className="border border-ferro-primary bg-transparent text-ferro-primary rounded-button px-6 py-2 font-semibold whitespace-nowrap transition-colors duration-fast hover:bg-ferro-primary hover:text-white no-underline"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-neutral-700"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-border-default w-full">
            {navLinks.map(({ id, label }) => (
              <a
                key={id}
                href={'#' + id}
                className="block px-6 py-4 text-neutral-700 font-medium no-underline border-b border-neutral-100 last:border-b-0 transition-colors duration-fast hover:text-ferro-primary"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(id)
                }}
              >
                {label}
              </a>
            ))}
              <Link
                to="/waitlist"
                className="block px-6 py-4 text-neutral-700 font-medium no-underline border-b border-neutral-100 transition-colors duration-fast hover:text-ferro-primary"
                onClick={() => setMenuOpen(false)}
              >
                Join waitlist
              </Link>
            {user ? (
              <Link
                to="/dashboard"
                className="block px-6 py-4 text-neutral-700 font-medium no-underline border-t border-neutral-100 transition-colors duration-fast hover:text-ferro-primary"
                onClick={() => setMenuOpen(false)}
              >
                Your Dashboard
              </Link>
            ) : (
              <Link
                to="/signin"
                className="block px-6 py-4 text-neutral-700 font-medium no-underline border-t border-neutral-100 transition-colors duration-fast hover:text-ferro-primary"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  )
}
