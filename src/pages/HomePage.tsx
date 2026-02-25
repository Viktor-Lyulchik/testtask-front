import { useEffect, useState } from 'react';
import PropertyCard from '../components/PropertyCard';
import { propertiesApi } from '../api/endpoints';
import Loading from '../components/Loader';

interface Property {
  id: number;
  title: string;
  price: number;
  ticket: number;
  yield: number;
  daysLeft: number;
  soldPercent: number;
  imageUrl?: string;
}

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertiesApi
      .getAll()
      .then(setProperties)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-screen overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover bg-[url('/img/Hero-mobile.webp')]
    md:bg-[url('/img/Hero.webp')]"
        />
        <div className="absolute inset-0 bg-navy/65" />

        {/* Decorative grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-[1085px] px-4 mx-auto text-center sm:px-6">
          <h1 className="mb-5 font-serif text-3xl font-bold leading-tight text-white sm:text-6xl md:text-[64px] text-shadow">
            The chemical negatively charged
          </h1>

          <p className="max-w-[850px] mx-auto mb-7 text-base leading-snug text-white sm:text-2xl">
            Numerous calculations predict, and experiments confirm, that the
            force field reflects the beam, while the mass defect is not formed.
            The chemical compound is negatively charged. Twhile the mass defect
            is
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#deals"
              className="min-w-[160px] px-6 py-2.5 border border-white text-white hover:bg-gold hover:border-gold transition-all duration-300 font-bold text-xl rounded-lg"
            >
              Get Started
            </a>
          </div>
        </div>
      </section>

      {/* Deals Section */}
      <section
        id="deals"
        className="px-4 py-4 mx-auto md:py-12 sm:px-6 lg:px-8 max-w-7xl"
      >
        <div className="mb-2 md:mb-5">
          <h2 className="font-serif text-2xl font-bold sm:text-[28px] text-gold">
            Open Deals
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loading />
          </div>
        ) : properties.length === 0 ? (
          <div className="py-20 text-center text-white/30">
            <p className="text-lg">No open deals at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:gap-5 sm:grid-cols-2">
            {properties.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
