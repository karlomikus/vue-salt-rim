<template>
<div style="color: var(--clr-gray-700); padding: 20px;">
  <svg class="cocktail-loader" viewBox="0 0 24 24" aria-label="Loading">
    <g class="cocktail-glass">
      <path class="glass-outline" d="M12 14 L20 5 H4 L12 14 V20 M8 20 H16" />
      <path class="garnish" d="M14 9 L19 3" />
    </g>
  </svg>
</div>
</template>
<style scoped>
.cocktail-loader {
  width: 36px;
  height: 36px;
  display: inline-block;
  overflow: visible;
}

.cocktail-glass {
  transform-origin: 12px 14px;
  animation: shake-loop 2s ease-in-out infinite;
}

.glass-outline {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  /* Total path length is ~58px */
  stroke-dasharray: 58;
  stroke-dashoffset: 58;
  animation: draw-loop 2s ease-in-out infinite;
}

.garnish {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-dasharray: 10;
  stroke-dashoffset: 10;
  animation: draw-garnish 2s ease-in-out infinite;
}

/* 1. Draw: Right Cone -> Rim -> Left Cone -> Stem -> Base */
@keyframes draw-loop {
  0% {
    stroke-dashoffset: 58;
    opacity: 1;
  }
  45%, 85% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
  98%, 100% {
    stroke-dashoffset: 0;
    opacity: 0;
  }
}

/* 2. Draw garnish pick right after glass finishes */
@keyframes draw-garnish {
  0%, 35% {
    stroke-dashoffset: 10;
    opacity: 0;
  }
  36% {
    opacity: 1;
  }
  55%, 85% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
  98%, 100% {
    stroke-dashoffset: 0;
    opacity: 0;
  }
}

/* 3. Shake once the drawing completes */
@keyframes shake-loop {
  0%, 55% {
    transform: rotate(0deg);
  }
  62% {
    transform: rotate(-14deg);
  }
  69% {
    transform: rotate(12deg);
  }
  76% {
    transform: rotate(-8deg);
  }
  83% {
    transform: rotate(5deg);
  }
  90%, 100% {
    transform: rotate(0deg);
  }
}
</style>
