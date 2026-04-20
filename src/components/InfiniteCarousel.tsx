interface CarouselImage {
  src: string;
  alt: string;
  offsetY?: number;
}

interface InfiniteCarouselProps {
  images: CarouselImage[];
}

export default function InfiniteCarousel({ images }: InfiniteCarouselProps) {
  const doubled = [...images, ...images];

  return (
    <div className="relative w-full overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
      <div className="carousel-track carousel-animate">
        {doubled.map((img, i) => (
          <div
            key={i}
            className="flex-shrink-0 rounded-2xl overflow-hidden"
            style={{
              width: 180,
              height: 240,
              marginTop: img.offsetY ?? 0,
              boxShadow: '0 4px 24px rgba(139,92,246,0.12)',
              border: '1px solid rgba(196,174,245,0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
