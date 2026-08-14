import mapView from './assets/map-view.png'
import explore from './assets/explore.png'
import profile from './assets/profile.png'

function PhoneSVG({ clipId, image, alt }: { clipId: string; image: string; alt: string }) {
  return (
    <div className="relative" style={{ width: 280, height: 580 }}>
      <img
        src={image}
        alt={alt}
        className="absolute object-cover"
        style={{
          left: 3,
          top: 3,
          width: 274,
          height: 574,
          borderRadius: 45,
          transform: 'translateZ(0)',
          imageRendering: '-webkit-optimize-contrast' as React.CSSProperties['imageRendering'],
        }}
      />
      <svg
        width="280"
        height="580"
        viewBox="0 0 280 580"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 pointer-events-none"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x="3" y="3" width="274" height="574" rx="45" ry="45" />
          </clipPath>
        </defs>
        <rect
          x="2"
          y="2"
          width="276"
          height="576"
          rx="46"
          ry="46"
          fill="none"
          stroke="#0F1626"
          strokeWidth="5"
        />
        <rect x="105" y="16" width="70" height="22" rx="11" fill="#0F1626" />
      </svg>
    </div>
  )
}

const phones = [
  {
    label: 'Map View',
    clipId: 'screen-clip-1',
    image: mapView,
    alt: 'Ferro Maps live map view screen showing nearby opportunities',
  },
  {
    label: 'Explore Opportunities',
    clipId: 'screen-clip-2',
    image: explore,
    alt: 'Ferro Maps explore opportunities screen',
  },
  {
    label: 'Profile',
    clipId: 'screen-clip-3',
    image: profile,
    alt: 'Ferro Maps profile screen',
  },
]

export default function AppScreenshots() {
  return (
    <section id="app-screenshots" className="bg-[#DDEEFF] py-24 px-6">
      {/* Header */}
      <div className="text-center">
        <p className="text-ferro-primary text-overline font-semibold tracking-widest uppercase mb-4">
          SEE IT IN ACTION
        </p>
        <h2 className="font-bold text-headline text-neutral-900 mb-3">
          Built for the way drivers work
        </h2>
        <p className="font-bold text-subtitle text-neutral-700 mb-16">
          Three screens. Everything you need to start your shift smarter.
        </p>
      </div>

      {/* Three phones — snap-scroll carousel below lg, side-by-side at lg+ */}
      <div
        className="flex items-end gap-8 lg:gap-12 lg:justify-center overflow-x-auto lg:overflow-x-hidden snap-x snap-mandatory lg:snap-none -mx-6 px-6 lg:mx-0 lg:px-0 pb-4 lg:pb-0"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {phones.map(({ label, clipId, image, alt }) => (
          <div key={label} className="flex flex-col items-center gap-4 snap-center shrink-0">
            <span className="text-label font-medium text-neutral-700">{label}</span>
            <PhoneSVG clipId={clipId} image={image} alt={alt} />
          </div>
        ))}
      </div>
    </section>
  )
}
