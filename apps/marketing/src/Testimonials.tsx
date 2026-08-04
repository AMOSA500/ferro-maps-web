import ferroBirdCrow from './assets/friends/ferro-bird-crow.png'
import ferroBirdDetective from './assets/skins/ferro-bird-detective.png'
import ferroBirdFalcon from './assets/friends/ferro-bird-falcon.png'
import ferroBirdGamer from './assets/skins/ferro-bird-gamer.png'
import ferroBirdNinja from './assets/skins/ferro-bird-ninja.png'

const KEYFRAMES = `
  @keyframes scroll-left {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .testimonial-track {
    animation: scroll-left 30s linear infinite;
  }
  .testimonial-outer:hover .testimonial-track {
    animation-play-state: paused;
  }
`

interface Testimonial {
  name: string
  date: string
  quote: string
  tag: string
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    name: 'James Okafor',
    date: 'June 1, 2026',
    quote: '”Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud.”',
    tag: 'Lorem ipsum',
    avatar: ferroBirdCrow,
  },
  {
    name: 'Sarah Mitchell',
    date: 'May 28, 2026',
    quote: '”Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore. Eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt.”',
    tag: 'Dolor sit amet',
    avatar: ferroBirdDetective,
  },
  {
    name: 'Marcus Thomas',
    date: 'May 22, 2026',
    quote: '”Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore. Magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris.”',
    tag: 'Adipiscing elit',
    avatar: ferroBirdFalcon,
  },
  {
    name: 'Priya Kapoor',
    date: 'May 15, 2026',
    quote: '”Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliqua. Enim ad minim veniam quis nostrud exercitation ullamco laboris nisi.”',
    tag: 'Eiusmod tempor',
    avatar: ferroBirdGamer,
  },
  {
    name: 'David Nkosi',
    date: 'May 10, 2026',
    quote: '”Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt. Mollit anim id est laborum sed ut perspiciatis unde omnis iste natus.”',
    tag: 'Magna aliqua',
    avatar: ferroBirdNinja,
  },
]


function TestimonialCard({ name, date, quote, tag, avatar }: Testimonial) {
  return (
    <div className="bg-white rounded-card p-6 flex-shrink-0 flex flex-col gap-4" style={{ width: 350, height: 301, boxShadow: '0 1px 3px rgba(15,22,38,0.06), 0 4px 12px rgba(15,22,38,0.08), 0 8px 20px rgba(15,22,38,0.06)' }}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-ferro-primary flex items-center justify-center flex-shrink-0">
          <img
            src={avatar}
            alt={name}
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
        <div>
          <p className="font-semibold text-neutral-900 text-label leading-tight">{name}</p>
          <p className="text-caption text-neutral-500">{date}</p>
        </div>
      </div>
      <p className="text-body text-neutral-700 italic flex-1">{quote}</p>
      <div className="mt-auto">
        <span className="inline-flex items-center bg-ferro-primary text-white rounded-full px-4 py-1.5 text-label">
          ● {tag}
        </span>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const cards = [...testimonials, ...testimonials]

  return (
    <section id="testimonials" className="bg-white py-24 px-6">
      <style>{KEYFRAMES}</style>
      <div className="text-center">
        <p className="text-ferro-primary text-overline font-semibold tracking-widest uppercase mb-4">
          DRIVER STORIES
        </p>
        <h2 className="font-bold text-headline text-neutral-900 mb-3">
          Real drivers, real earnings
        </h2>
        <p className="font-bold text-subtitle text-neutral-700 mb-12">
          Drivers who have already made the switch
        </p>
      </div>
      <div className="testimonial-outer overflow-hidden w-full py-4">
        <div className="testimonial-track flex gap-6 py-2">
          {cards.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>
      </div>
    </section>
  )
}
