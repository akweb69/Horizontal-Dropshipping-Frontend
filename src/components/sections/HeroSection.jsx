import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef(null);

  // 👉 Using sliders from AuthContext Hook
  const { sliders, slidersLoading, fetchSliders } = useAuth();

  // Fetch sliders on load
  // useEffect(() => {
  //   fetchSliders();
  // }, [fetchSliders]);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const nextSlide = React.useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === sliders.length - 1 ? 0 : prevIndex + 1
    );
  }, [sliders]);

  useEffect(() => {
    resetTimeout();

    if (!isHovering && sliders.length > 0) {
      timeoutRef.current = setTimeout(nextSlide, 3000);
    }

    return () => resetTimeout();
  }, [currentIndex, isHovering, nextSlide, sliders]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? sliders.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const slideVariants = {
    hidden: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    visible: {
      x: "0%",
      opacity: 1,
      transition: { type: "tween", duration: 0.5 },
    },
    exit: (direction) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      transition: { type: "tween", duration: 0.5 },
    }),
  };

  return (
    <section
      className="relative mt-[52px] -mb-4 w-full h-[190px] md:h-[450px] overflow-hidden rounded-lg"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Loading State */}
      {slidersLoading ? (
        <div className="w-full h-[300px] md:h-[450px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
        </div>
      ) : sliders.length > 0 ? (
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
                alt={sliders[currentIndex]?.title}
                className="w-full h-full object-center"
                src={sliders[currentIndex]?.thumbnail}
              />
            </motion.div>
          </AnimatePresence>

          {/* Slide Dots */}
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {sliders.map((_, slideIndex) => (
              <button
                key={slideIndex}
                onClick={() => goToSlide(slideIndex)}
                className={`w-3 h-3 rounded-full transition-colors ${currentIndex === slideIndex ? "bg-white" : "bg-white/50"
                  }`}
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
