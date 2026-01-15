import React from "react";
import { Move } from "lucide-react";
import { Rect } from "@/lib/image-processing";
import { cn } from "@/lib/utils";

interface CropOverlayProps {
    cropArea: Rect;
    onResizeStart: (e: React.MouseEvent | React.TouchEvent, handle: string) => void;
    onMoveStart: (e: React.MouseEvent | React.TouchEvent) => void;
    isMoving: boolean;
}

export function CropOverlay({ cropArea, onResizeStart, onMoveStart, isMoving }: CropOverlayProps) {
    if (cropArea.width <= 0 || cropArea.height <= 0) return null;

    return (
        <>
            {/* Dark overlay with cutout */}
            <div
                className="absolute inset-0 pointer-events-none transition-all duration-100 ease-out"
                style={{
                    background: `linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.7) ${cropArea.x}px, transparent ${cropArea.x}px, transparent ${cropArea.x + cropArea.width}px, rgba(0,0,0,0.7) ${cropArea.x + cropArea.width}px, rgba(0,0,0,0.7) 100%),
                      linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.7) ${cropArea.y}px, transparent ${cropArea.y}px, transparent ${cropArea.y + cropArea.height}px, rgba(0,0,0,0.7) ${cropArea.y + cropArea.height}px, rgba(0,0,0,0.7) 100%)`,
                }}
            />

            {/* Crop border with grid */}
            <div
                className="absolute border-[3px] border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
                style={{
                    left: `${cropArea.x}px`,
                    top: `${cropArea.y}px`,
                    width: `${cropArea.width}px`,
                    height: `${cropArea.height}px`,
                }}
            >
                {/* Move area - center of crop */}
                <div
                    className="crop-move-area absolute inset-0 cursor-move touch-none"
                    onMouseDown={onMoveStart}
                    onTouchStart={onMoveStart}
                    style={{ cursor: isMoving ? 'grabbing' : 'grab' }}
                >
                    {/* Grid lines (Rule of Thirds) - Always visible for better orientation */}
                    <div className="absolute inset-0 border border-white/50 pointer-events-none" style={{
                        backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.4) 1px, transparent 1px)
            `,
                        backgroundSize: `${cropArea.width / 3}px ${cropArea.height / 3}px`,
                    }} />

                    {/* Center Move Icon - Only visible on hover/active to reduce clutter */}
                    <div className={cn(
                        "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
                        isMoving ? "opacity-100" : "opacity-0 hover:opacity-100"
                    )}>
                        <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm">
                            <Move className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Handles Helper */}
                {/* We use a large invisible clickable area (44x44px min for touch) with a smaller visible handle */}

                {/* Corner handles */}
                {[
                    { x: 0, y: 0, handle: "top-left", cursor: "nwse-resize" },
                    { x: cropArea.width, y: 0, handle: "top-right", cursor: "nesw-resize" },
                    { x: 0, y: cropArea.height, handle: "bottom-left", cursor: "nesw-resize" },
                    { x: cropArea.width, y: cropArea.height, handle: "bottom-right", cursor: "nwse-resize" },
                ].map((pos, i) => (
                    <div
                        key={i}
                        className="absolute z-50 flex items-center justify-center touch-none"
                        style={{
                            left: `${pos.x}px`,
                            top: `${pos.y}px`,
                            width: '48px', // Large hit target
                            height: '48px',
                            transform: 'translate(-50%, -50%)',
                            cursor: pos.cursor,
                        }}
                        onMouseDown={(e) => onResizeStart(e, pos.handle)}
                        onTouchStart={(e) => onResizeStart(e, pos.handle)}
                    >
                        {/* Visible Handle */}
                        <div className="w-5 h-5 bg-white border-2 border-purple-600 rounded-full shadow-lg transition-transform hover:scale-125" />
                    </div>
                ))}

                {/* Edge handles */}
                {[
                    { x: cropArea.width / 2, y: 0, handle: "top", cursor: "ns-resize", w: '100%', h: '24px' },
                    { x: cropArea.width / 2, y: cropArea.height, handle: "bottom", cursor: "ns-resize", w: '100%', h: '24px' },
                    { x: 0, y: cropArea.height / 2, handle: "left", cursor: "ew-resize", w: '24px', h: '100%' },
                    { x: cropArea.width, y: cropArea.height / 2, handle: "right", cursor: "ew-resize", w: '24px', h: '100%' },
                ].map((pos, i) => (
                    <div
                        key={`edge-${i}`}
                        className="absolute z-40 flex items-center justify-center touch-none"
                        style={{
                            left: `${pos.x}px`,
                            top: `${pos.y}px`,
                            width: pos.handle === 'left' || pos.handle === 'right' ? '24px' : '60%', // Wider hit area for top/bottom
                            height: pos.handle === 'top' || pos.handle === 'bottom' ? '24px' : '60%', // Taller hit area for left/right
                            transform: 'translate(-50%, -50%)',
                            cursor: pos.cursor,
                        }}
                        onMouseDown={(e) => onResizeStart(e, pos.handle)}
                        onTouchStart={(e) => onResizeStart(e, pos.handle)}
                    >
                        {/* Visible Pill Handle */}
                        <div className={cn(
                            "bg-white border text-purple-600 border-purple-600 shadow-sm rounded-full",
                            (pos.handle === 'top' || pos.handle === 'bottom') ? "w-8 h-1.5" : "w-1.5 h-8"
                        )} />
                    </div>
                ))}

                {/* Dimensions Badge */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg pointer-events-none whitespace-nowrap opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100">
                    {Math.round(cropArea.width)} × {Math.round(cropArea.height)} px
                </div>
            </div>
        </>
    );
}
