"use client";

import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Text, Transformer, Group, Rect } from "react-konva";
import useImage from "use-image";

export type ElementType = "product" | "text" | "price";

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  src?: string; // For products
  bgSrc?: string; // For price tag backgrounds
  text?: string; // For texts (Offer Price in tags)
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  fontWeight?: string;
  align?: string;
  fill?: string;
  
  // Advanced Price Tag fields
  mrpText?: string;
  mrpFontSize?: number;
  mrpFill?: string;
  mrpFontFamily?: string;
  mrpFontWeight?: string;
  mrpFontStyle?: string;
  mrpVisible?: boolean;
  showPrefix?: boolean;
  priceLayout?: 'stacked' | 'side-by-side';
  
  stroke?: string;
  strokeWidth?: number;
  
  bgType?: 'image' | 'shape';
  bgColor?: string;
  bgBorderColor?: string;
  bgBorderWidth?: number;
  bgBorderRadius?: number;
  
  rotation?: number;
}

interface CanvasStageProps {
  template: any;
  elements: CanvasElement[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  scale: number;
  stageRef: any;
}

// A helper to load and render images from URLs
const URLImage = ({ element, isSelected, onSelect, onChange }: any) => {
  const [image] = useImage(element.src, "anonymous");
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  let renderWidth = element.width || 100;
  let renderHeight = element.height || 100;
  
  if (image) {
    const imgRatio = image.width / image.height;
    const boxRatio = (element.width || 100) / (element.height || 100);
    
    if (imgRatio > boxRatio) {
      renderHeight = (element.width || 100) / imgRatio;
    } else {
      renderWidth = (element.height || 100) * imgRatio;
    }
  }

  return (
    <React.Fragment>
      <KonvaImage
        image={image}
        ref={shapeRef}
        x={element.x + ((element.width || 100) - renderWidth) / 2}
        y={element.y + ((element.height || 100) - renderHeight) / 2}
        width={renderWidth}
        height={renderHeight}
        rotation={element.rotation || 0}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            ...element,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          node.scaleX(1);
          node.scaleY(1);
          
          onChange({
            ...element,
            // Since we adjust X/Y for rendering (center offset), we need to revert it to absolute bounds X/Y
            x: node.x() - ((element.width || 100) - renderWidth) / 2,
            y: node.y() - ((element.height || 100) - renderHeight) / 2,
            rotation: node.rotation(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

// Helper for Price Tag Group
const PriceTagGroup = ({ element, isSelected, onSelect, onChange }: any) => {
  const [bgImage] = useImage(element.bgSrc, "anonymous");
  const groupRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const offerRef = useRef<any>(null);
  const mrpRef = useRef<any>(null);

  const offerTextStr = element.showPrefix !== false ? `SAR ${element.text?.replace(/^SAR\\s*/i, '')}` : element.text?.replace(/^SAR\\s*/i, '');
  const mrpTextStr = element.mrpVisible !== false && element.mrpText ? (element.showPrefix !== false ? `SAR ${element.mrpText.replace(/^SAR\\s*/i, '')}` : element.mrpText.replace(/^SAR\\s*/i, '')) : '';

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const [offerW, setOfferW] = useState(0);
  const [mrpW, setMrpW] = useState(0);

  // Measure text on changes
  useEffect(() => {
    if (offerRef.current) setOfferW(offerRef.current.getTextWidth());
    if (mrpRef.current && mrpTextStr) setMrpW(mrpRef.current.getTextWidth());
    else setMrpW(0);
  }, [offerTextStr, mrpTextStr, element.fontSize, element.mrpFontSize, element.fontFamily, element.fontWeight, element.fontStyle, element.mrpFontWeight, element.mrpFontStyle]);

  // Auto-resize logic
  useEffect(() => {
    if (offerW === 0) return; // Wait for measurement

    const offerH = element.fontSize || 32;
    const mrpH = mrpTextStr ? (element.mrpFontSize || 24) : 0;

    const padding = 16; // 8px on each side max padding constraint
    let reqW = 0;
    let reqH = 0;

    if (element.priceLayout === 'side-by-side') {
      reqW = offerW + mrpW + (mrpW > 0 ? 8 : 0) + padding;
      reqH = Math.max(offerH, mrpH) + padding;
    } else {
      reqW = Math.max(offerW, mrpW) + padding;
      reqH = offerH + mrpH + (mrpH > 0 ? 4 : 0) + padding; // 4px gap
    }

    if ((element.width || 0) < reqW || (element.height || 0) < reqH || element.bgType === 'shape') {
      // If it's a dynamic shape, always sync exactly to reqW/reqH
      const newWidth = element.bgType === 'shape' ? reqW : Math.max(element.width || 0, reqW);
      const newHeight = element.bgType === 'shape' ? reqH : Math.max(element.height || 0, reqH);
      
      if (newWidth !== element.width || newHeight !== element.height) {
        onChange({
          ...element,
          width: newWidth,
          height: newHeight
        });
      }
    }
  }, [offerW, mrpW, offerTextStr, mrpTextStr, element.fontSize, element.mrpFontSize, element.priceLayout, element.width, element.height, element.bgType, onChange]);

  const tagW = element.width || 150;
  const tagH = element.height || 150;

  // Centering calculations
  let offerY = 0;
  let mrpY = 0;
  let offerX = 0;
  let mrpX = 0;
  
  if (element.priceLayout === 'side-by-side') {
    offerY = (tagH - (element.fontSize || 32)) / 2;
    mrpY = (tagH - (element.mrpFontSize || 24)) / 2;
    
    // Total text width for side-by-side
    const totalW = offerW + mrpW + (mrpW > 0 ? 8 : 0);
    const startX = (tagW - totalW) / 2;
    
    mrpX = startX;
    offerX = startX + mrpW + (mrpW > 0 ? 8 : 0);
  } else {
    const totalTextH = (element.fontSize || 32) + (mrpTextStr ? (element.mrpFontSize || 24) + 4 : 0);
    const startY = (tagH - totalTextH) / 2;
    offerY = startY;
    mrpY = startY + (element.fontSize || 32) + 4;
    
    offerX = (tagW - offerW) / 2;
    mrpX = (tagW - mrpW) / 2;
  }

  return (
    <React.Fragment>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        rotation={element.rotation || 0}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            ...element,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = groupRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          
          onChange({
            ...element,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(20, tagW * scaleX),
            height: Math.max(20, tagH * scaleY),
          });
        }}
      >
        {element.bgType === 'shape' || !element.bgSrc ? (
          <Rect
             width={tagW}
             height={tagH}
             fill={element.bgColor || "#e74c3c"}
             cornerRadius={element.bgBorderRadius || 8}
             stroke={element.bgBorderColor || "#c0392b"}
             strokeWidth={element.bgBorderWidth || 0}
             shadowColor="black"
             shadowBlur={4}
             shadowOpacity={0.2}
             shadowOffsetY={2}
          />
        ) : bgImage && (
          <KonvaImage
            image={bgImage}
            width={tagW}
            height={tagH}
          />
        )}
        
        {/* MRP Text */}
        {mrpTextStr && (
          <Text
            ref={mrpRef}
            text={mrpTextStr}
            x={mrpX}
            y={mrpY}
            fontSize={element.mrpFontSize || 24}
            fontFamily={element.mrpFontFamily || "Arial"}
            fontStyle={`${element.mrpFontStyle || "normal"} ${element.mrpFontWeight || "normal"}`}
            fill={element.mrpFill || "white"}
            textDecoration={element.mrpFontStyle?.includes("line-through") ? "line-through" : undefined}
          />
        )}
        
        {/* Offer Price Text */}
        <Text
          ref={offerRef}
          text={offerTextStr}
          x={offerX}
          y={offerY}
          fontSize={element.fontSize || 32}
          fontFamily={element.fontFamily || "Arial"}
          fontStyle={`${element.fontStyle || "normal"} ${element.fontWeight || "normal"}`}
          fill={element.fill || "black"}
          stroke={element.stroke || undefined}
          strokeWidth={element.strokeWidth || 0}
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export default function CanvasStage({ template, elements, setElements, selectedId, setSelectedId, scale, stageRef }: CanvasStageProps) {
  const [bgImage] = useImage(template.imagePath, "anonymous");

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.hasName("bg");
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const handleElementChange = (newElement: CanvasElement) => {
    const newElements = elements.map((el) => (el.id === newElement.id ? newElement : el));
    setElements(newElements);
  };

  return (
    <Stage
      ref={stageRef}
      width={template.width * scale}
      height={template.height * scale}
      scale={{ x: scale, y: scale }}
      onMouseDown={checkDeselect}
      onTouchStart={checkDeselect}
    >
      <Layer>
        {/* Background Image */}
        {bgImage && (
          <KonvaImage
            image={bgImage}
            name="bg"
            width={template.width}
            height={template.height}
          />
        )}
        
        {/* Dynamic Elements */}
        {elements.map((el) => {
          if (el.type === "product") {
            return (
              <URLImage
                key={el.id}
                element={el}
                isSelected={el.id === selectedId}
                onSelect={() => setSelectedId(el.id)}
                onChange={handleElementChange}
              />
            );
          }
          if (el.type === "price") {
            return (
              <PriceTagGroup
                key={el.id}
                element={el}
                isSelected={el.id === selectedId}
                onSelect={() => setSelectedId(el.id)}
                onChange={handleElementChange}
              />
            );
          }
          if (el.type === "text") {
            return (
              <Text
                key={el.id}
                text={el.text}
                x={el.x}
                y={el.y}
                fontSize={el.fontSize || 32}
                fontFamily={el.fontFamily || "Arial"}
                fontStyle={`${el.fontStyle || "normal"} ${el.fontWeight || "normal"}`}
                fill={el.fill || "black"}
                align={el.align || "left"}
                draggable
                onClick={() => setSelectedId(el.id)}
                onTap={() => setSelectedId(el.id)}
                onDragEnd={(e) => {
                  handleElementChange({ ...el, x: e.target.x(), y: e.target.y() });
                }}
              />
            );
          }
          return null;
        })}
      </Layer>
    </Stage>
  );
}
