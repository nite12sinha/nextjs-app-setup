"use client";

import React, { useState } from "react";
import ImageEditor from "../components/ImageEditor/ImageEditor";
import AdvancedImageEditor from "../components/ImageEditor/AdvancedImageEditor";
import VideoEditor from "../components/VideoEditor";

export default function PhotoEditorHome() {
  const [editorMode, setEditorMode] = useState<"standard" | "advanced" | "video">("standard");

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-6">Image & Video Editor</h1>
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setEditorMode("standard")}
              className={`px-6 py-2 rounded font-semibold transition-colors ${
                editorMode === "standard"
                  ? "bg-white text-black"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setEditorMode("advanced")}
              className={`px-6 py-2 rounded font-semibold transition-colors ${
                editorMode === "advanced"
                  ? "bg-white text-black"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Advanced
            </button>
            <button
              onClick={() => setEditorMode("video")}
              className={`px-6 py-2 rounded font-semibold transition-colors ${
                editorMode === "video"
                  ? "bg-white text-black"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Video
            </button>
          </div>
        </div>

        {editorMode === "standard" && <ImageEditor />}
        {editorMode === "advanced" && <AdvancedImageEditor />}
        {editorMode === "video" && <VideoEditor />}
      </div>
    </main>
  );
}
