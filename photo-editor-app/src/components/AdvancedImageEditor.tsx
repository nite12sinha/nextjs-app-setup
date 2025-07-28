"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface AdvancedFilter {
  name: string;
  value: string;
  category: string;
  description: string;
}

interface Adjustment {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  exposure: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  temperature: number;
  tint: number;
  vibrance: number;
  clarity: number;
  dehaze: number;
}

interface ColorCurve {
  name: string;
  points: { x: number; y: number }[];
}

const advancedFilters: AdvancedFilter[] = [
  // Professional Studio Filters
  { name: "Studio Portrait", value: "contrast(110%) saturate(105%) brightness(108%)", category: "Studio", description: "Professional portrait enhancement" },
  { name: "Fashion Editorial", value: "contrast(120%) saturate(115%) brightness(110%) hue-rotate(-5deg)", category: "Studio", description: "High-fashion editorial look" },
  { name: "Product Photography", value: "contrast(105%) saturate(100%) brightness(115%)", category: "Studio", description: "Clean product photography" },
  { name: "Beauty Retouch", value: "contrast(108%) saturate(110%) brightness(105%) blur(0.5px)", category: "Studio", description: "Soft beauty enhancement" },
  { name: "Commercial", value: "contrast(115%) saturate(120%) brightness(112%)", category: "Studio", description: "Commercial photography style" },
  
  // Cinematic Grades
  { name: "Teal & Orange", value: "hue-rotate(15deg) saturate(130%) contrast(125%)", category: "Cinematic", description: "Hollywood cinematic grade" },
  { name: "Film Noir", value: "grayscale(100%) contrast(180%) brightness(85%)", category: "Cinematic", description: "Classic film noir" },
  { name: "Vintage Film", value: "sepia(30%) contrast(110%) saturate(90%) brightness(105%)", category: "Cinematic", description: "Vintage film stock" },
  { name: "Blockbuster", value: "contrast(130%) saturate(140%) brightness(110%)", category: "Cinematic", description: "Summer blockbuster look" },
  
  // High-End Color Grades
  { name: "Moody Blue", value: "hue-rotate(200deg) saturate(120%) brightness(90%)", category: "Color Grade", description: "Cool moody atmosphere" },
  { name: "Warm Gold", value: "sepia(25%) saturate(135%) brightness(115%)", category: "Color Grade", description: "Warm golden tones" },
  { name: "Matte Finish", value: "contrast(85%) saturate(110%) brightness(110%)", category: "Color Grade", description: "Matte color grading" },
  { name: "High Key", value: "contrast(120%) brightness(130%) saturate(110%)", category: "Color Grade", description: "Bright high-key lighting" },
  { name: "Low Key", value: "contrast(150%) brightness(70%) saturate(90%)", category: "Color Grade", description: "Dramatic low-key lighting" }
];

const colorCurves: ColorCurve[] = [
  { name: "S-Curve", points: [{ x: 0, y: 0 }, { x: 64, y: 50 }, { x: 128, y: 128 }, { x: 192, y: 205 }, { x: 255, y: 255 }] },
  { name: "High Contrast", points: [{ x: 0, y: 0 }, { x: 64, y: 30 }, { x: 128, y: 128 }, { x: 192, y: 225 }, { x: 255, y: 255 }] },
  { name: "Lifted Blacks", points: [{ x: 0, y: 20 }, { x: 64, y: 70 }, { x: 128, y: 128 }, { x: 192, y: 192 }, { x: 255, y: 255 }] },
  { name: "Crushed Whites", points: [{ x: 0, y: 0 }, { x: 64, y: 64 }, { x: 128, y: 128 }, { x: 192, y: 220 }, { x: 255, y: 235 }] }
];

export default function AdvancedImageEditor() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("none");
  const [adjustments, setAdjustments] = useState<Adjustment>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    exposure: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    temperature: 0,
    tint: 0,
    vibrance: 0,
    clarity: 0,
    dehaze: 0
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [showBeforeAfter, setShowBeforeAfter] = useState<boolean>(false);
  const [selectedCurve, setSelectedCurve] = useState<string>("none");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate CSS filter string from adjustments
  const generateFilterString = useCallback(() => {
    const filters = [];
    
    if (adjustments.brightness !== 100) {
      filters.push(`brightness(${adjustments.brightness}%)`);
    }
    if (adjustments.contrast !== 100) {
      filters.push(`contrast(${adjustments.contrast}%)`);
    }
    if (adjustments.saturation !== 100) {
      filters.push(`saturate(${adjustments.saturation}%)`);
    }
    if (adjustments.hue !== 0) {
      filters.push(`hue-rotate(${adjustments.hue}deg)`);
    }
    
    // Advanced adjustments
    const exposureFactor = 1 + (adjustments.exposure / 100);
    if (adjustments.exposure !== 0) {
      filters.push(`brightness(${exposureFactor * 100}%)`);
    }
    
    const vibranceFactor = 1 + (adjustments.vibrance / 100);
    if (adjustments.vibrance !== 0) {
      filters.push(`saturate(${vibranceFactor * 100}%)`);
    }
    
    // Temperature and tint simulation
    if (adjustments.temperature > 0) {
      filters.push(`sepia(${Math.abs(adjustments.temperature) / 5}%)`);
    } else if (adjustments.temperature < 0) {
      filters.push(`hue-rotate(${adjustments.temperature / 2}deg)`);
    }
    
    if (adjustments.tint > 0) {
      filters.push(`hue-rotate(${adjustments.tint / 3}deg)`);
    } else if (adjustments.tint < 0) {
      filters.push(`hue-rotate(${adjustments.tint / 3}deg)`);
    }
    
    // Clarity simulation
    if (adjustments.clarity !== 0) {
      const clarityFactor = 1 + (adjustments.clarity / 200);
      filters.push(`contrast(${clarityFactor * 100}%)`);
    }
    
    return filters.join(" ") || "none";
  }, [adjustments]);

  const finalFilter = selectedFilter === "none" ? generateFilterString() : selectedFilter;

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("File size must be less than 20MB");
      return;
    }

    setError("");
    const url = URL.createObjectURL(file);
    setImageURL(url);
    setImageFile(file);
  };

  // Reset adjustments
  const resetAdjustments = () => {
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      exposure: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      temperature: 0,
      tint: 0,
      vibrance: 0,
      clarity: 0,
      dehaze: 0
    });
    setSelectedFilter("none");
    setSelectedCurve("none");
  };

  // Download processed image
  const handleDownload = async () => {
    if (!imageURL || !canvasRef.current || !imageFile) return;
    
    setIsProcessing(true);
    
    try {
      const image = new Image();
      image.crossOrigin = "anonymous";
      
      image.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        ctx.filter = finalFilter;
        ctx.drawImage(image, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) return;
          
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `studio-edited-${imageFile.name}`;
          link.click();
          URL.revokeObjectURL(url);
          setIsProcessing(false);
        }, "image/png", 1.0);
      };

      image.src = imageURL;
    } catch (err) {
      setError("Processing failed");
      setIsProcessing(false);
    }
  };

  // Adjustment slider component
  const AdjustmentSlider = ({ label, value, min, max, step, onChange, unit = "" }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    unit?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-sm text-muted-foreground">{value}{unit}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([val]) => onChange(val)}
        className="w-full"
      />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Studio Professional Image Editor</h1>
        <p className="text-muted-foreground">Professional-grade photo editing with advanced controls</p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Studio Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Supported: PNG, JPEG, TIFF, RAW (Max 20MB)
            </div>
          </div>
        </CardContent>
      </Card>

      {imageURL && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Professional Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="color">Color</TabsTrigger>
                    <TabsTrigger value="curves">Curves</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <AdjustmentSlider label="Exposure" value={adjustments.exposure} min={-100} max={100} step={1} onChange={(v) => setAdjustments({...adjustments, exposure: v})} unit="%" />
                    <AdjustmentSlider label="Highlights" value={adjustments.highlights} min={-100} max={100} step={1} onChange={(v) => setAdjustments({...adjustments, highlights: v})} unit="%" />
                    <AdjustmentSlider label="Shadows" value={adjustments.shadows} min={-100} max={100} step={1} onChange={(v) => setAdjustments({...adjustments, shadows: v})} unit="%" />
                    <AdjustmentSlider label="Whites" value={adjustments.whites} min={-100} max={100} step={1} onChange={(v) => setAdjustments({...adjustments, whites: v})} unit="%" />
                    <AdjustmentSlider label="Blacks" value={adjustments.blacks} min={-100} max={100} step={1} onChange={(v) => setAdjustments({...adjustments, blacks: v})} unit="%" />
                  </TabsContent>

                  <TabsContent value="color" className="space-y-4">
                    <AdjustmentSlider label="Temperature" value={adjustments.temperature} min={-100} max={100} step={1} onChange={(v) => setAdjustments({...adjustments, temperature: v})} unit="°" />
                    <AdjustmentSlider label="Tint" value={adjustments.tint} min={-100} max={100} step={1} onChange={(v) => setAdjustments({...adjustments, tint: v})} unit="%" />
                    <AdjustmentSlider label="Vibrance" value={adjustments.vibrance} min={-100} max={100} step={1} onChange={(v) => setAdjustments({...adjustments, vibrance: v})} unit="%" />
                    <AdjustmentSlider label="Saturation" value={adjustments.saturation} min={0} max={200} step={1} onChange={(v) => setAdjustments({...adjustments, saturation: v})} unit="%" />
                    <AdjustmentSlider label="Hue" value={adjustments.hue} min={-180} max={180} step={1} onChange={(v) => setAdjustments({...adjustments, hue: v})} unit="°" />
                  </TabsContent>

                  <TabsContent value="curves" className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Professional Filters</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {advancedFilters.map((filter) => (
                          <Button
                            key={filter.name}
                            variant={selectedFilter === filter.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedFilter(filter.value)}
                            className="text-xs h-auto py-2"
                          >
                            {filter.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Color Curves</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {colorCurves.map((curve) => (
                          <Button
                            key={curve.name}
                            variant={selectedCurve === curve.name ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCurve(curve.name)}
                            className="text-xs h-auto py-2"
                          >
                            {curve.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="pt-4 space-y-2">
                  <Button onClick={resetAdjustments} variant="outline" className="w-full">
                    Reset All Adjustments
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fine Tuning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AdjustmentSlider label="Brightness" value={adjustments.brightness} min={0} max={200} step={1} onChange={(v) => setAdjustments({...adjustments, brightness: v})} unit="%" />
                <AdjustmentSlider label="Contrast" value={adjustments.contrast} min={0} max={200} step={1} onChange={(v) => setAdjustments({...adjustments, contrast: v})} unit="%" />
                <AdjustmentSlider label="Clarity" value={adjustments.clarity} min={-100} max={100} step={1} onChange={(v) => setAdjustments({...adjustments, clarity: v})} unit="%" />
                <AdjustmentSlider label="Dehaze" value={adjustments.dehaze} min={-100} max={100} step={1} onChange={(v) => setAdjustments({...adjustments, dehaze: v})} unit="%" />
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Live Preview</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={showBeforeAfter}
                      onCheckedChange={setShowBeforeAfter}
                    />
                    <Label className="text-sm">Before/After</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
                    <img
                      src={imageURL}
                      alt="Studio preview"
                      style={{ 
                        filter: showBeforeAfter ? "none" : finalFilter,
                        maxWidth: "100%",
                        height: "auto"
                      }}
                      className="w-full h-auto max-h-[600px] object-contain mx-auto block"
                    />
                  </div>
                  
                  {showBeforeAfter && (
                    <div className="absolute inset-0">
                      <div className="w-1/2 h-full overflow-hidden">
                        <img
                          src={imageURL}
                          alt="Before"
                          style={{ filter: "none" }}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="absolute top-0 left-1/2 w-px h-full bg-white/50"></div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-center space-x-4">
                  <Button 
                    onClick={handleDownload} 
                    disabled={isProcessing}
                    className="min-w-40"
                  >
                    {isProcessing ? "Processing..." : "Download Studio Quality"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
