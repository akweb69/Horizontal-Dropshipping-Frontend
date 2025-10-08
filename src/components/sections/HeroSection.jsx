import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef(null);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load all slides data
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/hero-section-banner`)
      .then((res) => {
        setSlides(res.data);
        setLoading(false);
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const nextSlide = React.useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  }, [slides]);

  useEffect(() => {
    resetTimeout();
    if (!isHovering && slides.length > 0) {
      timeoutRef.current = setTimeout(nextSlide, 3000);
    }
    return () => {
      resetTimeout();
    };
  }, [currentIndex, isHovering, nextSlide, slides]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  const goToSlide = (slideIndex) => {
    setDirection(slideIndex > currentIndex ? 1 : -1);
    setCurrentIndex(slideIndex);
  };

  const slideVariants = {
    hidden: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    visible: {
      x: '0%',
      opacity: 1,
      transition: { type: 'tween', duration: 0.5 },
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: { type: 'tween', duration: 0.5 },
    }),
  };

  return (
    <section
      className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden rounded-lg"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {loading ? (
        <div className="w-full min-h-[50vh] md:min-h-[70vh] flex items-center justify-center">
          loading...
        </div>
      ) : slides.length > 0 ? (
        <div>
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute w-full h-full"
            >
              <img
                alt={slides[currentIndex]?.title}
                className="w-full h-full object-cover"
                src={slides[currentIndex]?.thumbnail}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-end text-center text-white p-4 md:p-12">
                <div className="bg-black bg-opacity-50 p-4 md:p-6 rounded-lg mb-12 md:mb-20 max-w-2xl">
                  <h5 className="text-2xl md:text-4xl font-bold mb-2">{slides[currentIndex]?.title}</h5>
                  <p className="text-sm md:text-lg hidden sm:block">{slides[currentIndex]?.subtitle}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={prevSlide}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity z-10"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity z-10"
            aria-label="Next Slide"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {slides.map((_, slideIndex) => (
              <button
                type="button"
                key={slideIndex}
                onClick={() => goToSlide(slideIndex)}
                className={`w-3 h-3 rounded-full transition-colors ${currentIndex === slideIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                aria-label={`Go to slide ${slideIndex + 1}`}
              ></button>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full min-h-[50vh] md:min-h-[70vh] flex items-center justify-center">
          No slides available
        </div>
      )}
    </section>
  );
};

export default HeroSection;