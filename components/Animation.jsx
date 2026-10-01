import React, { useMemo } from 'react';
import LottieView from 'lottie-react-native';
import { useReduceMotion } from '../lib/motion';
import { useTheme } from '../theme';

// In dark mode, near-black line art would vanish on the dark background; swap it for the text colour.
const DARK_INK = [0.91, 0.95, 0.96];
const isNearBlack = (c) => c.length >= 3 && c[0] < 0.08 && c[1] < 0.08 && c[2] < 0.08;

function fixColorValue(v) {
  if (Array.isArray(v) && typeof v[0] === 'number' && isNearBlack(v)) return [...DARK_INK, ...(v.length > 3 ? [v[3]] : [])];
  return v;
}

function recolor(node) {
  if (Array.isArray(node)) return node.map(recolor);
  if (node && typeof node === 'object') {
    const out = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === 'c' && value && typeof value === 'object' && 'k' in value) {
        const k = value.k;
        const fixed = Array.isArray(k) && k.length && typeof k[0] === 'object' && !Array.isArray(k[0])
          ? k.map((kf) => ({ ...kf, s: kf.s ? fixColorValue(kf.s) : kf.s, e: kf.e ? fixColorValue(kf.e) : kf.e }))
          : fixColorValue(k);
        out[key] = { ...value, k: fixed };
      } else {
        out[key] = recolor(value);
      }
    }
    return out;
  }
  return node;
}

// Lottie wrapper that blends into the screen: no background, dark-mode recolour,
// and a still frame (instead of playing) when "reduce motion" is on.
export default function Animation({ source, size = 160, loop = true, autoPlay = true, still = 0.6, onFinish, style }) {
  const reduce = useReduceMotion();
  const { isDark } = useTheme();
  const src = useMemo(() => (isDark ? recolor(source) : source), [source, isDark]);
  return (
    <LottieView
      source={src}
      style={[{ width: size, height: size }, style]}
      autoPlay={autoPlay && !reduce}
      loop={loop && !reduce}
      progress={reduce ? still : undefined}
      onAnimationFinish={onFinish}
      enableMergePathsAndroidForKitKatAndAbove
      onAnimationFailure={(e) => { if (__DEV__) console.warn('Lottie failed to load', String(e)); }}
    />
  );
}
