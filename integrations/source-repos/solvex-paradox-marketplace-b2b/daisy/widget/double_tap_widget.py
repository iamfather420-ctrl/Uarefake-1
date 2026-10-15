# ==============================================================================
# DAISY — Distributed Autonomous Software Intelligence Yield Engine
# MODULE: Double-Tap Text Harvester Widget
# PURPOSE: Gesture capture → text tether → DAISY Bubble ingestion
# AUTHOR: SolveX / TJ Ites Jr.
# GENESIS: 2025-12-25 | AGATE CORE INTEGRATION BUILD
# ==============================================================================

from kivy.app import App
from kivy.uix.floatlayout import FloatLayout
from kivy.uix.label import Label
from kivy.uix.widget import Widget
from kivy.uix.popup import Popup
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.scrollview import ScrollView
from kivy.graphics import Color, RoundedRectangle, Line
from kivy.clock import Clock
from kivy.core.window import Window
from kivy.utils import get_color_from_hex
from kivy.animation import Animation
import time
import json
import hashlib
import threading
from collections import defaultdict

# ==============================================================================
# SECTION 1 — TEXT FRAGMENT (atomic unit pulled from screen)
# ==============================================================================

class TextFragment:
    """
    A single piece of text tethered from a screen via double-tap.
    Each fragment becomes a raw input node in the DAISY compilation graph.
    """
    def __init__(self, text: str, source_screen: str, position: tuple):
        self.id = hashlib.sha256(
            f"{text}{source_screen}{time.time()}".encode()
        ).hexdigest()[:16]
        self.text = text.strip()
        self.source_screen = source_screen
        self.position = position          # (x, y) on screen where tap occurred
        self.timestamp = time.time()
        self.bubble_id = None             # Set when assigned to a DAISY Bubble

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "text": self.text,
            "source_screen": self.source_screen,
            "position": list(self.position),
            "timestamp": self.timestamp,
            "bubble_id": self.bubble_id,
        }

    def __repr__(self):
        return f"<TextFragment id={self.id} src={self.source_screen} text={self.text[:40]!r}>"


# ==============================================================================
# SECTION 2 — TETHER OVERLAY
# Visual indicator that snaps onto tapped text to confirm capture
# ==============================================================================

class TetherOverlay(Widget):
    """
    Animated gold tether ring that appears at the double-tap point,
    confirms text capture, then flies into the DAISY bubble collector.
    """
    def __init__(self, pos, text_preview, on_complete=None, **kwargs):
        super().__init__(**kwargs)
        self.size = (200, 60)
        self.pos = (pos[0] - 100, pos[1] - 30)
        self.on_complete = on_complete
        self._draw(text_preview)
        self._animate()

    def _draw(self, text_preview):
        with self.canvas:
            Color(*get_color_from_hex("#d4af37"), 0.9)
            self.ring = RoundedRectangle(
                pos=self.pos, size=self.size, radius=[12]
            )
            Color(0, 0, 0, 0.85)
            RoundedRectangle(
                pos=(self.pos[0]+2, self.pos[1]+2),
                size=(self.size[0]-4, self.size[1]-4),
                radius=[10]
            )
        self.label = Label(
            text=f'⬡  "{text_preview[:28]}..."' if len(text_preview) > 28 else f'⬡  "{text_preview}"',
            font_size="11sp",
            color=get_color_from_hex("#d4af37"),
            pos=self.pos,
            size=self.size,
        )
        self.add_widget(self.label)

    def _animate(self):
        # Pulse gold → fly to collector corner → disappear
        anim = (
            Animation(opacity=1, duration=0.15) +
            Animation(opacity=0.7, duration=0.3) +
            Animation(
                x=Window.width - 80,
                y=Window.height - 80,
                opacity=0,
                duration=0.45
            )
        )
        anim.bind(on_complete=self._cleanup)
        anim.start(self)

    def _cleanup(self, *args):
        if self.parent:
            self.parent.remove_widget(self)
        if self.on_complete:
            self.on_complete()


# ==============================================================================
# SECTION 3 — DOUBLE TAP DETECTOR
# Intercepts touch events across the entire screen surface
# ==============================================================================

class DoubleTapDetector(Widget):
    """
    Transparent overlay that sits on top of every screen.
    Detects double-taps anywhere and extracts the nearest text.
    """
    TAP_THRESHOLD = 0.35   # Max seconds between taps to count as double
    TAP_RADIUS    = 60     # Max pixel distance between two taps

    def __init__(self, text_registry, on_capture, **kwargs):
        super().__init__(**kwargs)
        self.size  = Window.size
        self.pos   = (0, 0)
        self.size_hint = (None, None)
        self.text_registry = text_registry   # {(x,y): "text"} map of visible text
        self.on_capture = on_capture
        self._last_tap = None                # (x, y, timestamp)

    def on_touch_down(self, touch):
        now = time.time()
        tx, ty = touch.x, touch.y

        if self._last_tap:
            lx, ly, lt = self._last_tap
            dt = now - lt
            dist = ((tx - lx)**2 + (ty - ly)**2) ** 0.5

            if dt < self.TAP_THRESHOLD and dist < self.TAP_RADIUS:
                # DOUBLE TAP CONFIRMED
                self._last_tap = None
                self._handle_double_tap(tx, ty)
                return True

        self._last_tap = (tx, ty, now)
        # Reset if no second tap comes in time
        Clock.schedule_once(lambda dt: self._reset_tap(), self.TAP_THRESHOLD + 0.05)
        return False

    def _reset_tap(self):
        self._last_tap = None

    def _handle_double_tap(self, x, y):
        """Find the nearest registered text to the tap point and tether it."""
        nearest_text = self._find_nearest_text(x, y)
        if nearest_text:
            self.on_capture(nearest_text, (x, y))

    def _find_nearest_text(self, x, y) -> str:
        """
        Scan the text registry for the closest text node to the tap point.
        In production this hooks into the accessibility tree / AT-SPI / AXUIElement.
        """
        if not self.text_registry:
            return None
        best = None
        best_dist = float("inf")
        for (tx, ty), text in self.text_registry.items():
            dist = ((x - tx)**2 + (y - ty)**2) ** 0.5
            if dist < best_dist:
                best_dist = dist
                best = text
        return best if best_dist < 150 else None  # 150px tether radius


# ==============================================================================
# SECTION 4 — DAISY BUBBLE COLLECTOR (UI)
# The corner widget that accumulates tethered fragments
# ==============================================================================

class BubbleCollector(Widget):
    """
    Floating collector orb in the top-right corner.
    Shows fragment count. Tap to open the compilation panel.
    """
    def __init__(self, on_open_panel, **kwargs):
        super().__init__(**kwargs)
        self.size = (64, 64)
        self.pos = (Window.width - 80, Window.height - 80)
        self.fragment_count = 0
        self.on_open_panel = on_open_panel
        self._draw()

    def _draw(self):
        self.canvas.clear()
        with self.canvas:
            # Outer gold ring
            Color(*get_color_from_hex("#d4af37"), 0.9)
            RoundedRectangle(pos=self.pos, size=self.size, radius=[32])
            # Inner dark fill
            Color(0.05, 0.05, 0.05, 0.95)
            RoundedRectangle(
                pos=(self.pos[0]+3, self.pos[1]+3),
                size=(self.size[0]-6, self.size[1]-6),
                radius=[29]
            )
        if hasattr(self, "_label"):
            self.remove_widget(self._label)
        self._label = Label(
            text=f"[b]{self.fragment_count}[/b]\n[size=9]DAISY[/size]",
            markup=True,
            font_size="14sp",
            color=get_color_from_hex("#d4af37"),
            pos=self.pos,
            size=self.size,
            halign="center",
            valign="middle",
        )
        self.add_widget(self._label)

    def increment(self):
        self.fragment_count += 1
        self._draw()
        # Pulse animation
        anim = Animation(opacity=0.5, duration=0.1) + Animation(opacity=1.0, duration=0.1)
        anim.start(self)

    def on_touch_down(self, touch):
        if self.collide_point(*touch.pos):
            self.on_open_panel()
            return True
        return False
