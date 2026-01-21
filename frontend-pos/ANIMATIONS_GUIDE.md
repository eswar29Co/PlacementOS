# Page Transitions & Animations Guide

This guide explains the animation system implemented in PlacementOS for smooth page transitions and interactive elements.

## Overview

The application now features:
- **Smooth page transitions** using Framer Motion
- **Staggered animations** for sequential element appearances
- **Hover effects** on interactive elements
- **Custom CSS animations** for various UI components

## Components

### 1. PageTransition Component
Location: `src/components/PageTransition.tsx`

Wraps content to provide smooth transitions when navigating between routes.

**Features:**
- Fade in/out effect
- Vertical slide animation
- Slight scale effect for depth

**Usage:**
```tsx
import { PageTransition } from '@/components/PageTransition';

<PageTransition>
  {children}
</PageTransition>
```

### 2. AnimatedPage Component
Location: `src/components/AnimatedPage.tsx`

Individual page wrapper for content animations.

**Features:**
- Horizontal slide animation
- Fade effect
- Faster transition (0.3s)

**Usage:**
```tsx
import { AnimatedPage } from '@/components/AnimatedPage';

export default function MyPage() {
  return (
    <AnimatedPage>
      <div>Your content here</div>
    </AnimatedPage>
  );
}
```

## CSS Animation Classes

### Available Animations

1. **animate-fade-in** - Simple fade in
2. **animate-slide-up** - Slide up with fade
3. **animate-slide-in-left** - Slide from left
4. **animate-fade-in-up** - Fade in with upward motion
5. **animate-scale-in** - Scale and fade in
6. **animate-pulse-slow** - Slow pulsing effect

### Stagger Delays

Use these classes to create sequential animations:
- `stagger-1` - 0.1s delay
- `stagger-2` - 0.2s delay
- `stagger-3` - 0.3s delay
- `stagger-4` - 0.4s delay
- `stagger-5` - 0.5s delay

**Example:**
```tsx
<div className="animate-fade-in-up stagger-1">First element</div>
<div className="animate-fade-in-up stagger-2">Second element</div>
<div className="animate-fade-in-up stagger-3">Third element</div>
```

## Implementation Examples

### Example 1: Auth Pages
```tsx
import { AnimatedPage } from '@/components/AnimatedPage';

export default function Login() {
  return (
    <AnimatedPage>
      <div className="min-h-screen flex items-center justify-center">
        {/* Your login form */}
      </div>
    </AnimatedPage>
  );
}
```

### Example 2: Staggered Card Grid
```tsx
<div className="grid grid-cols-3 gap-4">
  <Card className="animate-fade-in-up stagger-1">Card 1</Card>
  <Card className="animate-fade-in-up stagger-2">Card 2</Card>
  <Card className="animate-fade-in-up stagger-3">Card 3</Card>
</div>
```

### Example 3: Interactive Button
```tsx
<Button className="hover:scale-105 transition-transform duration-200">
  Click Me
</Button>
```

## Global Transitions

All interactive elements (buttons, links, inputs) have smooth transitions applied globally via CSS:

```css
button, a, input, textarea, select {
  @apply transition-all duration-200 ease-in-out;
}
```

## Best Practices

1. **Don't overuse animations** - Use them purposefully to guide user attention
2. **Keep durations short** - 200-400ms for most interactions
3. **Use stagger sparingly** - Only for lists or grids of 3-5 items
4. **Test performance** - Ensure animations don't cause jank on slower devices
5. **Maintain consistency** - Use the same animation patterns throughout the app

## Protected Routes

The `ProtectedRoute` component automatically wraps all protected content with `PageTransition`, so you don't need to add it manually to student/admin/professional pages.

## Adding Animations to New Pages

### For Public Pages (Login, Signup, etc.)
```tsx
import { AnimatedPage } from '@/components/AnimatedPage';

export default function NewPage() {
  return (
    <AnimatedPage>
      {/* Your content */}
    </AnimatedPage>
  );
}
```

### For Protected Pages
No additional wrapper needed! The `ProtectedRoute` handles it automatically.

### For Individual Elements
```tsx
<div className="animate-fade-in-up">
  <h1>This will fade in and slide up</h1>
</div>
```

## Customizing Animations

To create custom animations, add them to `src/index.css`:

```css
@keyframes myCustomAnimation {
  from { 
    opacity: 0; 
    transform: rotate(0deg); 
  }
  to { 
    opacity: 1; 
    transform: rotate(360deg); 
  }
}

.animate-my-custom {
  animation: myCustomAnimation 0.5s ease-out forwards;
}
```

## Troubleshooting

### Animation not working?
1. Check if Framer Motion is installed: `npm list framer-motion`
2. Ensure the component is properly imported
3. Verify CSS classes are spelled correctly

### Animation too slow/fast?
Adjust the `duration` in the component or CSS:
- Framer Motion: Change `transition.duration`
- CSS: Modify the animation duration value

### Elements jumping?
Ensure parent containers have proper layout (flex/grid) and the animated element doesn't affect layout flow.

## Performance Tips

1. Use `transform` and `opacity` for animations (GPU accelerated)
2. Avoid animating `width`, `height`, or `margin`
3. Use `will-change` sparingly for complex animations
4. Test on mobile devices for smooth 60fps animations
