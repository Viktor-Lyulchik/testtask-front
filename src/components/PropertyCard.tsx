import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { applicationsApi } from '../api/endpoints';

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

interface Props {
  property: Property;
}

export default function PropertyCard({ property }: Props) {
  const { user } = useSelector((s: RootState) => s.auth);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState<string>(String(property.ticket));
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showModal) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = originalStyle;
      document.removeEventListener('keydown', onKey);
    };
  }, [showModal]);

  useEffect(() => {
    if (!showModal) return;

    const preventScroll = (e: WheelEvent | TouchEvent) => {
      const target = e.target as Node;
      const backdrop = backdropRef.current;
      const modal = modalRef.current;

      if (backdrop && target === backdrop) {
        if (e.cancelable) e.preventDefault();
        return;
      }

      if (modal && modal.contains(target)) {
        const { scrollTop, scrollHeight, clientHeight } = modal;

        if (e instanceof WheelEvent) {
          const isScrollingDown = e.deltaY > 0;
          const isScrollingUp = e.deltaY < 0;

          if (
            (isScrollingDown && scrollTop + clientHeight >= scrollHeight) ||
            (isScrollingUp && scrollTop <= 0)
          ) {
            if (e.cancelable) e.preventDefault();
          }
        }
      }
    };

    const backdrop = backdropRef.current;
    if (backdrop) {
      backdrop.addEventListener('wheel', preventScroll, { passive: false });
      backdrop.addEventListener('touchmove', preventScroll, { passive: false });
    }

    return () => {
      if (backdrop) {
        backdrop.removeEventListener('wheel', preventScroll);
        backdrop.removeEventListener('touchmove', preventScroll);
      }
    };
  }, [showModal]);

  const handleClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowModal(true);
    setSuccess(false);
    setError('');
    setAmount(String(property.ticket));
    setValidationError('');
  };

  const handleSubmit = async () => {
    const num = parseInt(amount, 10);

    if (
      !amount ||
      isNaN(num) ||
      num < property.ticket ||
      num % property.ticket !== 0
    ) {
      setValidationError(
        `Amount must be a multiple of ${property.ticket.toLocaleString()} Dhs`
      );
      return;
    }
    setLoading(true);
    setError('');
    try {
      await applicationsApi.create(property.id, num);
      setSuccess(true);
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setAmount('');
      setValidationError('Please enter an amount');
      return;
    }

    if (!/^\d+$/.test(val)) return;
    const num = parseInt(val, 10);
    setAmount(String(num));

    if (num < property.ticket || num % property.ticket !== 0) {
      setValidationError(
        `Amount must be a multiple of ${property.ticket.toLocaleString()} Dhs`
      );
    } else {
      setValidationError('');
    }
  };

  const img =
    property.imageUrl ||
    `https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80`;

  return (
    <>
      <div
        onClick={handleClick}
        className="relative overflow-hidden rounded-[5px] cursor-pointer group aspect-[63/40]"
      >
        <img
          src={img}
          alt={property.title}
          className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-3.5 py-5">
          <h3 className="mb-1 font-serif text-base md:text-xl font-bold leading-[1.7] text-white">
            {property.title}
          </h3>
          <div className="flex items-end justify-between gap-5 text-xs text-white/90 md:gap-15">
            <div className="space-y-0.5">
              <p className="text-xs md:text-lg font-bold leading-[1.22]">
                {property.price.toLocaleString()} Dhs
              </p>
              <p className="text-xs md:text-lg font-bold leading-[1.22]">
                Ticket — {property.ticket.toLocaleString()} Dhs
              </p>
            </div>
            <div className="text-left space-y-0.5">
              <p className="text-xs md:text-lg font-bold leading-[1.22]">
                Yield {property.yield}%
              </p>
              <p className="text-xs md:text-lg font-bold leading-[1.22]">
                Days left {property.daysLeft}
              </p>
            </div>
            <div className="text-left">
              <p className="text-xs md:text-lg font-bold text-gold leading-[1.22]">
                Sold {property.soldPercent}%
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-0.5 bg-white/20 rounded-full">
            <div
              className="h-full transition-all rounded-full bg-gold"
              style={{ width: `${property.soldPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={e => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-md p-6 border shadow-2xl bg-[#f2f2f2] border-white/10 rounded-xl"
          >
            <h2 className="mb-1 font-serif text-2xl font-semibold text-navy">
              {property.title}
            </h2>
            <p className="mb-5 text-sm text-navy/50">
              Submit your investment application
            </p>

            {success ? (
              <div className="py-6 text-center">
                <div className="flex items-center justify-center mx-auto mb-4 border rounded-full w-14 h-14 bg-gold/10 border-gold/30">
                  <svg
                    className="w-7 h-7 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="font-medium text-navy">Application submitted!</p>
                <p className="mt-1 text-sm text-navy/50">
                  We'll be in touch shortly.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-10 py-2 mt-5 text-sm font-semibold text-white transition-colors border rounded bg-gold hover:bg-transparent border-gold hover:text-gold"
                  aria-label="Close success message"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 p-4 mb-5 text-sm rounded-lg bg-navy/5">
                  <div>
                    <span className="text-navy/40">Price</span>
                    <p className="font-medium text-navy">
                      {property.price.toLocaleString()} Dhs
                    </p>
                  </div>
                  <div>
                    <span className="text-navy/40">Yield</span>
                    <p className="font-medium text-gold">{property.yield}%</p>
                  </div>
                  <div>
                    <span className="text-navy/40">Min ticket</span>
                    <p className="font-medium text-navy">
                      {property.ticket.toLocaleString()} Dhs
                    </p>
                  </div>
                  <div>
                    <span className="text-navy/40">Days left</span>
                    <p className="font-medium text-navy">{property.daysLeft}</p>
                  </div>
                </div>

                <label className="block mb-1 text-sm text-navy/60">
                  Investment amount (Dhs)
                </label>
                <input
                  type="number"
                  value={amount}
                  min={property.ticket}
                  step={property.ticket}
                  onChange={handleAmountChange}
                  className="w-full bg-navy/5 border border-navy/15 rounded px-4 py-2.5 text-navy focus:outline-none focus:border-gold/60 mb-2 transition-colors"
                  aria-invalid={!!validationError}
                  aria-describedby="amount-error"
                  aria-label="Amount of investment in dirhams"
                />
                {validationError && (
                  <p className="mb-3 text-xs text-red-400" id="amount-error">
                    {validationError}
                  </p>
                )}

                {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 border border-gold text-gold rounded hover:bg-gold hover:text-white transition-colors text-sm"
                    aria-label="Cancel application"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    aria-label="Submit application"
                    disabled={loading || !!validationError || !amount}
                    className="flex-1 py-2.5 bg-gold text-white rounded font-semibold text-sm hover:bg-transparent border border-gold hover:text-gold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Submitting…' : 'Submit Application'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
