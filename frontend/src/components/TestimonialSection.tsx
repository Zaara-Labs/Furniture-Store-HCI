"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function TestimonialSection() {
  const testimonials = [
    {
      id: 1,
      name: "Emma Thompson",
      location: "New York, NY",
      quote: "The craftsmanship of every piece I've purchased is exceptional. Pneumetra has transformed my living space completely.",
      image: "/images/testimonial/1.jpg"
    },
    {
      id: 2,
      name: "David Chen",
      location: "San Francisco, CA",
      quote: "Not only is the furniture beautiful, but the customer service is outstanding. Delivery was prompt and the assembly was breeze.",
      image: "/images/testimonial/2.jpg"
    },
    {
      id: 3,
      name: "Sarah Johnson",
      location: "Chicago, IL",
      quote: "I've furnished my entire apartment with pieces from Pneumetra. The quality is unmatched and the designs are timeless.",
      image: "/images/testimonial/3.jpg"
    },
    {
      id: 4,
      name: "Michael Rodriguez",
      location: "Austin, TX",
      quote: "The attention to detail in each piece is remarkable. I'm so happy with my new dining set from Pneumetra.",
      image: "/images/testimonial/4.jpg"
    },
    {
      id: 5,
      name: "Jennifer Lee",
      location: "Seattle, WA",
      quote: "Their sustainable practices and eco-friendly materials aligned perfectly with my values. Beautiful furniture with a conscience.",
      image: "/images/testimonial/5.jpg"
    },
    {
      id: 6,
      name: "Robert Taylor",
      location: "Boston, MA",
      quote: "The custom sizing options allowed me to find the perfect fit for my apartment. Couldn't be happier with the results.",
      image: "/images/testimonial/6.jpg"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const totalSlides = Math.ceil(testimonials.length / 3);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => {
      resetTimeout();
    };
  }, [currentIndex, totalSlides]);

  const goToSlide = (index: number) => {
    resetTimeout();
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    resetTimeout();
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? totalSlides - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    resetTimeout();
    const isLastSlide = currentIndex === totalSlides - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-medium mb-4">What Our Customers Say</h2>
          <p className="max-w-2xl mx-auto text-gray-600">
            Hear from our satisfied customers about their experience with our furniture and service.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Slide container */}
          <div className="overflow-hidden rounded-xl">
            <div
              className="whitespace-nowrap transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="inline-block w-full whitespace-normal">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.slice(slideIndex * 3, slideIndex * 3 + 3).map((testimonial) => (
                      <div
                        key={testimonial.id}
                        className="bg-gray-100 p-6 rounded-xl shadow-sm"
                      >
                        <div className="flex mb-4 justify-center">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="h-5 w-5 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                        </div>

                        <p className="text-gray-700 italic text-center mb-6 h-24 overflow-hidden">&quot;{testimonial.quote}&quot;</p>

                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full overflow-hidden relative mr-3 border-2 border-amber-800">
                            <Image
                              src={testimonial.image}
                              alt={testimonial.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{testimonial.name}</h4>
                            <p className="text-sm text-gray-600">{testimonial.location}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 md:-translate-x-20 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-800 z-10"
            aria-label="Previous testimonials"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 md:translate-x-20 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-800 z-10"
            aria-label="Next testimonials"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots indicator */}
          <div className="flex justify-center mt-8">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 w-3 mx-1 rounded-full focus:outline-none ${
                  index === currentIndex ? 'bg-amber-800' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial group ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
