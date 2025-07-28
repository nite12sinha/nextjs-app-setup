"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FilterStyle {
  name: string;
  value: string;
  description: string;
  category: string;
}

interface EnhancementPreset {
  name: string;
  filters: string[];
  description: string;
  intensity: number;
}

const filterStyles: FilterStyle[] = [
  // Basic Filters
  { name: "Original", value: "none", description: "No filter applied", category: "Basic" },
  { name: "Grayscale", value: "grayscale(100%)", description: "Black and white effect", category: "Basic" },
  { name: "Sepia", value: "sepia(100%)", description: "Vintage warm tone", category: "Basic" },
  { name: "Invert", value: "invert(100%)", description: "Inverted colors", category: "Basic" },
  
  // Enhancement Filters
  { name: "Bright", value: "brightness(150%)", description: "Enhanced brightness", category: "Enhancement" },
  { name: "Dark", value: "brightness(50%)", description: "Reduced brightness", category: "Enhancement" },
  { name: "High Contrast", value: "contrast(150%)", description: "Enhanced contrast", category: "Enhancement" },
  { name: "Low Contrast", value: "contrast(50%)", description: "Reduced contrast", category: "Enhancement" },
  { name: "Saturate", value: "saturate(200%)", description: "Enhanced colors", category: "Enhancement" },
  { name: "Desaturate", value: "saturate(50%)", description: "Reduced colors", category: "Enhancement" },
  
  // Artistic Effects
  { name: "Vintage", value: "sepia(50%) contrast(120%) brightness(110%)", description: "Classic vintage look", category: "Artistic" },
  { name: "Cinematic", value: "contrast(130%) saturate(120%) brightness(105%)", description: "Movie-like effect", category: "Artistic" },
  { name: "Noir", value: "grayscale(100%) contrast(150%) brightness(80%)", description: "Film noir style", category: "Artistic" },
  { name: "Dreamy", value: "blur(1px) saturate(120%) brightness(110%)", description: "Soft dreamy effect", category: "Artistic" },
  { name: "Retro", value: "sepia(30%) saturate(150%) hue-rotate(10deg)", description: "Retro color scheme", category: "Artistic" },
  
  // Color Effects
  { name: "Warm", value: "sepia(20%) saturate(130%) hue-rotate(-10deg)", description: "Warm color temperature", category: "Color" },
  { name: "Cool", value: "hue-rotate(180deg) saturate(120%)", description: "Cool color temperature", category: "Color" },
  { name: "Golden Hour", value: "sepia(40%) saturate(140%) brightness(115%)", description: "Golden hour lighting", category: "Color" },
  { name: "Blue Hour", value: "hue-rotate(200deg) saturate(110%) brightness(90%)", description: "Blue hour mood", category: "Color" },
  
  // Special Effects
  { name: "Blur", value: "blur(2px)", description: "Soft blur effect", category: "Special" },
  { name: "Sharp", value: "contrast(110%) saturate(110%)", description: "Enhanced sharpness", category: "Special" },
  { name: "Glow", value: "brightness(120%) saturate(130%)", description: "Soft glow effect", category: "Special" },
  { name: "Fade", value: "contrast(80%) brightness(120%)", description: "Faded vintage look", category: "Special" },
  { name: "Dramatic", value: "contrast(180%) brightness(90%) saturate(130%)", description: "High drama effect", category: "Special" },
  { name: "Moody", value: "brightness(85%) contrast(130%) saturate(110%)", description: "Dark moody atmosphere", category: "Special" }
];

const enhancementPresets: EnhancementPreset[] = [
  { name: "Auto Enhance", filters: ["contrast(110%)", "saturate(110%)", "brightness(105%)"], description: "Automatic photo enhancement", intensity: 1 },
  { name: "Portrait", filters: ["brightness(108%)", "contrast(105%)", "saturate(115%)"], description: "Perfect for portraits", intensity: 1.2 },
  { name: "Landscape", filters: ["contrast(120%)", "saturate(130%)", "brightness(110%)"], description: "Enhanced landscape photos", intensity: 1.3 },
  { name: "Food", filters: ["saturate(140%)", "brightness(115%)", "contrast(110%)"], description: "Make food photos pop", intensity: 1.4 },
  { name: "Night", filters: ["brightness(130%)", "contrast(115%)", "saturate(90%)"], description: "Enhance low-light photos", intensity: 1.2 },
  { name: "Sunset", filters: ["saturate(150%)", "brightness(120%)", "contrast(110%)"], description: "Perfect sunset enhancement", intensity: 1.5 }
];

export default function ImageEditor() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("none");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedEnhancement, setSelectedEnhancement] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [intensity, setIntensity] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload and validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPEG, GIF, etc.)");
      setImageURL(null);
      setImageFile(null);
      return;
    }

    // Validate file size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setError("File size must be less than 15MB");
      setImageURL(null);
      setImageFile(null);
      return;
    }

    setError("");
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageURL(url);
    setSelectedFilter("none"); // Reset filter when new image is uploaded
  };

  // Generate canvas image for download
  const handleDownload = async () => {
    if (!imageURL || !canvasRef.current || !imageFile) return;
    
    setIsProcessing(true);
    
    try {
      const image = new Image();
      image.crossOrigin = "anonymous";
      
      image.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setError("Failed to get canvas context");
          setIsProcessing(false);
          return;
        }

        // Set canvas size to match image
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        // Clear canvas and apply filter
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = selectedFilter;
        ctx.drawImage(image, 0, 0);

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (!blob) {
            setError("Failed to process image");
            setIsProcessing(false);
            return;
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `edited-${imageFile.name}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setIsProcessing(false);
        }, "image/png", 0.9);
      };

      image.onerror = () => {
        setError("Failed to load image for processing");
        setIsProcessing(false);
      };

      image.src = imageURL;
    } catch (err) {
      setError("An error occurred while processing the image");
      setIsProcessing(false);
    }
  };

  // Clear uploaded image
  const handleClear = () => {
    if (imageURL) {
      URL.revokeObjectURL(imageURL);
    }
    setImageURL(null);
    setImageFile(null);
    setSelectedFilter("none");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (imageURL) {
        URL.revokeObjectURL(imageURL);
      }
    };
  }, [imageURL]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer border border-border rounded-md"
              />
              {imageURL && (
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filter Selection */}
      {imageURL && (
        <>
          {/* Enhancement Presets */}
          <Card>
            <CardHeader>
              <CardTitle>Photo Enhancement Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {enhancementPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant={selectedEnhancement === preset.name ? "default" : "outline"}
                    onClick={() => {
                      setSelectedEnhancement(preset.name);
                      setSelectedFilter(preset.filters.join(" "));
                    }}
                    className="h-auto p-3 flex flex-col items-center text-center"
                    title={preset.description}
                  >
                    <span className="font-medium">{preset.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {preset.description}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filter Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Styles</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Category Filter */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {["All", "Basic", "Enhancement", "Artistic", "Color", "Special"].map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filterStyles
                  .filter(style => selectedCategory === "All" || style.category === selectedCategory)
                  .map((style) => (
                    <Button
                      key={style.name}
                      variant={selectedFilter === style.value ? "default" : "outline"}
                      onClick={() => {
                        setSelectedFilter(style.value);
                        setSelectedEnhancement("");
                      }}
                      className="h-auto p-3 flex flex-col items-center text-center"
                      title={style.description}
                    >
                      <span className="font-medium text-sm">{style.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {style.description}
                      </span>
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Intensity Control */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Intensity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="intensity" className="text-sm font-medium">
                    Intensity: {Math.round(intensity * 100)}%
                  </label>
                  <input
                    id="intensity"
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={intensity}
                    onChange={(e) => setIntensity(parseFloat(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Image Preview */}
      {imageURL && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
              <img
                src={imageURL}
                alt="Image preview"
                style={{ filter: selectedFilter ? `${selectedFilter}`.replace(/(\d+(\.\d+)?)/g, (match) => `${parseFloat(match) * intensity}`) : "none" }}
                className="w-full h-auto max-h-96 object-contain mx-auto block"
              />
              </div>
              
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={handleDownload} 
                  disabled={isProcessing}
                  className="min-w-32"
                >
                  {isProcessing ? "Processing..." : "Download Edited Image"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!imageURL && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground space-y-2">
              <h3 className="font-medium text-foreground">How to use:</h3>
              <ol className="text-sm space-y-1 max-w-md mx-auto">
                <li>1. Click "Choose File" to upload an image</li>
                <li>2. Select a filter style from the available options</li>
                <li>3. Preview the result in real-time</li>
                <li>4. Download your edited image</li>
              </ol>
              <p className="text-xs mt-4">
                Supported formats: PNG, JPEG, GIF, WebP (Max size: 15MB)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden Canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
