# Architecture Research

**Domain:** React Native / Expo Habit Tracking App Refactoring
**Researched:** 2026-02-16
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Screen  │  │ Feature │  │ Widget  │  │  Modal  │        │
│  │Component│  │Component│  │Component│  │Component│        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
├───────┴────────────┴────────────┴────────────┴──────────────┤
│                  Presentational Components                   │
│         (UI-only, receive data/callbacks via props)          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │               Context Providers                      │    │
│  │     (Theme, Habits, Identity, Premium)               │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                   Persistence Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │AsyncStore│  │AsyncStore│  │AsyncStore│                   │
│  │ Habits   │  │  Logs    │  │ Identity │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Screen Components | Top-level routing containers, orchestrate feature components, manage screen-level state | Expo Router file-based pages in `app/` |
| Feature Components | Self-contained UI sections (TodayWidget, HabitGridCard), consume context, handle business logic | Extracted to `components/features/` with co-located tests |
| Presentational Components | Pure UI components receiving props (buttons, cards, badges), no context dependencies | Extracted to `components/ui/` with co-located tests |
| Widget Components | Complex stateful UI sections with animations and interactions | Specialized feature components |
| Modal Components | Overlay UI for forms and confirmations | Feature components with modal styling |
| Context Providers | State management and persistence, expose hooks for consumption | Remain in `lib/` directory |

## Recommended Project Structure

### Current Structure
```
app/
├── (tabs)/
│   ├── index.tsx           # 1634 lines - TODAY SCREEN TO REFACTOR
│   ├── dashboard.tsx
│   ├── stats.tsx
│   └── ...
lib/
├── habits-context.tsx      # State management
├── theme-context.tsx
├── identity-context.tsx
└── premium-context.tsx
components/
├── ErrorBoundary.tsx
├── ErrorFallback.tsx
└── KeyboardAwareScrollViewCompat.tsx
```

### Refactored Structure
```
app/
├── (tabs)/
│   ├── index.tsx           # 100-200 lines - orchestration only
│   └── ...
components/
├── features/               # Feature components (business logic + UI)
│   ├── today/
│   │   ├── TodayWidget.tsx
│   │   ├── TodayWidget.test.tsx
│   │   ├── HabitGridCard.tsx
│   │   ├── HabitGridCard.test.tsx
│   │   ├── HabitStackView.tsx
│   │   ├── HabitStackView.test.tsx
│   │   ├── DaySelector.tsx
│   │   ├── DaySelector.test.tsx
│   │   ├── IdentityBadge.tsx
│   │   ├── IdentityBadge.test.tsx
│   │   ├── EvidenceModal.tsx
│   │   ├── EvidenceModal.test.tsx
│   │   ├── RemindersModal.tsx
│   │   ├── RemindersModal.test.tsx
│   │   └── index.ts         # Public exports
│   ├── habits/
│   │   ├── AddHabitChoiceModal.tsx
│   │   └── AddHabitChoiceModal.test.tsx
│   └── shared/
│       ├── ConfirmationModal.tsx
│       └── ConfirmationModal.test.tsx
├── ui/                     # Presentational components (pure UI)
│   ├── Button.tsx
│   ├── Button.test.tsx
│   ├── Card.tsx
│   ├── Card.test.tsx
│   ├── ProgressRing.tsx
│   └── ProgressRing.test.tsx
├── ErrorBoundary.tsx
├── ErrorFallback.tsx
└── KeyboardAwareScrollViewCompat.tsx
lib/
├── habits-context.tsx
├── habits-context.test.tsx
├── theme-context.tsx
├── identity-context.tsx
└── premium-context.tsx
```

### Structure Rationale

- **components/features/today/:** Co-locates all components specific to the Today screen, making dependencies clear and enabling easier testing
- **components/features/shared/:** Reusable feature components used across multiple screens
- **components/ui/:** Pure presentational components with no context dependencies, highly reusable
- **Co-located tests:** Test files live next to implementation files (`.test.tsx` convention) for shorter imports and easier maintenance
- **index.ts exports:** Each feature folder exports its public API, preventing direct imports of internal components
- **lib/ directory:** Context providers remain here as they're foundational state management, not UI components

## Architectural Patterns

### Pattern 1: Presentational vs. Container Components

**What:** Separate business logic from UI rendering by creating container components that manage state and pass data to presentational components.

**When to use:** When extracting large screen components. The screen file becomes the container, feature components are hybrid (some logic), UI components are pure presentational.

**Trade-offs:**
- Pros: Testability improves dramatically, components become reusable, clear separation of concerns
- Cons: More files to manage, requires discipline to maintain boundaries

**Example:**
```typescript
// Screen container (app/(tabs)/index.tsx)
export default function TodayScreen() {
  const { colors } = useTheme();
  const { habits, logs, completeHabit, uncompleteHabit } = useHabits();
  const [view, setView] = useState<"grid" | "stack">("grid");

  // Orchestration logic here
  const today = getTodayStr();
  const todayLogs = logs.filter((l) => l.date === today);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TodayWidget
        habits={habits}
        logs={todayLogs}
      />
      {view === "grid" ? (
        <HabitGridView habits={habits} logs={todayLogs} onComplete={completeHabit} />
      ) : (
        <HabitStackView habits={habits} logs={todayLogs} onComplete={completeHabit} />
      )}
    </View>
  );
}

// Feature component (components/features/today/TodayWidget.tsx)
interface TodayWidgetProps {
  habits: Habit[];
  logs: HabitLog[];
}

export function TodayWidget({ habits, logs }: TodayWidgetProps) {
  // Widget-specific presentation logic
  const completedIds = new Set(logs.filter(l => l.status === "done").map(l => l.habitId));
  const progress = habits.length > 0 ? completedIds.size / habits.length : 0;

  return (
    <View style={styles.container}>
      <ProgressRing progress={progress} />
      {/* Widget UI */}
    </View>
  );
}

// Presentational component (components/ui/ProgressRing.tsx)
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ progress, size = 80, strokeWidth = 6 }: ProgressRingProps) {
  // Pure UI rendering, no business logic
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 800 });
  }, [progress]);

  return (
    <View style={{ width: size, height: size }}>
      {/* Ring rendering */}
    </View>
  );
}
```

### Pattern 2: Context Consumption via Props

**What:** Feature components consume context internally but expose props-based interfaces for testing and reusability.

**When to use:** When extracting components that need access to global state but should remain testable.

**Trade-offs:**
- Pros: Components testable without complex context mocking, clear data dependencies, can switch between context and props
- Cons: Slight duplication when component uses context internally but also accepts props

**Example:**
```typescript
// Option A: Context-dependent (harder to test)
export function HabitGridCard({ habitId }: { habitId: string }) {
  const { habits, completeHabit } = useHabits();
  const habit = habits.find(h => h.id === habitId)!;

  return <Card habit={habit} onComplete={() => completeHabit(habitId)} />;
}

// Option B: Hybrid approach (recommended)
interface HabitGridCardProps {
  habit: Habit;
  isCompleted: boolean;
  onComplete: (habitId: string) => void;
  onUncomplete?: (habitId: string) => void;
}

export function HabitGridCard({
  habit,
  isCompleted,
  onComplete,
  onUncomplete
}: HabitGridCardProps) {
  // No context dependencies - pure props-based
  // Easy to test, easy to use in Storybook

  const handlePress = () => {
    if (isCompleted && onUncomplete) {
      onUncomplete(habit.id);
    } else {
      onComplete(habit.id);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      {/* Card UI */}
    </Pressable>
  );
}
```

### Pattern 3: Co-located Test Files

**What:** Place test files next to their implementation using `.test.tsx` extension rather than in separate `__tests__/` directories.

**When to use:** For all new component extractions in the refactoring. This is the recommended 2026 best practice.

**Trade-offs:**
- Pros: Shorter relative imports, tests are easy to find, moving components also moves tests, IDE navigation is simpler
- Cons: More files in each directory, requires Jest configuration to find tests

**Example:**
```typescript
// components/features/today/TodayWidget.tsx
export function TodayWidget({ habits, logs }: TodayWidgetProps) {
  // Implementation
}

// components/features/today/TodayWidget.test.tsx
import { render, screen } from '@testing-library/react-native';
import { TodayWidget } from './TodayWidget';

describe('TodayWidget', () => {
  it('displays greeting and progress', () => {
    const habits = [mockHabit1, mockHabit2];
    const logs = [mockLog1];

    render(<TodayWidget habits={habits} logs={logs} />);

    expect(screen.getByText(/good/i)).toBeTruthy();
    expect(screen.getByText(/1 of 2 done/i)).toBeTruthy();
  });
});
```

### Pattern 4: Compound Components for Complex UI

**What:** When a component has multiple sub-components that share state, use the compound component pattern with context.

**When to use:** For components like modals with header/body/footer, or cards with multiple variants.

**Trade-offs:**
- Pros: Flexible API, clear component structure, shared state without prop drilling
- Cons: More complex implementation, requires understanding of context API

**Example:**
```typescript
// Not needed for initial refactoring, but useful for future optimization
const ModalContext = createContext<ModalContextValue | null>(null);

export function Modal({ children, visible, onClose }: ModalProps) {
  const value = useMemo(() => ({ visible, onClose }), [visible, onClose]);

  return (
    <ModalContext.Provider value={value}>
      <RNModal visible={visible} onRequestClose={onClose}>
        {children}
      </RNModal>
    </ModalContext.Provider>
  );
}

Modal.Header = function ModalHeader({ children }: { children: ReactNode }) {
  const { onClose } = useContext(ModalContext)!;
  return (
    <View style={styles.header}>
      {children}
      <Pressable onPress={onClose}>
        <Ionicons name="close" size={24} />
      </Pressable>
    </View>
  );
};

// Usage
<Modal visible={visible} onClose={handleClose}>
  <Modal.Header>
    <Text>Evidence</Text>
  </Modal.Header>
  <Modal.Body>
    {/* Content */}
  </Modal.Body>
</Modal>
```

## Data Flow

### Request Flow

```
[User Tap/Input]
    ↓
[Screen Component] → [handleComplete()] → [useHabits.completeHabit()] → [Context State Update]
    ↓                                                                            ↓
[Re-render triggered] ← [Context consumers notified] ← [AsyncStorage.setItem()]
    ↓
[Feature Components receive new props]
    ↓
[UI updates with animations]
```

### State Management Flow

```
[AsyncStorage]
    ↓ (on mount)
[Context Provider useState/useEffect] ← [Persistence helpers (persistHabits)]
    ↓ (via useContext hooks)                      ↑
[Screen Components]                                │
    ↓ (via props)                                  │
[Feature Components]                               │
    ↓ (callbacks)                                  │
[User interactions] → [Event handlers] ────────────┘
```

### Key Data Flows

1. **Initial Load Flow:** AsyncStorage → Context Provider → Screen Component → Feature Components
2. **Habit Completion Flow:** User tap → Screen handler → Context mutation → AsyncStorage persistence → Re-render cascade
3. **Modal Flow:** User tap → Screen state update → Modal visibility prop → Modal component rendering
4. **Animation Flow:** State change → Feature component useEffect → useSharedValue update → useAnimatedStyle → Reanimated rendering

## Component Decomposition Strategy

### Today Screen Extraction Order

**Phase 1: Identify Component Boundaries (No Code Changes)**
1. Read through `app/(tabs)/index.tsx` and map all inline components
2. Document dependencies between components (which components use data from others)
3. Identify shared utilities (getTodayStr, formatTime) that should move to `lib/utils.ts`

**Phase 2: Extract Pure Presentational Components (Low Risk)**
Extract components with NO context dependencies first:
1. **DaySelector** (line ~249) → `components/ui/DaySelector.tsx`
   - Props: selected days, colors, onDayPress callback
   - No context dependencies
   - Test: render with different selected days, verify callback

2. **ProgressRing** (extract from TodayWidget) → `components/ui/ProgressRing.tsx`
   - Props: progress value, size, colors
   - Reusable across app
   - Test: verify animation, different progress values

**Phase 3: Extract Feature Components with Context (Medium Risk)**
Extract components that consume context but can be made testable via props:

3. **TodayWidget** (line 57-178) → `components/features/today/TodayWidget.tsx`
   - Props: habits, logs (derived from context in screen)
   - Internal: greeting logic, progress calculation, ring rendering
   - Test: mock habits/logs data, verify progress calculation
   - Dependencies: Extract ProgressRing first

4. **IdentityBadge** (line 181-247) → `components/features/today/IdentityBadge.tsx`
   - Props: identityStatement, selectedAreas, habits
   - Internal: area filtering, custom identity logic
   - Test: mock identity data, verify rendering
   - Dependencies: None

5. **HabitGridCard** (line 296-422) → `components/features/today/HabitGridCard.tsx`
   - Props: habit, isCompleted, onComplete, onUncomplete
   - Internal: gradient rendering, progress bar, streak display
   - Test: mock habit data, verify completion toggle
   - Dependencies: None

6. **HabitStackView** (line 423-661) → `components/features/today/HabitStackView.tsx`
   - Props: habits, logs, onComplete, onUncomplete
   - Internal: habit grouping by cue type, chain rendering
   - Test: mock various cue types, verify grouping logic
   - Dependencies: None

**Phase 4: Extract Modal Components (Medium Risk)**

7. **EvidenceModal** (line 663-797) → `components/features/today/EvidenceModal.tsx`
   - Props: visible, habitTitle, onSubmit, onSkip, onClose
   - Internal: image picker, form state
   - Test: mock image picker, verify form submission
   - Dependencies: None (mostly self-contained)

8. **RemindersModal** (line 864-993) → `components/features/today/RemindersModal.tsx`
   - Props: visible, onClose
   - Consumes: useHabits context internally (for now)
   - Test: mock habits context, verify reminder CRUD
   - Dependencies: ReminderHabitRow (extract as sub-component)

9. **AddHabitChoiceModal** (line 799-862) → `components/features/habits/AddHabitChoiceModal.tsx`
   - Props: visible, onClose
   - Internal: navigation to different flows
   - Test: mock router, verify navigation
   - Dependencies: None

10. **ConfirmationModal** (inline at line 1223-1248) → `components/features/shared/ConfirmationModal.tsx`
    - Props: visible, title, message, onConfirm, onCancel, icon, color
    - Generic reusable modal
    - Test: verify all props render correctly
    - Dependencies: None

**Phase 5: Refactor Screen Component (Low Risk After Extractions)**

11. **Refactor `app/(tabs)/index.tsx`**
    - Remove all extracted component definitions
    - Import from `components/features/today/`
    - Keep only: state management, context consumption, orchestration logic
    - Extract styles to separate file or co-locate with components
    - Target: 100-200 lines total

### Refactoring Order Rationale

1. **Bottom-up approach:** Extract leaf components (no dependencies) before parent components
2. **Risk mitigation:** Presentational components are safest to extract (pure functions), modals are riskier (side effects)
3. **Testing feedback loop:** Each extraction gets tests, building confidence before moving to complex components
4. **Incremental value:** Each extraction immediately improves code organization and testability

### Component Size Guidelines

- **Screen components:** 100-300 lines (orchestration only)
- **Feature components:** 50-200 lines (one clear responsibility)
- **Presentational components:** 20-100 lines (pure UI)
- **If component exceeds guideline:** Look for opportunities to extract sub-components

### Naming Conventions

- **Screen components:** `TodayScreen`, `DashboardScreen` (matches route)
- **Feature components:** `TodayWidget`, `HabitGridCard` (noun phrases, domain-specific)
- **Presentational components:** `Button`, `Card`, `ProgressRing` (generic nouns)
- **Test files:** `ComponentName.test.tsx` (same name as component)
- **Style exports:** Co-locate with component or use `styles` variable

## Test File Integration

### Test File Organization

**Recommended approach:** Co-located test files with `.test.tsx` extension

```
components/
├── features/
│   ├── today/
│   │   ├── TodayWidget.tsx
│   │   ├── TodayWidget.test.tsx      # Co-located
│   │   ├── HabitGridCard.tsx
│   │   └── HabitGridCard.test.tsx    # Co-located
```

**Alternative approach:** `__tests__` directories (legacy, not recommended for new code)

```
components/
├── features/
│   ├── today/
│   │   ├── __tests__/
│   │   │   ├── TodayWidget.test.tsx
│   │   │   └── HabitGridCard.test.tsx
│   │   ├── TodayWidget.tsx
│   │   └── HabitGridCard.tsx
```

### Jest Configuration for Co-located Tests

Add to `package.json`:

```json
{
  "jest": {
    "preset": "jest-expo",
    "testMatch": [
      "**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)",
      "**/*.(test|spec).(ts|tsx|js|jsx)"
    ],
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
    ],
    "collectCoverageFrom": [
      "**/*.{ts,tsx}",
      "!**/*.d.ts",
      "!**/node_modules/**",
      "!**/__tests__/**"
    ]
  }
}
```

### Testing Library Setup

Install dependencies:

```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest-expo
```

### Test Utilities for Context Providers

Create `lib/test-utils.tsx`:

```typescript
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from './theme-context';
import { HabitsProvider } from './habits-context';
import { IdentityProvider } from './identity-context';
import { PremiumProvider } from './premium-context';

// Wrapper with all providers
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PremiumProvider>
        <IdentityProvider>
          <HabitsProvider>
            {children}
          </HabitsProvider>
        </IdentityProvider>
      </PremiumProvider>
    </ThemeProvider>
  );
}

// Custom render that includes providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything
export * from '@testing-library/react-native';
export { customRender as render };
```

Usage in tests:

```typescript
import { render, screen } from '@/lib/test-utils'; // Custom render with providers
import { TodayWidget } from './TodayWidget';

describe('TodayWidget', () => {
  it('displays progress correctly', () => {
    render(<TodayWidget habits={mockHabits} logs={mockLogs} />);
    expect(screen.getByText(/50%/)).toBeTruthy();
  });
});
```

### Test Structure Pattern

```typescript
// TodayWidget.test.tsx
import { render, screen, fireEvent } from '@/lib/test-utils';
import { TodayWidget } from './TodayWidget';

// Mock data builders
const mockHabit = (overrides = {}): Habit => ({
  id: '1',
  title: 'Test Habit',
  icon: 'water',
  iconColor: '#4A90E2',
  gradientColors: ['#4A90E2', '#357ABD'],
  goal: 1,
  unit: 'times',
  frequency: 'daily',
  current: 0,
  streak: 0,
  bestStreak: 0,
  weekData: [0, 0, 0, 0, 0, 0, 0],
  createdAt: Date.now(),
  ...overrides,
});

const mockLog = (overrides = {}): HabitLog => ({
  id: '1',
  habitId: '1',
  date: '2026-02-16',
  status: 'done',
  timestamp: Date.now(),
  ...overrides,
});

describe('TodayWidget', () => {
  it('shows greeting based on time of day', () => {
    const habits = [mockHabit()];
    const logs: HabitLog[] = [];

    render(<TodayWidget habits={habits} logs={logs} />);

    // Should show one of the greetings
    const greetingRegex = /good (morning|afternoon|evening)/i;
    expect(screen.getByText(greetingRegex)).toBeTruthy();
  });

  it('calculates progress correctly', () => {
    const habits = [
      mockHabit({ id: '1' }),
      mockHabit({ id: '2' }),
    ];
    const logs = [
      mockLog({ habitId: '1', status: 'done' }),
    ];

    render(<TodayWidget habits={habits} logs={logs} />);

    expect(screen.getByText('1 of 2 done')).toBeTruthy();
    expect(screen.getByText('50%')).toBeTruthy();
  });

  it('shows completion state when all habits done', () => {
    const habits = [mockHabit({ id: '1' })];
    const logs = [mockLog({ habitId: '1', status: 'done' })];

    render(<TodayWidget habits={habits} logs={logs} />);

    expect(screen.getByText(/all habits done/i)).toBeTruthy();
  });

  it('displays best streak stat', () => {
    const habits = [
      mockHabit({ streak: 5 }),
      mockHabit({ streak: 10 }),
    ];

    render(<TodayWidget habits={habits} logs={[]} />);

    expect(screen.getByText('10')).toBeTruthy(); // Best streak
  });
});
```

### Testing Components with Context

For components that must use context internally:

```typescript
// HabitGridCard.test.tsx
import { render, screen, fireEvent } from '@/lib/test-utils';
import { HabitGridCard } from './HabitGridCard';

describe('HabitGridCard', () => {
  const mockHabit = mockHabit();

  it('calls onComplete when tapped', () => {
    const onComplete = jest.fn();

    render(
      <HabitGridCard
        habit={mockHabit}
        isCompleted={false}
        onComplete={onComplete}
      />
    );

    const checkButton = screen.getByRole('button');
    fireEvent.press(checkButton);

    expect(onComplete).toHaveBeenCalledWith(mockHabit.id);
  });

  it('shows completion state', () => {
    render(
      <HabitGridCard
        habit={mockHabit}
        isCompleted={true}
        onComplete={jest.fn()}
      />
    );

    // Verify checkmark is visible
    expect(screen.getByTestId('check-icon')).toBeTruthy();
  });
});
```

### Snapshot Testing (Use Sparingly)

Snapshot tests are useful for detecting unintended UI changes but brittle for frequently changing components:

```typescript
it('matches snapshot', () => {
  const { toJSON } = render(
    <TodayWidget habits={mockHabits} logs={mockLogs} />
  );
  expect(toJSON()).toMatchSnapshot();
});
```

**Recommendation:** Use snapshot tests only for stable presentational components, not for components with animations or frequent changes.

## Context Provider Testing

### Testing Context Providers

```typescript
// lib/habits-context.test.tsx
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { HabitsProvider, useHabits } from './habits-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('HabitsProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('loads habits from AsyncStorage on mount', async () => {
    const storedHabits = JSON.stringify([mockHabit()]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(storedHabits);

    const { result } = renderHook(() => useHabits(), {
      wrapper: HabitsProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    expect(result.current.habits).toHaveLength(1);
  });

  it('adds a new habit', async () => {
    const { result } = renderHook(() => useHabits(), {
      wrapper: HabitsProvider,
    });

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => {
      result.current.addHabit({
        title: 'New Habit',
        icon: 'water',
        iconColor: '#4A90E2',
        // ... other required fields
      });
    });

    expect(result.current.habits).toHaveLength(1);
    expect(result.current.habits[0].title).toBe('New Habit');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'tinywins_habits',
      expect.any(String)
    );
  });

  it('completes a habit and creates log entry', async () => {
    const habit = mockHabit();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([habit])
    );

    const { result } = renderHook(() => useHabits(), {
      wrapper: HabitsProvider,
    });

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => {
      result.current.completeHabit(habit.id, 'Evidence note');
    });

    expect(result.current.logs).toHaveLength(1);
    expect(result.current.logs[0].status).toBe('done');
    expect(result.current.logs[0].evidenceNote).toBe('Evidence note');
  });
});
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-10 habits | Current monolithic screen is acceptable, no refactoring needed |
| 10-50 habits | **CURRENT STATE** - Refactor to extracted components essential for maintainability and testing |
| 50+ habits | Consider virtualized lists (FlashList), memoization for expensive calculations, optimize re-renders |
| 100+ habits | Add pagination/filtering, consider moving habit processing to background thread, optimize AsyncStorage reads |

### Performance Optimization Strategies

1. **Memoization:** Use `React.memo()` for feature components to prevent unnecessary re-renders
2. **Callback Stability:** Wrap context callbacks in `useCallback` to prevent child re-renders
3. **Selective Context:** Split large contexts into smaller ones (habits, logs, reviews separate)
4. **Virtual Lists:** Use `FlashList` instead of `FlatList` for large habit lists
5. **Lazy Loading:** Defer loading of modals and complex components until needed

### Current Performance Concerns

- **1634-line file:** Difficult to optimize, all logic re-executes on every render
- **Multiple StyleSheet.create() calls:** Should be extracted to reduce bundle size
- **Inline anonymous functions:** Many callback definitions cause child re-renders
- **No memoization:** TodayWidget, HabitGridCard re-render on every parent update

### Post-Refactoring Optimizations

After component extraction:
1. Wrap feature components in `React.memo()`
2. Use `useMemo` for expensive calculations (habit grouping, progress)
3. Use `useCallback` for event handlers passed as props
4. Profile with React DevTools to identify remaining bottlenecks

## Anti-Patterns

### Anti-Pattern 1: Prop Drilling Through Many Levels

**What people do:** Pass habits, logs, and callbacks through 3-4 component levels

**Why it's wrong:** Makes components tightly coupled, hard to refactor, verbose prop interfaces

**Do this instead:**
- Option A: Use context in deeply nested components that need it
- Option B: Create specialized container components at each level that consume context and pass simplified props
- Option C: Combine related props into single objects (`habitData` instead of `habit`, `log`, `isCompleted`)

### Anti-Pattern 2: Testing Implementation Details

**What people do:** Test internal state, mock every function, test private methods

**Why it's wrong:** Tests become brittle, break on refactoring, don't catch real bugs

**Do this instead:**
- Test public API (props in, rendered output and callbacks out)
- Test user interactions (press, type, scroll)
- Test integration with context (via custom render helper)
- Avoid testing internal state or mocking internal functions

**Example:**
```typescript
// BAD: Testing implementation
it('updates internal selectedDay state', () => {
  const component = render(<DaySelector />);
  const instance = component.getInstance();
  instance.handleDayPress(1);
  expect(instance.state.selectedDay).toBe(1);
});

// GOOD: Testing behavior
it('calls onDayPress when day is tapped', () => {
  const onDayPress = jest.fn();
  render(<DaySelector selectedDays={[1]} onDayPress={onDayPress} />);

  fireEvent.press(screen.getByText('M'));
  expect(onDayPress).toHaveBeenCalledWith(1);
});
```

### Anti-Pattern 3: Monolithic Component Files

**What people do:** Keep all components in one file "for convenience"

**Why it's wrong:** Hard to test, hard to reuse, merge conflicts, difficult to navigate

**Do this instead:**
- Extract components to separate files when they exceed 150 lines
- Extract when component has clear independent responsibility
- Extract when component is used in multiple places
- Use barrel exports (`index.ts`) to maintain clean import statements

### Anti-Pattern 4: Context Over-consumption

**What people do:** Every component uses `useHabits()` and `useTheme()` directly

**Why it's wrong:** Components become untestable without complex context mocking, hard to reuse

**Do this instead:**
- Screen components consume context and pass data as props
- Feature components accept props but MAY consume context for convenience
- Presentational components NEVER consume context
- Document which components are context-aware vs context-free

### Anti-Pattern 5: Style Duplication

**What people do:** Define similar styles multiple times across components

**Why it's wrong:** Inconsistent styling, large bundle size, hard to maintain design system

**Do this instead:**
- Create shared style constants in `constants/styles.ts`
- Use theme context for colors, spacing, typography
- Create presentational components for common patterns (buttons, cards)
- Extract common style objects to be reused

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| AsyncStorage | Context providers wrap AsyncStorage calls | Mock in tests with `@react-native-async-storage/async-storage/jest/async-storage-mock` |
| Expo Router | Import `router` from `expo-router` for navigation | Mock in tests with `jest.mock('expo-router')` |
| Expo Image Picker | Direct import in modal components | Mock in tests with `jest.mock('expo-image-picker')` |
| React Native Reanimated | Animations in feature components | Use `jest-expo` preset for proper mocking |
| Expo Haptics | Feedback on interactions | Mock with `jest.mock('expo-haptics')` |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Screen ↔ Features | Props (data + callbacks) | Screen consumes context, passes derived data to features |
| Features ↔ UI | Props (pure data) | Feature components prepare data, UI components render |
| Features ↔ Context | `useContext` hooks | Direct consumption acceptable for features, avoid in UI components |
| Modals ↔ Screen | Visibility state + callbacks | Screen manages modal state, modals are controlled components |

## Build Order Implications

### Dependencies Between Extractions

**Critical path:**
1. Set up test infrastructure (install dependencies, create test-utils)
2. Extract utility functions first (getTodayStr, formatTime → `lib/utils.ts`)
3. Extract presentational components (no dependencies on features)
4. Extract feature components (depend on presentational components)
5. Refactor screen to use extracted components
6. Add tests for each component after extraction

**Parallel work opportunities:**
- DaySelector and ProgressRing can be extracted in parallel (no dependencies)
- TodayWidget and IdentityBadge can be extracted in parallel
- All modals can be extracted in parallel after their shared components are extracted

**Incremental testing strategy:**
1. Extract component → immediately add basic test
2. Verify screen still works with extraction
3. Add comprehensive tests
4. Move to next component
5. Don't wait until all components are extracted to start testing

### Suggested Phase Timeline

- **Phase 1 (Investigation):** 1-2 hours - Map components and dependencies
- **Phase 2 (Setup):** 1 hour - Install test dependencies, create test-utils
- **Phase 3 (Presentational):** 2-3 hours - Extract 2 UI components + tests
- **Phase 4 (Features):** 4-6 hours - Extract 6 feature components + tests
- **Phase 5 (Modals):** 3-4 hours - Extract 4 modal components + tests
- **Phase 6 (Refactor Screen):** 1-2 hours - Clean up screen file
- **Phase 7 (Comprehensive Tests):** 2-3 hours - Add missing test cases

**Total estimate:** 14-21 hours for complete refactoring with full test coverage

### Git Commit Strategy

Commit after each component extraction:
```
git commit -m "Extract TodayWidget component with tests

- Move TodayWidget to components/features/today/
- Add TodayWidget.test.tsx with basic coverage
- Update index.tsx to import from new location
- No functionality changes"
```

This allows easy rollback if an extraction causes issues.

## Sources

- [25 React Native Best Practices for High Performance Apps 2026](https://www.esparkinfo.com/blog/react-native-best-practices)
- [React project structure for scale: decomposition, layers and hierarchy](https://www.developerway.com/posts/react-project-structure)
- [React components composition: how to get it right](https://www.developerway.com/posts/components-composition-how-to-get-it-right)
- [How to Structure Large-Scale React Native Applications for Maintainability](https://oneuptime.com/blog/post/2026-01-15-structure-react-native-applications/view)
- [Unit testing with Jest - Expo Documentation](https://docs.expo.dev/develop/unit-testing/)
- [How to Unit Test React Native Components with Jest](https://oneuptime.com/blog/post/2026-01-15-react-native-jest-testing/view)
- [Mocking Context with React Testing Library](https://polvara.me/posts/mocking-context-with-react-testing-library/)
- [Best Practices for Unit Testing in React and Folder Structure](https://medium.com/@umerfarooq.dev/best-practices-for-unit-testing-in-react-and-folder-structure-5ca769256546)
- [Running Tests | Create React App](https://create-react-app.dev/docs/running-tests/)
- [What are the best practices for using React Native Context API?](https://reintech.io/blog/best-practices-for-using-react-native-context-api)

---
*Architecture research for: Tiny Wins habit tracking app refactoring*
*Researched: 2026-02-16*
