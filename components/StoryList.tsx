"use client";

import { useState, useEffect } from "react";
import StoryUploader from "./StoryUploader";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function StoryList({ stories }: { stories: any[] }) {
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);

  // Auto-advance logic
  useEffect(() => {
    if (viewingIndex === null) return;
    
    const timer = setTimeout(() => {
      if (viewingIndex < stories.length - 1) {
        setViewingIndex(viewingIndex + 1);
      } else {
        setViewingIndex(null); // Close if it's the last story
      }
    }, 15000); // 15 seconds per story

    return () => clearTimeout(timer);
  }, [viewingIndex, stories.length]);

  const currentStory = viewingIndex !== null ? stories[viewingIndex] : null;

  return (
    <>
      <section className="story-rail" aria-label="Story komunitas">
        <StoryUploader />
        {stories.map((story: any, index: number) => (
          <article 
            className="story" 
            key={story.id} 
            onClick={() => setViewingIndex(index)}
            style={{ cursor: 'pointer' }}
          >
            <img alt={`Story oleh ${story.author.name}`} src={story.image} />
            <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {story.author.image ? (
                <img src={story.author.image} alt={story.author.name} style={{ width: '32px', height: '32px', borderRadius: '50%', minHeight: '32px', border: '2px solid var(--primary)' }} />
              ) : (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px', border: '2px solid white' }}>
                  {story.author.name.charAt(0)}
                </div>
              )}
            </div>
            <strong>{story.author.name.split(' ')[0]}</strong>
            <span>{story.city}</span>
          </article>
        ))}
      </section>

      {/* FULLSCREEN STORY VIEWER (INSTAGRAM STYLE) */}
      {currentStory && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Progress Bar Container */}
          <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', gap: '4px', zIndex: 10 }}>
            <style>{`
              @keyframes storyFill {
                from { width: 0%; }
                to { width: 100%; }
              }
            `}</style>
            {stories.map((_, idx) => (
              <div key={idx} style={{
                flex: 1,
                height: '3px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: '#ffffff',
                  width: idx < viewingIndex! ? '100%' : '0%',
                  animation: idx === viewingIndex ? 'storyFill 15s linear forwards' : 'none'
                }} />
              </div>
            ))}
          </div>

          {/* Header (Avatar & Close) */}
          <div style={{
            position: 'absolute',
            top: '40px',
            left: '20px',
            right: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {currentStory.author.image ? (
                <img src={currentStory.author.image} alt={currentStory.author.name} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 'bold', border: '2px solid white' }}>
                  {currentStory.author.name.charAt(0)}
                </div>
              )}
              <div style={{ color: 'white' }}>
                <strong style={{ display: 'block', fontSize: '15px' }}>{currentStory.author.name}</strong>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>{currentStory.city} • {Math.round((new Date().getTime() - new Date(currentStory.createdAt).getTime()) / 3600000)}j lalu</span>
              </div>
            </div>
            
            <button 
              onClick={() => setViewingIndex(null)}
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' }}
            >
              <X size={28} />
            </button>
          </div>

          {/* Main Image */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px', height: '100%', maxHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src={currentStory.image} 
              alt="Story content" 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} 
            />
            
            {/* Clickable Navigation Zones */}
            <div 
              style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '40%', cursor: 'pointer' }}
              onClick={() => viewingIndex > 0 && setViewingIndex(viewingIndex - 1)}
            />
            <div 
              style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '40%', cursor: 'pointer' }}
              onClick={() => {
                if (viewingIndex < stories.length - 1) {
                  setViewingIndex(viewingIndex + 1);
                } else {
                  setViewingIndex(null);
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
