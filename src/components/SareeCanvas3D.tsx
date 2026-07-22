import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { Product } from "../types";
import { Sparkles, Info, RefreshCw } from "lucide-react";

interface SareeCanvas3DProps {
  product: Product;
  selectedColor?: string;
  selectedSilhouetteId?: string;
  selectedDrapeStyleId?: string;
  lightingPreset?: "daylight" | "evening";
  customSareeColor?: string;
  customBlouseColor?: string;
  customZariColor?: string;
  mannequinMaterial?: string;
  sleeveLength?: string;
}

// 3D Hotspot descriptor
interface Hotspot3D {
  position: [number, number, number];
  title: string;
  description: string;
  tag: string;
}

const DEFAULT_HOTSPOTS: Record<string, Hotspot3D[]> = {
  "prod_saree_banarasi": [
    { position: [0, 1.2, 0.4], title: "Kalsi Brocade Pallu", description: "Heavy gold and silver wire animal motifs hand-woven. Heavy, drapes beautifully.", tag: "Shoulder Pallu" },
    { position: [-0.3, 0.1, 0.55], title: "Atelier Waist Pleats", description: "Structured stacking folds providing vertical integrity. Extremely uniform tucks.", tag: "Waist Pleats" },
    { position: [0.4, -0.9, 0.65], title: "Shikargah border edge", description: "Dense dual-tone border lining prevents hem fraying on grand banyans.", tag: "Hem border" }
  ],
  "prod_saree_chanderi": [
    { position: [0, 1.1, 0.35], title: "Sheer Scallop finish", description: "Featherlight borders. Drapes with delicate transparent cascading layers.", tag: "Sheer Pallu" },
    { position: [-0.2, 0.2, 0.5], title: "Mountain Mist Tucks", description: "Delicate light fold volume. Lightweight sheer Kora silk holds shapes casually.", tag: "Fluid Tucks" },
    { position: [0.35, -0.8, 0.6], title: "Buti Embroidery", description: "Copper and silver bootis spun asymmetrically on beautiful translucent fabric.", tag: "Tissue Work" }
  ],
  "prod_saree_patola": [
    { position: [0, 1.15, 0.38], title: "Reversible Ikats", description: "Flawless twin-sided handloom design with vibrant double-dye prints.", tag: "Double Ikat" },
    { position: [-0.25, 0.15, 0.52], title: "Nari Kunjar Weave Grid", description: "Auspicious repeating grids of elephant, parrot, and royal court dancer motifs.", tag: "Traditional Grid" },
    { position: [0.38, -0.85, 0.62], title: "Satin Silk Hem borders", description: "Lustrous heavy crimson borders with fine gold leaf pattern finishes.", tag: "Satin Hem" }
  ]
};

// Internal model representing the draped royal mannequin with real female body anatomy
function SareeModel({ 
  product, 
  colorHex, 
  onHoverHotspot,
  selectedSilhouetteId = "svelte",
  selectedDrapeStyleId = "nivi",
  customBlouseColor = "#9d174d",
  customZariColor = "#eab308",
  mannequinMaterial = "rosewood",
  sleeveLength = "short"
}: { 
  product: Product; 
  colorHex: string; 
  onHoverHotspot: (hotspot: Hotspot3D | null) => void;
  selectedSilhouetteId?: string;
  selectedDrapeStyleId?: string;
  customBlouseColor?: string;
  customZariColor?: string;
  mannequinMaterial?: string;
  sleeveLength?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pleatsRef = useRef<THREE.Group>(null);
  const bordersRef = useRef<THREE.Mesh>(null);

  // Slow ambient breathing rotation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Subtle float
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.03 - 0.2;
    }
    if (pleatsRef.current) {
      // Gentle breeze simulator on folds
      pleatsRef.current.rotation.y = Math.sin(t * 0.8) * 0.02;
    }
  });

  const hotspots = DEFAULT_HOTSPOTS[product.id] || [
    { position: [0, 1.1, 0.35], title: "Pallu Cascade", description: "Graceful falling panel draping from left shoulder to thigh back.", tag: "Masterpiece" },
    { position: [-0.2, 0.1, 0.52], title: "Precision Waist Pleats", description: "Individually hand-pressed parallel folds that contour gracefully.", tag: "Waist Flat" }
  ];

  // Map fabric type to material specifications
  const isSheer = product.fabric.toLowerCase().includes("chanderi") || product.fabric.toLowerCase().includes("organza") || product.fabric.toLowerCase().includes("sheer");

  // Define realistic women's body archetype scales
  const bodyArchetypes: Record<string, {
    scaleY: number;       // overall height multiplier
    bustRadius: number;   // size of the chest curves
    waistRadius: number;  // waist size (hourglass narrowness)
    hipsRadius: number;   // hip size (curves)
    shoulderWidth: number;// shoulder span
    neckLength: number;  // neck height
    statureDesc: string;
  }> = {
    svelte: {
      scaleY: 1.05,
      bustRadius: 0.16,
      waistRadius: 0.18,
      hipsRadius: 0.28,
      shoulderWidth: 0.44,
      neckLength: 0.20,
      statureDesc: "Svelte & slender proportional frame"
    },
    curvy: {
      scaleY: 1.0,
      bustRadius: 0.25,      // Enhanced bust curves
      waistRadius: 0.19,     // Tapered waist
      hipsRadius: 0.42,      // Significantly fuller hips for dramatic real female curves!
      shoulderWidth: 0.48,   // Slightly broader deluxe shoulder span
      neckLength: 0.16,
      statureDesc: "Curvy, full-contoured hourglass body frame"
    },
    petite: {
      scaleY: 0.88,          // Shorter, compact stature
      bustRadius: 0.14,
      waistRadius: 0.17,
      hipsRadius: 0.25,
      shoulderWidth: 0.38,
      neckLength: 0.15,
      statureDesc: "Dainty petite, compact sovereign stature"
    },
    tall: {
      scaleY: 1.20,          // Statuesque, tall stature
      bustRadius: 0.17,
      waistRadius: 0.19,
      hipsRadius: 0.29,
      shoulderWidth: 0.46,
      neckLength: 0.23,
      statureDesc: "Tall statuesque, elongated elegant frame"
    }
  };

  const targetBody = bodyArchetypes[selectedSilhouetteId as keyof typeof bodyArchetypes] || bodyArchetypes.svelte;
  const [drapeProps, setDrapeProps] = useState(targetBody);
  const lastDrapeStyleIdRef = useRef(selectedDrapeStyleId);

  // Smooth elastic spring dynamics simulator for realistic physical cloth draping
  useEffect(() => {
    let frameId: number;
    let current = { ...drapeProps };
    const target = { ...targetBody };
    
    // Check if drape style changed to inject a physical fabric sway impulse
    let drapeImpulse = 0;
    if (lastDrapeStyleIdRef.current !== selectedDrapeStyleId) {
      drapeImpulse = 0.8; // Impulse magnitude
      lastDrapeStyleIdRef.current = selectedDrapeStyleId;
    }

    const velocity = {
      scaleY: drapeImpulse * 0.05,
      bustRadius: drapeImpulse * 0.02,
      waistRadius: drapeImpulse * -0.03,
      hipsRadius: drapeImpulse * 0.05,
      shoulderWidth: drapeImpulse * -0.04,
      neckLength: 0,
    };

    // Physics parameters (stiffness & friction coefficients)
    const stiffness = 160.0; // Moderate spring stiffness for beautiful natural elasticity
    const damping = 12.0;    // Fluid resistance/drag coefficient
    let lastTime = performance.now();

    const animate = (time: number) => {
      // Delta time capped to avoid frame spikes during low background FPS / tab focus switches
      const dt = Math.min((time - lastTime) / 1000, 0.03); 
      lastTime = time;

      const keys = ["scaleY", "bustRadius", "waistRadius", "hipsRadius", "shoulderWidth", "neckLength"] as const;
      let isSettled = true;
      const nextProps = { ...current };

      for (const key of keys) {
        const x_cur = current[key];
        const x_tar = target[key];
        const v_cur = velocity[key];

        // Hooke's Law with Viscous Damping Force
        // F = -k*x - c*v
        const force = -stiffness * (x_cur - x_tar) - damping * v_cur;
        const v_next = v_cur + force * dt;
        const x_next = x_cur + v_next * dt;

        velocity[key] = v_next;
        nextProps[key] = x_next;

        // Keep simulating if still outside the tolerance limit
        if (Math.abs(x_next - x_tar) > 0.0001 || Math.abs(v_next) > 0.0001) {
          isSettled = false;
        }
      }

      current = nextProps;
      setDrapeProps(nextProps);

      if (!isSettled) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [selectedSilhouetteId, selectedDrapeStyleId]);

  const body = drapeProps;

  // Layout coordinates (anchored from -1.1 where the pedestal stand column rests to +1.2 up)
  const baseScaleY = body.scaleY;
  
  // High-fidelity mannequin material definitions (luxurious rose gold, rich bronze, or polished lacquer wood)
  let skinMaterialProps = {
    color: "#3d322b",
    roughness: 0.25,
    metalness: 0.6,
  };

  if (mannequinMaterial === "marble") {
    skinMaterialProps = { color: "#e5e5e0", roughness: 0.1, metalness: 0.05 };
  } else if (mannequinMaterial === "brass") {
    skinMaterialProps = { color: "#d97706", roughness: 0.18, metalness: 0.92 };
  } else if (mannequinMaterial === "ivory") {
    skinMaterialProps = { color: "#fffff0", roughness: 0.08, metalness: 0.25 };
  }

  const fabricMaterialProps = {
    color: colorHex,
    roughness: isSheer ? 0.35 : 0.18,
    metalness: isSheer ? 0.15 : 0.38,
    transparent: isSheer,
    opacity: isSheer ? 0.72 : 1,
  };

  const zariMaterialProps = {
    color: customZariColor,
    roughness: 0.1,
    metalness: 0.95,
  };

  const blouseMaterialProps = {
    color: customBlouseColor,
    roughness: 0.3,
    metalness: 0.15,
  };

  // Vertical placement values normalized (scaled by baseScaleY)
  const skirtY = -0.32 * baseScaleY;
  const skirtHeight = 1.35 * baseScaleY;

  const waistY = 0.3 * baseScaleY;
  const thoraxY = 0.65 * baseScaleY;
  const shouldersY = 0.92 * baseScaleY;
  const neckY = 1.03 * baseScaleY;
  const headY = 1.18 * baseScaleY;

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* 1. MANNEQUIN STAND / COLUMN PEDESTAL */}
      <mesh position={[0, -1.8, 0]}>
        <cylinderGeometry args={[0.55, 0.6, 0.15, 32]} />
        <meshStandardMaterial color="#1f1a16" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Stand Pillar Chrome/Brass */}
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 1.4, 16]} />
        <meshStandardMaterial color="#a16207" roughness={0.15} metalness={0.92} />
      </mesh>

      {/* 2. REALISTIC WOMEN'S BODY MANNEQUIN ANATOMY (HIDDEN UNDER DRAPES BUT FORMING SILHOUETTE) */}
      <group>
        {/* Head: Highly polished display form */}
        <mesh position={[0, headY, 0]}>
          <sphereGeometry args={[0.11, 32, 32]} scale={[1, 1.25, 0.95]} />
          <meshStandardMaterial {...skinMaterialProps} />
        </mesh>

        {/* Elegant Neck */}
        <mesh position={[0, neckY, 0]}>
          <cylinderGeometry args={[0.042, 0.048, 0.11, 24]} />
          <meshStandardMaterial {...skinMaterialProps} />
        </mesh>

        {/* Sloped High-Fashion Woman Shoulders */}
        <mesh position={[0, shouldersY, 0]}>
          <cylinderGeometry args={[body.shoulderWidth * 0.45, body.shoulderWidth * 0.5, 0.07, 32]} scale={[1, 1, 0.65]} />
          <meshStandardMaterial {...skinMaterialProps} />
        </mesh>
        
        {/* Left Shoulder Joint */}
        <mesh position={[-body.shoulderWidth * 0.45, shouldersY - 0.02, 0]}>
          <sphereGeometry args={[0.052, 24, 24]} />
          <meshStandardMaterial {...skinMaterialProps} />
        </mesh>
        {/* Right Shoulder Joint */}
        <mesh position={[body.shoulderWidth * 0.45, shouldersY - 0.02, 0]}>
          <sphereGeometry args={[0.052, 24, 24]} />
          <meshStandardMaterial {...skinMaterialProps} />
        </mesh>

        {/* Slender Upper Arms Hanging Gracefully */}
        <mesh position={[-body.shoulderWidth * 0.47, shouldersY - 0.28, 0.02]} rotation={[0, 0, 0.12]}>
          <cylinderGeometry args={[0.032, 0.028, 0.48, 16]} />
          <meshStandardMaterial {...skinMaterialProps} />
        </mesh>
        <mesh position={[body.shoulderWidth * 0.47, shouldersY - 0.28, 0.02]} rotation={[0, 0, -0.12]}>
          <cylinderGeometry args={[0.032, 0.028, 0.48, 16]} />
          <meshStandardMaterial {...skinMaterialProps} />
        </mesh>

        {/* Thorax / Upper Torso (Chest Taper) */}
        <mesh position={[0, thoraxY, 0]}>
          <cylinderGeometry args={[body.shoulderWidth * 0.42, body.waistRadius, 0.38, 32]} />
          <meshStandardMaterial {...skinMaterialProps} />
        </mesh>

        {/* TWO EMBEDDED SOPHISTICATED BUST SPHERES (to establish the real women body curves) */}
        <mesh position={[-0.07, thoraxY + 0.04, body.waistRadius * 0.85]} scale={[1.05, 1.05, 1.2]}>
          <sphereGeometry args={[body.bustRadius * 0.58, 32, 32]} />
          <meshStandardMaterial {...skinMaterialProps} />
        </mesh>
        <mesh position={[0.07, thoraxY + 0.04, body.waistRadius * 0.85]} scale={[1.05, 1.05, 1.2]}>
          <sphereGeometry args={[body.bustRadius * 0.58, 32, 32]} />
          <meshStandardMaterial {...skinMaterialProps} />
        </mesh>

        {/* 3D Blouse Customizer Overlay meshes */}
        <mesh position={[0, thoraxY + 0.02, 0]}>
          <cylinderGeometry args={[body.shoulderWidth * 0.43, body.waistRadius * 1.01, 0.35, 32]} />
          <meshStandardMaterial {...blouseMaterialProps} />
        </mesh>
        <mesh position={[-0.07, thoraxY + 0.04, body.waistRadius * 0.86]} scale={[1.06, 1.06, 1.21]}>
          <sphereGeometry args={[body.bustRadius * 0.58, 32, 32]} />
          <meshStandardMaterial {...blouseMaterialProps} />
        </mesh>
        <mesh position={[0.07, thoraxY + 0.04, body.waistRadius * 0.86]} scale={[1.06, 1.06, 1.21]}>
          <sphereGeometry args={[body.bustRadius * 0.58, 32, 32]} />
          <meshStandardMaterial {...blouseMaterialProps} />
        </mesh>
        <mesh position={[0, shouldersY, 0]}>
          <cylinderGeometry args={[body.shoulderWidth * 0.46, body.shoulderWidth * 0.51, 0.08, 32]} scale={[1, 1, 0.66]} />
          <meshStandardMaterial {...blouseMaterialProps} />
        </mesh>

        {/* Blouse sleeves conditionally based on sleeveLength */}
        {sleeveLength !== "sleeveless" && (
          <mesh 
            position={[-body.shoulderWidth * 0.47 - (sleeveLength === "short" ? 0.01 : sleeveLength === "elbow" ? 0.015 : 0.02), shouldersY - (sleeveLength === "short" ? 0.115 : sleeveLength === "elbow" ? 0.19 : 0.27), 0.02]} 
            rotation={[0, 0, 0.12]}
          >
            <cylinderGeometry 
              args={[
                0.035, 
                sleeveLength === "short" ? 0.033 : sleeveLength === "elbow" ? 0.031 : 0.029, 
                sleeveLength === "short" ? 0.15 : sleeveLength === "elbow" ? 0.30 : 0.46, 
                16
              ]} 
            />
            <meshStandardMaterial {...blouseMaterialProps} />
          </mesh>
        )}
        {sleeveLength !== "sleeveless" && (
          <mesh 
            position={[body.shoulderWidth * 0.47 + (sleeveLength === "short" ? 0.01 : sleeveLength === "elbow" ? 0.015 : 0.02), shouldersY - (sleeveLength === "short" ? 0.115 : sleeveLength === "elbow" ? 0.19 : 0.27), 0.02]} 
            rotation={[0, 0, -0.12]}
          >
            <cylinderGeometry 
              args={[
                0.035, 
                sleeveLength === "short" ? 0.033 : sleeveLength === "elbow" ? 0.031 : 0.029, 
                sleeveLength === "short" ? 0.15 : sleeveLength === "elbow" ? 0.30 : 0.46, 
                16
              ]} 
            />
            <meshStandardMaterial {...blouseMaterialProps} />
          </mesh>
        )}

        {/* Slimmed Waist Junction */}
        <mesh position={[0, waistY + 0.05, 0]}>
          <cylinderGeometry args={[body.waistRadius, body.hipsRadius * 0.88, 0.28, 32]} />
          <meshStandardMaterial {...skinMaterialProps} />
        </mesh>

        {/* Hips / Pelvis curves */}
        <mesh position={[0, waistY - 0.18, 0]}>
          <cylinderGeometry args={[body.hipsRadius * 0.88, body.hipsRadius, 0.26, 32]} />
          <meshStandardMaterial {...skinMaterialProps} />
        </mesh>
      </group>

      {/* 3. DYNAMIC DRAPED SAREE FABRIC (ADAPTS TO BODY FRAME AND SELECTED DRAPE STYLE) */}
      
      {/* Lower Body Drape: Single elegant flared skirt (Classic) OR dual-trouser wraps (Dhoti Style) */}
      {selectedDrapeStyleId === "dhoti" ? (
        <group>
          {/* Left Dhoti Pant Leg with beautiful taper and diagonal folds */}
          <mesh position={[-body.hipsRadius * 0.4, skirtY - 0.05, 0.01]} rotation={[0, 0, 0.08]}>
            <cylinderGeometry args={[body.hipsRadius * 0.45, body.hipsRadius * 0.32, skirtHeight * 0.88, 16, 4]} />
            <meshStandardMaterial {...fabricMaterialProps} />
          </mesh>
          {/* Right Dhoti Pant Leg */}
          <mesh position={[body.hipsRadius * 0.4, skirtY - 0.05, 0.01]} rotation={[0, 0, -0.08]}>
            <cylinderGeometry args={[body.hipsRadius * 0.45, body.hipsRadius * 0.32, skirtHeight * 0.88, 16, 4]} />
            <meshStandardMaterial {...fabricMaterialProps} />
          </mesh>

          {/* Golden cuff borders at the ankles of dhoti pants */}
          <mesh position={[-body.hipsRadius * 0.42, skirtY - 0.42 * baseScaleY, 0.02]} rotation={[0, 0, 0.08]}>
            <cylinderGeometry args={[0.13, 0.135, 0.06, 16]} />
            <meshStandardMaterial {...zariMaterialProps} />
          </mesh>
          <mesh position={[body.hipsRadius * 0.42, skirtY - 0.42 * baseScaleY, 0.02]} rotation={[0, 0, -0.08]}>
            <cylinderGeometry args={[0.13, 0.135, 0.06, 16]} />
            <meshStandardMaterial {...zariMaterialProps} />
          </mesh>

          {/* Central Dhoti Pleats (Kasta cowl/pleats flowing back-to-front between legs) */}
          <mesh position={[0, skirtY + 0.1, 0.12]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.08, skirtHeight * 0.72, 0.12]} />
            <meshStandardMaterial {...fabricMaterialProps} />
          </mesh>
          
          {/* Zari running along the dhoti vertical pleat splits */}
          <mesh position={[0, skirtY + 0.1, 0.18]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.025, skirtHeight * 0.73, 0.025]} />
            <meshStandardMaterial {...zariMaterialProps} />
          </mesh>
        </group>
      ) : (
        /* Classical Single Continuous Wrapping Skirt (Sari base) matching hip radius */
        <mesh position={[0, skirtY, 0]}>
          <cylinderGeometry args={[body.hipsRadius * 0.95, body.hipsRadius * 1.35, skirtHeight, 32, 8]} />
          <meshStandardMaterial {...fabricMaterialProps} />
        </mesh>
      )}

      {/* Skirt Base Hem zari trim wrapping around bottom (Hidden or adapted for Dhoti) */}
      {selectedDrapeStyleId !== "dhoti" && (
        <mesh ref={bordersRef} position={[0, skirtY - skirtHeight / 2 + 0.06, 0]}>
          <cylinderGeometry args={[body.hipsRadius * 1.33, body.hipsRadius * 1.35, 0.09, 32, 1]} />
          <meshStandardMaterial {...zariMaterialProps} />
        </mesh>
      )}

      {/* 3D Vertical Pleat Folds (Front waist tucks) - Adapts styling dynamically */}
      <group ref={pleatsRef} position={[-0.03, skirtY + 0.1, body.hipsRadius * 0.75]}>
        {selectedDrapeStyleId === "gujarati" ? (
          /* Gujarati: Pleats are tucked on right/front left waist fan-styled cascade */
          Array.from({ length: 6 }).map((_, i) => {
            const xOffset = 0.15 + (i - 3) * 0.035;
            const zOffset = Math.sin(i * 1.2) * 0.02;
            return (
              <mesh key={i} position={[xOffset, -0.1, zOffset - 0.05]} rotation={[0, 0, -0.06 * (i - 2)]}>
                <boxGeometry args={[0.035, skirtHeight * 0.8, 0.04]} />
                <meshStandardMaterial {...fabricMaterialProps} />
              </mesh>
            );
          })
        ) : selectedDrapeStyleId === "bengali" ? (
          /* Bengali Style: Broad box pleats covering the front waist uniformly */
          Array.from({ length: 4 }).map((_, i) => {
            const xOffset = (i - 1.5) * 0.09;
            return (
              <mesh key={i} position={[xOffset, 0, 0]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.075, skirtHeight * 0.88, 0.05]} />
                <meshStandardMaterial {...fabricMaterialProps} />
              </mesh>
            );
          })
        ) : selectedDrapeStyleId === "dhoti" ? (
          /* Dhoti Tucks cascading diagonally outward */
          Array.from({ length: 4 }).map((_, i) => {
            const xOffset = (i - 1.5) * 0.08;
            const angleZ = (i - 1.5) * 0.15;
            return (
              <mesh key={i} position={[xOffset, -0.2, -0.1]} rotation={[0.1, 0, angleZ]}>
                <boxGeometry args={[0.025, skirtHeight * 0.45, 0.03]} />
                <meshStandardMaterial {...fabricMaterialProps} />
              </mesh>
            );
          })
        ) : (
          /* Standard Classic Nivi Pleats: Stiff parallel vertical stacks */
          Array.from({ length: 7 }).map((_, i) => {
            const xOffset = (i - 3) * 0.042;
            const zOffset = Math.sin(i * 1.1) * 0.025;
            return (
              <mesh key={i} position={[xOffset, 0, zOffset]} rotation={[0, 0, 0.015 * (i - 3)]}>
                <boxGeometry args={[0.036, skirtHeight * 0.9, 0.05]} />
                <meshStandardMaterial {...fabricMaterialProps} />
              </mesh>
            );
          })
        )}
      </group>

      {/* 4. UPPER PORTION DRAPE: CHEST SLING & SHOULDER PALLU (DYNAMIC BASED ON STYLE) */}
      <group>
        {selectedDrapeStyleId === "gujarati" ? (
          /* Gujarati Pallu: Pleats fall over the front of the right shoulder and open up */
          <group position={[0, thoraxY, 0.05]}>
            {/* Front Wide Overlay covering chest drape from right shoulder down to left waist */}
            <mesh position={[0.06, 0.16, body.waistRadius * 0.9]} rotation={[0.12, -0.22, -0.32]}>
              <boxGeometry args={[0.36, 0.42, 0.04]} />
              <meshStandardMaterial {...fabricMaterialProps} />
            </mesh>
            
            {/* Heavy Gold Border decorating of front Gujarati panel */}
            <mesh position={[0.07, 0.14, body.waistRadius * 0.95]} rotation={[0.12, -0.22, -0.32]}>
              <boxGeometry args={[0.37, 0.06, 0.05]} />
              <meshStandardMaterial {...zariMaterialProps} />
            </mesh>

            {/* Over right shoulder wrap */}
            <mesh position={[body.shoulderWidth * 0.3, shouldersY - thoraxY + 0.02, 0.01]} rotation={[0, 0, -0.2]}>
              <boxGeometry args={[0.16, 0.15, 0.08]} />
              <meshStandardMaterial {...fabricMaterialProps} />
            </mesh>
            
            {/* Back Wrap coming from left waist to back right shoulder */}
            <mesh position={[-0.08, -0.05, -body.waistRadius * 0.9]} rotation={[-0.1, 0.3, 0.4]}>
              <boxGeometry args={[0.42, 0.12, 0.04]} />
              <meshStandardMaterial {...fabricMaterialProps} />
            </mesh>
          </group>
        ) : selectedDrapeStyleId === "bengali" ? (
          /* Bengali Double Shoulder Pallu: Symmetrical wraps over both back and front shoulders */
          <group position={[0, thoraxY, 0.05]}>
            {/* Symmetrical front wrap across chest breast line */}
            <mesh position={[0, 0.08, body.waistRadius * 0.88]} rotation={[0, 0, 0]}>
              <boxGeometry args={[body.shoulderWidth * 0.72, 0.12, 0.05]} />
              <meshStandardMaterial {...fabricMaterialProps} />
            </mesh>
            <mesh position={[0, 0.08, body.waistRadius * 0.92]} rotation={[0, 0, 0]}>
              <boxGeometry args={[body.shoulderWidth * 0.73, 0.03, 0.052]} />
              <meshStandardMaterial {...zariMaterialProps} />
            </mesh>

            {/* Falling cowl over left shoulder */}
            <mesh position={[-body.shoulderWidth * 0.28, 0.28, body.waistRadius * 0.5]} rotation={[0.12, 0, 0.1]}>
              <boxGeometry args={[0.13, 0.35, 0.06]} />
              <meshStandardMaterial {...fabricMaterialProps} />
            </mesh>
            <mesh position={[-body.shoulderWidth * 0.28, 0.18, body.waistRadius * 0.55]} rotation={[0.12, 0, 0.1]}>
              <boxGeometry args={[0.135, 0.05, 0.07]} />
              <meshStandardMaterial {...zariMaterialProps} />
            </mesh>

            {/* Throwback cowl over right shoulder (heavy ceremonial tail hanging back-to-front) */}
            <mesh position={[body.shoulderWidth * 0.28, 0.26, -body.waistRadius * 0.4]} rotation={[-0.1, 0, -0.1]}>
              <boxGeometry args={[0.11, 0.42, 0.05]} />
              <meshStandardMaterial {...fabricMaterialProps} />
            </mesh>
            {/* Golden Key/Ornament Weight hanging on right shoulder */}
            <mesh position={[body.shoulderWidth * 0.28, 0.06, -body.waistRadius * 0.38]}>
              <sphereGeometry args={[0.038, 16, 16]} />
              <meshStandardMaterial {...zariMaterialProps} roughness={0.05} />
            </mesh>
          </group>
        ) : (
          /* Classical Nivi / Dhoti style: Diagonal chest wrap extending over left shoulder to back */
          <group position={[0, thoraxY, 0.05]}>
            {/* Diagonal Chest Wrap */}
            <mesh position={[0.04, 0.05, body.waistRadius * 0.85]} rotation={[0.38, 0.5, -0.66]}>
              <boxGeometry args={[body.shoulderWidth * 1.15, 0.14, 0.065]} />
              <meshStandardMaterial {...fabricMaterialProps} />
            </mesh>
            
            {/* Metallic Gold Trim on Chest Sling */}
            <mesh position={[0.03, 0.1, body.waistRadius * 0.86]} rotation={[0.38, 0.5, -0.66]}>
              <boxGeometry args={[body.shoulderWidth * 1.16, 0.03, 0.072]} />
              <meshStandardMaterial {...zariMaterialProps} />
            </mesh>

            {/* Left Shoulder Wrap Overlay */}
            <mesh position={[-body.shoulderWidth * 0.22, 0.28, body.waistRadius * 0.5]} rotation={[0.15, 0, 0.15]}>
              <boxGeometry args={[0.15, 0.3, 0.08]} />
              <meshStandardMaterial {...fabricMaterialProps} />
            </mesh>

            {/* Back Hanging flowing Pallu Cascade */}
            <mesh position={[-body.shoulderWidth * 0.25, -0.18, -body.waistRadius * 0.8]} rotation={[-0.04, 0.05, 0]}>
              <boxGeometry args={[0.14, skirtHeight * 0.72, 0.04]} />
              <meshStandardMaterial {...fabricMaterialProps} />
            </mesh>
            
            {/* Embroidered edge trim at the base of Pallu */}
            <mesh position={[-body.shoulderWidth * 0.25, -0.18 - skirtHeight * 0.36 + 0.07, -body.waistRadius * 0.78]} rotation={[-0.04, 0.05, 0]}>
              <boxGeometry args={[0.142, 0.14, 0.045]} />
              <meshStandardMaterial {...zariMaterialProps} />
            </mesh>
          </group>
        )}
      </group>

      {/* 5. GENTLY ROTATING DUST PARTICLES */}
      {Array.from({ length: 15 }).map((_, idx) => {
        const phi = Math.acos(-1 + (2 * idx) / 15);
        const theta = Math.sqrt(15 * Math.PI) * phi;
        const radius = body.hipsRadius * 1.5 + Math.random() * 0.1;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = -0.6 + Math.random() * 1.8;
        const z = radius * Math.sin(phi) * Math.sin(theta);
        return (
          <mesh key={idx} position={[x, y, z]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color="#fcd34d" transparent opacity={0.6} />
          </mesh>
        );
      })}

      {/* 6. INTERACTIVE 3D HOTSPOT TRIGGERS */}
      {hotspots.map((hs, i) => (
        <group key={i} position={[hs.position[0], hs.position[1] * baseScaleY, hs.position[2]]}>
          {/* Outer glowing ring */}
          <mesh>
            <torusGeometry args={[0.045, 0.008, 8, 24]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
          {/* Inner core trigger sphere */}
          <mesh
            onPointerOver={(e) => {
              e.stopPropagation();
              onHoverHotspot(hs);
            }}
            onPointerOut={() => onHoverHotspot(null)}
          >
            <sphereGeometry args={[0.032, 16, 16]} />
            <meshBasicMaterial color="#fde047" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Map database colors to realistic 3D dress rendering colors
export function getThreeSareeColor(product: Product, selectAccent: string = ""): string {
  const normColor = selectAccent.toLowerCase() || product.colors[0]?.toLowerCase() || "";
  if (normColor.includes("red") || normColor.includes("shahi") || normColor.includes("vermilion")) return "#991b1b";
  if (normColor.includes("mint") || normColor.includes("teal") || normColor.includes("emerald")) return "#0d9488";
  if (normColor.includes("peach") || normColor.includes("coral")) return "#f97316";
  if (normColor.includes("pink") || normColor.includes("cerise") || normColor.includes("magenta")) return "#be185d";
  if (normColor.includes("purple") || normColor.includes("jamuni")) return "#6b21a8";
  if (normColor.includes("gold") || normColor.includes("zari") || normColor.includes("mustard")) return "#b45309";
  if (normColor.includes("blue") || normColor.includes("indigo")) return "#1d4ed8";

  // Fallbacks based on category IDs
  if (product.id === "prod_saree_banarasi") return "#881337"; // Crimson Rich Banarasi
  if (product.id === "prod_saree_chanderi") return "#0f766e"; // Sheer Chanderi Teal
  if (product.id === "prod_saree_patola") return "#9d174d"; // Patola Bright Pink

  return "#78350f"; // Fallback Warm Royal Ochre
}

export default function SareeCanvas3D({ 
  product, 
  selectedColor,
  selectedSilhouetteId = "svelte",
  selectedDrapeStyleId = "nivi",
  lightingPreset = "evening",
  customSareeColor,
  customBlouseColor,
  customZariColor,
  mannequinMaterial,
  sleeveLength
}: SareeCanvas3DProps) {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot3D | null>(null);
  const [isWebGlSupported, setIsWebGlSupported] = useState(true);

  // Check WebGL availability safely to avoid crashes
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const support = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setIsWebGlSupported(support);
    } catch (e) {
      setIsWebGlSupported(false);
    }
  }, []);

  const themeColor = customSareeColor || getThreeSareeColor(product, selectedColor);

  return (
    <div id="three-fiber-saree-wrapper" className="w-full h-full relative bg-radial from-stone-900 to-stone-950 flex flex-col justify-between">
      
      {/* 3D View Overlays and Controls */}
      <div className="absolute top-3 left-3 z-10 space-y-1">
        <div className="bg-stone-900/90 border border-amber-500/30 px-2.5 py-1 rounded text-[9px] text-amber-400 font-serif font-bold uppercase tracking-widest flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          Interactive R3F 3D Engine
        </div>
        <p className="text-[8.5px] text-stone-400 font-sans tracking-wide">
          🖱 Left Click + Drag to rotate · Pinch to zoom · Hover gold rings for details
        </p>
      </div>

      {isWebGlSupported ? (
        <div className="flex-1 w-full h-[300px] sm:h-full relative select-none">
          <Canvas 
            flat 
            gl={{ antialias: true, alpha: false }}
            camera={{ position: [0, 0.4, 2.8], fov: 45 }}
          >
            <color attach="background" args={[lightingPreset === "daylight" ? "#eae6e1" : "#12100e"]} />
            
            {/* Atmospheric subtle fog */}
            <fog attach="fog" args={[lightingPreset === "daylight" ? "#eae6e1" : "#12100e", 2, 5]} />

            {/* HIGH-END STUDIO LIGHTING RIG WITH ENVIRONMENT & CONTACT SHADOWS */}
            <ambientLight intensity={lightingPreset === "daylight" ? 0.75 : 0.4} color={lightingPreset === "daylight" ? "#ffffff" : "#fdf4ff"} />
            <pointLight position={[2, 2, 2]} intensity={lightingPreset === "daylight" ? 0.5 : 0.9} color={lightingPreset === "daylight" ? "#fef08a" : "#fde047"} />
            
            {/* Direct spotlight focusing on front folds shimmering */}
            <spotLight 
              position={[1, 3, 2]} 
              angle={0.4} 
              penumbra={0.6} 
              intensity={lightingPreset === "daylight" ? 1.4 : 2.5} 
              color={lightingPreset === "daylight" ? "#ffffff" : "#ffffff"} 
              castShadow 
            />
            {/* Golden Rim Backlight */}
            <directionalLight position={[-2, 1, -2]} intensity={lightingPreset === "daylight" ? 0.4 : 1.0} color={lightingPreset === "daylight" ? "#e0f2fe" : "#fcd34d"} />

            {/* High-fidelity studio reflections and soft lighting to enrich model fabrics */}
            <Environment preset={lightingPreset === "daylight" ? "apartment" : "sunset"} />

            {/* ContactShadows to provide realistic luxury-focused soft contact shading under the pedestal */}
            <ContactShadows 
              position={[0, -2.08, 0]} 
              opacity={0.85} 
              scale={5} 
              blur={2.5} 
              far={1.5} 
              color="#000000" 
            />

            <SareeModel 
              product={product} 
              colorHex={themeColor} 
              onHoverHotspot={(hs) => setActiveHotspot(hs)} 
              selectedSilhouetteId={selectedSilhouetteId}
              selectedDrapeStyleId={selectedDrapeStyleId}
              customBlouseColor={customBlouseColor}
              customZariColor={customZariColor}
              mannequinMaterial={mannequinMaterial}
              sleeveLength={sleeveLength}
            />

            {/* Elegant OrbitControls */}
            <OrbitControls 
              enableZoom={true} 
              minDistance={1.4} 
              maxDistance={4.2} 
              enablePan={false}
              maxPolarAngle={Math.PI / 1.7} // Limit bottom view under pedestal
              minPolarAngle={Math.PI / 3}   // Limit extreme top view
              autoRotate={false}
            />
          </Canvas>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 bg-stone-950">
          <RefreshCw size={24} className="text-amber-500/80" />
          <div>
            <p className="font-serif text-amber-200 text-xs">Atelier 3D Canvas offline</p>
            <p className="text-[9px] text-stone-500 leading-relaxed max-w-xs mt-1">WebGL is disabled or unsupported in this sandboxed window. Please test inside our premium photo draping modes!</p>
          </div>
        </div>
      )}

      {/* Dynamic Hotspot Information Panel inside 3D Canvas space */}
      <div className="p-3 bg-stone-950 border-t border-stone-850 z-10 flex items-center justify-between min-h-[50px]">
        {activeHotspot ? (
          <div className="flex items-start gap-2.5 animate-fade-in text-left">
            <span className="bg-amber-500 text-stone-950 text-[8px] font-serif uppercase tracking-widest px-1.5 py-0.5 rounded font-bold mt-0.5 shrink-0">
              {activeHotspot.tag}
            </span>
            <div>
              <h4 className="font-serif text-[11px] text-amber-200 uppercase tracking-wider font-bold">
                {activeHotspot.title}
              </h4>
              <p className="text-[10px] text-stone-300 font-sans leading-relaxed">
                {activeHotspot.description}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[9.5px] text-stone-400 font-sans italic">
            <Info size={11} className="text-amber-500/80" />
            <span>Click or hover on any of the glittering gold hotspots to dissect raw handloom architecture.</span>
          </div>
        )}
      </div>

    </div>
  );
}
