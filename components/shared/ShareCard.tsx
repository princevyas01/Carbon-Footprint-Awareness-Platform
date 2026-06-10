'use client';

import { useRef } from 'react';

interface ShareCardProps {
  monthlyCO2: number;
  levelName: string;
  levelIcon: string;
  savedKg: number;
  onClose: () => void;
}

export default function ShareCard({
  monthlyCO2,
  levelName,
  levelIcon,
  savedKg,
  onClose,
}: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = 800;
    canvas.height = 440;

    // Background fill
    ctx.fillStyle = '#080B12';
    ctx.fillRect(0, 0, 800, 440);

    // Green radial glow
    const glow = ctx.createRadialGradient(400, 200, 0, 400, 200, 220);
    glow.addColorStop(0, 'rgba(0,255,135,0.12)');
    glow.addColorStop(1, 'rgba(0,255,135,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 800, 440);

    // Card border
    ctx.strokeStyle = 'rgba(0,255,135,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(16, 16, 768, 408, 16);
    ctx.stroke();

    // Top-left: Brand name
    ctx.fillStyle = '#00FF87';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('CarbonLens', 44, 64);

    // Top-left: Subtitle
    ctx.fillStyle = '#8899AA';
    ctx.font = '12px Arial';
    ctx.fillText('INDIA CARBON FOOTPRINT', 44, 86);

    // Center: Big CO2 number
    ctx.fillStyle = '#00FF87';
    ctx.font = 'bold 96px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,255,135,0.4)';
    ctx.shadowBlur = 24;
    ctx.fillText(`${monthlyCO2.toFixed(1)}`, 400, 210);
    ctx.shadowBlur = 0;

    // Center: Unit
    ctx.fillStyle = '#E8F4F1';
    ctx.font = '16px Arial';
    ctx.fillText('kg CO\u2082 this month', 400, 246);

    // Center: Level pill background
    ctx.fillStyle = 'rgba(0,255,135,0.12)';
    ctx.beginPath();
    ctx.roundRect(290, 266, 220, 38, 19);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,255,135,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center: Level text
    ctx.fillStyle = '#00FF87';
    ctx.font = '14px Arial';
    ctx.fillText(`${levelIcon} ${levelName}`, 400, 291);

    // Divider line
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(44, 336);
    ctx.lineTo(756, 336);
    ctx.stroke();

    // Bottom-left: Saved stat
    ctx.fillStyle = '#8899AA';
    ctx.font = '13px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Saved ${savedKg} kg CO\u2082 via challenges`, 44, 368);

    // Bottom-right: Tagline
    ctx.textAlign = 'right';
    ctx.fillText('carbonlens.vercel.app', 756, 368);

    // Bottom-center: Hashtags
    ctx.fillStyle = 'rgba(0,255,135,0.45)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      '#CarbonLens   #ClimateAction   #GreenIndia',
      400,
      408
    );

    return canvas;
  };

  const handleDownload = () => {
    try {
      const canvas = drawCard();
      if (!canvas) {
        alert('Could not generate card. Please try again.');
        return;
      }

      // Force PNG mime type explicitly
      const dataUrl = canvas.toDataURL('image/png', 1.0);

      // Validate it is actually a PNG data URL
      if (!dataUrl.startsWith('data:image/png')) {
        alert('Image generation failed. Please try again.');
        return;
      }

      const date = new Date();
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `CarbonLens-Impact-${month}-${year}.png`;
      link.type = 'image/png';

      // Must append to body for Firefox compatibility
      document.body.appendChild(link);
      link.click();

      // Small delay before removing (Safari fix)
      setTimeout(() => {
        document.body.removeChild(link);
      }, 200);

    } catch (err) {
      console.error('Download error:', err);
      alert('Download failed: ' + String(err));
    }
  };

  const handleCopyCaption = () => {
    const text = `I tracked my carbon footprint with CarbonLens 🌍\nThis month: ${monthlyCO2.toFixed(1)} kg CO₂\nLevel: ${levelIcon} ${levelName}\nSaved: ${savedKg} kg via green challenges 💚\n\n#CarbonLens #ClimateAction #GreenIndia`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Caption copied to clipboard!');
    });
  };

  // Draw preview on mount
  const previewRef = useRef(false);
  if (typeof window !== 'undefined' && !previewRef.current) {
    setTimeout(() => {
      drawCard();
      previewRef.current = true;
    }, 100);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0D1117] border border-white/10 rounded-2xl p-6 max-w-3xl w-full mx-4">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-bold text-lg">Your Impact Card</h2>
          <button
            onClick={onClose}
            className="text-zinc-300 hover:text-white text-xl"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="w-full overflow-hidden rounded-xl border border-white/10 mb-4">
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 bg-[#00FF87] text-black font-bold py-3 rounded-xl hover:bg-[#00C96B] transition-colors"
          >
            Download PNG
          </button>
          <button
            onClick={handleCopyCaption}
            className="flex-1 border border-white/20 text-white font-medium py-3 rounded-xl hover:border-[#00FF87] hover:text-[#00FF87] transition-colors"
          >
            Copy Caption
          </button>
        </div>

      </div>
    </div>
  );
}
