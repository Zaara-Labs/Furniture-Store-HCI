import Image from "next/image";

export default function TestimonialSection() {
  const testimonials = [
    {
      id: 1,
      name: "Emma Thompson",
      location: "New York, NY",
      quote: "The craftsmanship of every piece I've purchased is exceptional. Pneumetra has transformed my living space completely.",
      image: "/images/testimonial-1.jpg"
    },
    {
      id: 2,
      name: "David Chen",
      location: "San Francisco, CA",
      quote: "Not only is the furniture beautiful, but the customer service is outstanding. Delivery was prompt and the assembly was a breeze.",
      image: "/images/testimonial-2.jpg"
    },
    {
      id: 3,
      name: "Sarah Johnson",
      location: "Chicago, IL",
      quote: "I've furnished my entire apartment with pieces from Pneumetra. The quality is unmatched and the designs are timeless.",
      image: "/images/testimonial-3.jpg"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-medium mb-4">What Our Customers Say</h2>
          <p className="max-w-2xl mx-auto text-gray-600">
            Hear from our satisfied customers about their experience with our furniture and service.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 p-6 rounded-lg">
              <div className="mb-4">
                <svg className="h-5 w-5 text-amber-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <svg className="h-5 w-5 text-amber-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <svg className="h-5 w-5 text-amber-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <svg className="h-5 w-5 text-amber-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <svg className="h-5 w-5 text-amber-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>
              
              <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 mr-3">
                  {/* This would be replaced with actual profile images */}
                  {/* <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  /> */}
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
    </section>
  );
}
