"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CustomizationGuidePage() {
  const [selectedCategory, setSelectedCategory] = useState("wood");
  const [selectedWoodType, setSelectedWoodType] = useState("oak");
  const [selectedFabricType, setSelectedFabricType] = useState("cotton");
  const [selectedLeatherType, setSelectedLeatherType] = useState("full-grain");
  const [selectedFinishType, setSelectedFinishType] = useState("matte");
  const [selectedColor, setSelectedColor] = useState("#8B4513"); // Default brown color

  // Wood options with their details and sample image paths
  const woodTypes = [
    {
      id: "oak",
      name: "Oak",
      description: "Strong and durable hardwood with a prominent grain pattern. Resistant to wear and moisture.",
      image: "/images/textures/chair_texture_1.jpeg",
      characteristics: ["Durable", "Prominent grain", "Moisture resistant"],
      bestFor: ["Dining tables", "Chairs", "Cabinets"]
    },
    {
      id: "walnut",
      name: "Walnut",
      description: "Rich, dark brown wood that is strong and shock resistant. Develops a beautiful patina over time.",
      image: "/images/textures/chair_texture_2.jpeg",
      characteristics: ["Rich color", "Strong", "Ages beautifully"],
      bestFor: ["Premium furniture", "Tables", "Bed frames"]
    },
    {
      id: "maple",
      name: "Maple",
      description: "Dense, light-colored wood with a subtle grain pattern. Highly resistant to wear and abrasion.",
      image: "/images/textures/chair_texture_3.jpeg",
      characteristics: ["Light color", "Subtle grain", "Abrasion resistant"],
      bestFor: ["Dressers", "Kitchen furniture", "Shelving"]
    },
    {
      id: "cherry",
      name: "Cherry",
      description: "Beautiful reddish-brown wood that darkens with age. Moderate strength and stability.",
      image: "/images/textures/chair_texture_4.jpeg", 
      characteristics: ["Reddish tone", "Darkens with age", "Moderately strong"],
      bestFor: ["Decorative pieces", "Dining furniture", "Cabinets"]
    }
  ];

  // Fabric options with their details and sample image paths
  const fabricTypes = [
    {
      id: "cotton",
      name: "Cotton",
      description: "Natural fiber that is soft, breathable, and easy to clean. Ideal for casual furniture.",
      image: "/images/textures/chair_texture_1.jpeg",
      characteristics: ["Breathable", "Easy to clean", "Comfortable"],
      bestFor: ["Sofas", "Ottoman covers", "Casual seating"]
    },
    {
      id: "linen",
      name: "Linen",
      description: "Strong natural fiber that is highly breathable and has a distinctive texture. Wrinkles easily.",
      image: "/images/textures/chair_texture_2.jpeg",
      characteristics: ["Textured", "Highly breathable", "Durable"],
      bestFor: ["Accent chairs", "Summer furniture", "Slipcovers"]
    },
    {
      id: "velvet",
      name: "Velvet",
      description: "Luxurious fabric with a plush feel and rich appearance. Requires more maintenance.",
      image: "/images/textures/chair_texture_3.jpeg",
      characteristics: ["Plush", "Luxurious", "Rich color depth"],
      bestFor: ["Accent chairs", "Formal sofas", "Headboards"]
    },
    {
      id: "microfiber",
      name: "Microfiber",
      description: "Synthetic fabric that is stain-resistant, durable, and easy to clean. Great for families.",
      image: "/images/textures/chair_texture_4.jpeg",
      characteristics: ["Stain resistant", "Durable", "Low maintenance"],
      bestFor: ["Family sofas", "Sectionals", "Dining chairs"]
    }
  ];

  // Leather options with their details
  const leatherTypes = [
    {
      id: "full-grain",
      name: "Full-Grain Leather",
      description: "Highest quality leather that includes the entire grain surface. Develops a rich patina over time.",
      image: "/images/textures/chair_texture_1.jpeg",
      characteristics: ["Highest quality", "Develops patina", "Natural markings"],
      bestFor: ["Premium sofas", "Lounge chairs", "Ottomans"]
    },
    {
      id: "top-grain",
      name: "Top-Grain Leather",
      description: "Second highest quality, with the outermost layer sanded and refined for a more uniform appearance.",
      image: "/images/textures/chair_texture_2.jpeg",
      characteristics: ["Uniform appearance", "Durable", "More affordable"],
      bestFor: ["Everyday sofas", "Recliners", "Sectionals"]
    },
    {
      id: "bonded",
      name: "Bonded Leather",
      description: "Made from leather scraps bonded together with adhesives. More affordable but less durable.",
      image: "/images/textures/chair_texture_3.jpeg",
      characteristics: ["Affordable", "Uniform look", "Less durable"],
      bestFor: ["Accent pieces", "Office furniture", "Budget options"]
    }
  ];

  // Finish options with their details
  const finishTypes = [
    {
      id: "matte",
      name: "Matte Finish",
      description: "Non-reflective finish that shows the natural beauty of the wood with minimal shine.",
      image: "/images/textures/chair_texture_1.jpeg",
      characteristics: ["Non-reflective", "Natural look", "Hides imperfections"],
      bestFor: ["Modern furniture", "Rustic pieces", "Large surfaces"]
    },
    {
      id: "glossy",
      name: "Glossy Finish",
      description: "High-shine finish that creates a reflective surface. Highlights the wood grain and color.",
      image: "/images/textures/chair_texture_2.jpeg",
      characteristics: ["Reflective", "Dramatic", "Bold appearance"],
      bestFor: ["Statement pieces", "Formal furniture", "Traditional styles"]
    },
    {
      id: "satin",
      name: "Satin Finish",
      description: "Middle ground between matte and glossy, offering subtle sheen without high reflection.",
      image: "/images/textures/chair_texture_3.jpeg",
      characteristics: ["Subtle sheen", "Easy to maintain", "Versatile"],
      bestFor: ["Versatile pieces", "Family furniture", "Dining tables"]
    },
    {
      id: "distressed",
      name: "Distressed Finish",
      description: "Deliberately aged appearance that shows wear and character for a vintage look.",
      image: "/images/textures/chair_texture_4.jpeg",
      characteristics: ["Aged appearance", "Unique", "Vintage look"],
      bestFor: ["Rustic designs", "Farmhouse style", "Statement pieces"]
    }
  ];

  // Color palette options
  const colorPalettes = {
    wood: ["#8B4513", "#A0522D", "#D2B48C", "#DEB887", "#F5DEB3", "#4B3621"],
    fabric: ["#F5F5DC", "#E6E6FA", "#B0C4DE", "#D3D3D3", "#FFE4E1", "#F0F8FF"],
    leather: ["#8B4513", "#A52A2A", "#D2691E", "#F5F5DC", "#000000", "#F5F5F5"]
  };

  // Get the selected material type info based on active category
  const getSelectedMaterialInfo = () => {
    if (selectedCategory === "wood") {
      return woodTypes.find(wood => wood.id === selectedWoodType);
    } else if (selectedCategory === "fabric") {
      return fabricTypes.find(fabric => fabric.id === selectedFabricType);
    } else if (selectedCategory === "leather") {
      return leatherTypes.find(leather => leather.id === selectedLeatherType);
    } else if (selectedCategory === "finish") {
      return finishTypes.find(finish => finish.id === selectedFinishType);
    }
    return null;
  };

  const selectedMaterial = getSelectedMaterialInfo();

  return (
    <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[40vh] bg-gray-900 mt-[65px]">
          <div className="absolute inset-0">
            <Image 
              src="/images/landing/interior.jpg" 
              alt="Furniture Customization Guide" 
              fill
              className="object-cover opacity-50"
              priority
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center mx-auto px-6">
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-4">Customization Guide</h1>
              <p className="text-xl text-white max-w-2xl">Explore materials, finishes, and options to create your perfect piece</p>
            </div>
          </div>
        </section>
        
        {/* Introduction Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-serif font-medium mb-6 text-center">Craft Your Perfect Furniture</h2>
              <p className="text-gray-700 mb-6 text-center">
                At FABRIQUÉ, we believe that your furniture should be as unique as you are. Our customization options allow you to create pieces that perfectly match your style, needs, and space.
              </p>
              <p className="text-gray-700 mb-8 text-center">
                This guide will help you understand the different materials, finishes, and customization options available, so you can make informed decisions about your furniture.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                <button
                  onClick={() => setSelectedCategory("wood")}
                  className={`p-4 rounded-lg transition-all ${
                    selectedCategory === "wood" 
                      ? "bg-amber-800 text-white" 
                      : "bg-gray-100 text-gray-800 hover:bg-amber-50"
                  }`}
                >
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span className="font-medium">Wood Types</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setSelectedCategory("fabric")}
                  className={`p-4 rounded-lg transition-all ${
                    selectedCategory === "fabric" 
                      ? "bg-amber-800 text-white" 
                      : "bg-gray-100 text-gray-800 hover:bg-amber-50"
                  }`}
                >
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5L14 14l-6 6 6-6H4m12 0h4" />
                    </svg>
                    <span className="font-medium">Fabric Choices</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setSelectedCategory("leather")}
                  className={`p-4 rounded-lg transition-all ${
                    selectedCategory === "leather" 
                      ? "bg-amber-800 text-white" 
                      : "bg-gray-100 text-gray-800 hover:bg-amber-50"
                  }`}
                >
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                    </svg>
                    <span className="font-medium">Leather Options</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setSelectedCategory("finish")}
                  className={`p-4 rounded-lg transition-all ${
                    selectedCategory === "finish" 
                      ? "bg-amber-800 text-white" 
                      : "bg-gray-100 text-gray-800 hover:bg-amber-50"
                  }`}
                >
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h10a2 2 0 012 2v12a4 4 0 01-4 4H7zm5-8a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                    <span className="font-medium">Finish Types</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Materials Explorer Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-serif font-medium mb-12 text-center">
              {selectedCategory === "wood" && "Wood Types"}
              {selectedCategory === "fabric" && "Fabric Choices"}
              {selectedCategory === "leather" && "Leather Options"}
              {selectedCategory === "finish" && "Finish Types"}
            </h2>
            
            {/* Materials Selection */}
            <div className="mb-12">
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {selectedCategory === "wood" && woodTypes.map(wood => (
                  <button
                    key={wood.id}
                    onClick={() => setSelectedWoodType(wood.id)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedWoodType === wood.id 
                        ? "border-amber-800 bg-amber-50 shadow-md" 
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    <div className="w-24 h-24 relative rounded-md overflow-hidden mb-2">
                      <Image 
                        src={wood.image} 
                        alt={wood.name} 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-center font-medium">{wood.name}</p>
                  </button>
                ))}
                
                {selectedCategory === "fabric" && fabricTypes.map(fabric => (
                  <button
                    key={fabric.id}
                    onClick={() => setSelectedFabricType(fabric.id)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedFabricType === fabric.id 
                        ? "border-amber-800 bg-amber-50 shadow-md" 
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    <div className="w-24 h-24 relative rounded-md overflow-hidden mb-2">
                      <Image 
                        src={fabric.image} 
                        alt={fabric.name} 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-center font-medium">{fabric.name}</p>
                  </button>
                ))}
                
                {selectedCategory === "leather" && leatherTypes.map(leather => (
                  <button
                    key={leather.id}
                    onClick={() => setSelectedLeatherType(leather.id)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedLeatherType === leather.id 
                        ? "border-amber-800 bg-amber-50 shadow-md" 
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    <div className="w-24 h-24 relative rounded-md overflow-hidden mb-2">
                      <Image 
                        src={leather.image} 
                        alt={leather.name} 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-center font-medium">{leather.name}</p>
                  </button>
                ))}
                
                {selectedCategory === "finish" && finishTypes.map(finish => (
                  <button
                    key={finish.id}
                    onClick={() => setSelectedFinishType(finish.id)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedFinishType === finish.id 
                        ? "border-amber-800 bg-amber-50 shadow-md" 
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    <div className="w-24 h-24 relative rounded-md overflow-hidden mb-2">
                      <Image 
                        src={finish.image} 
                        alt={finish.name} 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-center font-medium">{finish.name}</p>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Selected Material Details */}
            {selectedMaterial && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/3">
                    <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
                      <Image 
                        src={selectedMaterial.image} 
                        alt={selectedMaterial.name} 
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Color Options for this material */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Available Colors</h4>
                      <div className="flex flex-wrap gap-2">
                        {colorPalettes[selectedCategory === "finish" ? "wood" : selectedCategory]?.map((color, index) => (
                          <button 
                            key={index}
                            onClick={() => setSelectedColor(color)}
                            className={`w-8 h-8 rounded-full transition-all ${selectedColor === color ? 'ring-2 ring-amber-800 ring-offset-2' : 'ring-1 ring-gray-300'}`}
                            style={{ backgroundColor: color }}
                            aria-label={`Color option ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3">
                    <h3 className="text-2xl font-medium mb-4">{selectedMaterial.name}</h3>
                    <p className="text-gray-700 mb-6">{selectedMaterial.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium uppercase text-gray-500 mb-2">Characteristics</h4>
                        <ul className="space-y-1">
                          {selectedMaterial.characteristics.map((char, index) => (
                            <li key={index} className="flex items-center text-gray-700">
                              <svg className="h-4 w-4 mr-2 text-amber-800" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {char}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium uppercase text-gray-500 mb-2">Best For</h4>
                        <ul className="space-y-1">
                          {selectedMaterial.bestFor.map((item, index) => (
                            <li key={index} className="flex items-center text-gray-700">
                              <svg className="h-4 w-4 mr-2 text-amber-800" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h4 className="text-sm font-medium uppercase text-gray-500 mb-2">Care Instructions</h4>
                      <p className="text-gray-700">
                        {selectedCategory === "wood" && "Dust regularly with a soft, dry cloth. Clean spills immediately and avoid placing hot items directly on the surface. Apply wood polish every 3-6 months."}
                        {selectedCategory === "fabric" && "Vacuum regularly using low suction. Treat spills immediately by blotting (not rubbing). Professional cleaning recommended for stubborn stains."}
                        {selectedCategory === "leather" && "Dust weekly with a clean cloth. Clean with leather conditioner every 6-12 months. Keep away from direct sunlight and heat sources."}
                        {selectedCategory === "finish" && "Clean with a soft, slightly damp cloth. Avoid harsh chemicals and abrasive cleaners that can damage the finish."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        
        {/* Customization Process Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-serif font-medium mb-8 text-center">How Our Customization Process Works</h2>
            <p className="text-gray-700 mb-12 text-center max-w-3xl mx-auto">
              Creating your perfect custom furniture piece is simple with our streamlined process. Here&apos;s how it works:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-amber-800 text-2xl font-serif font-bold">1</span>
                </div>
                <h3 className="font-medium text-lg mb-2">Select Your Base Piece</h3>
                <p className="text-gray-600">Browse our collection and choose the furniture piece you&apos;d like to customize.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-amber-800 text-2xl font-serif font-bold">2</span>
                </div>
                <h3 className="font-medium text-lg mb-2">Choose Materials</h3>
                <p className="text-gray-600">Select from our range of wood types, fabrics, leathers, and finishes.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-amber-800 text-2xl font-serif font-bold">3</span>
                </div>
                <h3 className="font-medium text-lg mb-2">Customize Dimensions</h3>
                <p className="text-gray-600">Adjust measurements to fit your space perfectly (where applicable).</p>
              </div>
              
              <div className="text-center">
                <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-amber-800 text-2xl font-serif font-bold">4</span>
                </div>
                <h3 className="font-medium text-lg mb-2">Review & Order</h3>
                <p className="text-gray-600">Preview your creation, place your order, and we&apos;ll craft it to your specifications.</p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link
                href="/shop"
                className="inline-block px-8 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors"
              >
                Start Customizing
              </Link>
            </div>
          </div>
        </section>
        
        {/* Color Matching Guide */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-serif font-medium mb-8 text-center">Color Matching Guide</h2>
              <p className="text-gray-700 mb-12 text-center">
                Creating a cohesive look in your space starts with understanding how different materials and colors work together. Here&apos;s our guide to effective color matching.
              </p>
              
              <div className="bg-white p-8 rounded-lg shadow-sm mb-12">
                <h3 className="text-xl font-medium mb-6">Basic Color Theory</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="h-24 bg-gradient-to-r from-amber-800 to-amber-300 rounded-lg mb-3"></div>
                    <h4 className="font-medium mb-1">Monochromatic</h4>
                    <p className="text-sm text-gray-600">Various shades of a single color create a harmonious, elegant look.</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="h-24 bg-gradient-to-r from-amber-800 via-green-700 to-blue-800 rounded-lg mb-3"></div>
                    <h4 className="font-medium mb-1">Complementary</h4>
                    <p className="text-sm text-gray-600">Colors opposite each other on the color wheel create vibrant contrast.</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="h-24 bg-gradient-to-r from-amber-800 via-red-700 to-purple-800 rounded-lg mb-3"></div>
                    <h4 className="font-medium mb-1">Analogous</h4>
                    <p className="text-sm text-gray-600">Colors next to each other on the color wheel for a cohesive feel.</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-medium mb-4">Popular Combinations</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-100 rounded-lg">
                    <h4 className="font-medium mb-2">Walnut Wood + Navy Blue Fabric</h4>
                    <p className="text-gray-600 mb-2">The rich, dark tones of walnut pair beautifully with deep navy blue for a sophisticated, timeless look.</p>
                    <div className="flex space-x-2">
                      <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: "#5F4339" }}></div>
                      <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: "#0A1745" }}></div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-100 rounded-lg">
                    <h4 className="font-medium mb-2">Oak Wood + Sage Green Fabric</h4>
                    <p className="text-gray-600 mb-2">Light oak&apos;s warm tones complement the soft, muted quality of sage green for a calming, natural aesthetic.</p>
                    <div className="flex space-x-2">
                      <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: "#D4B996" }}></div>
                      <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: "#9CAF88" }}></div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-100 rounded-lg">
                    <h4 className="font-medium mb-2">Cherry Wood + Cream Leather</h4>
                    <p className="text-gray-600 mb-2">The rich reddish tones of cherry wood pair elegantly with cream leather for a warm, inviting space.</p>
                    <div className="flex space-x-2">
                      <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: "#9F4B3E" }}></div>
                      <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: "#F5F5DC" }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Link
                  href="/room-designer"
                  className="inline-block px-8 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors"
                >
                  Try in Room Designer
                </Link>
                <p className="mt-3 text-sm text-gray-600">
                  Our Room Designer tool lets you visualize different combinations in a virtual space.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-serif font-medium mb-8 text-center">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">How long does a custom piece take to make?</h3>
                  <p className="text-gray-700">
                    Custom furniture typically takes 6-8 weeks to craft, depending on the complexity of the design and current order volume. We&apos;ll provide you with a specific timeline when you place your order.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">Can I request material samples before ordering?</h3>
                  <p className="text-gray-700">
                    Yes! We offer sample kits that include swatches of our fabrics, leather samples, and wood finish options. You can order a kit online or visit one of our showrooms to see them in person.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">Are there any limitations to customization?</h3>
                  <p className="text-gray-700">
                    While we offer extensive customization options, there are some structural limitations based on design integrity and material properties. Our design consultants will guide you through what&apos;s possible with your chosen piece.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">What if I&apos;m not happy with my custom piece?</h3>
                  <p className="text-gray-700">
                    We want you to be completely satisfied with your purchase. If your piece doesn&apos;t meet your expectations due to a manufacturing defect, we&apos;ll work with you to resolve the issue. Custom orders cannot be returned due to their unique nature, but we&apos;ll do everything possible to ensure you&apos;re happy with the final product.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">Can I customize existing furniture I already own?</h3>
                  <p className="text-gray-700">
                    Yes, we offer reupholstery and refinishing services for select furniture pieces, including those not originally purchased from us. Contact our customer service team for a consultation and quote.
                  </p>
                </div>
              </div>
              
              <div className="text-center mt-10">
                <p className="text-gray-700 mb-4">
                  Have more questions about our customization options?
                </p>
                <Link
                  href="/contact"
                  className="inline-block px-8 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors"
                >
                  Contact Our Design Team
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}