# ==============================================================================
# CLAIM OF INTELLECTUAL PROPERTY & ORIGINAL PROVENANCE
# AUTHOR / TRUSTEE: TODD JEFFREY ITES JR. (TJ)
# PROJECT ANCHOR: SOLVEX DECENTRALIZED PIPELINE CAAS
#
# GENESIS ENTRY TIMESTAMP: DECEMBER 25, 2025
# SECURITY PERIMETER CONSTRAINT: 380-CHARACTER CRYPTOGRAPHIC HEADER REQUIRED
# HARDWARE ROOT VALIDATION SIGNATURE: MAESTRO_AGE_2026
#
# NOTICE: THIS SOFTWARE IS AN INDEPENDENT SCRIPTURAL AND CRYPTOGRAPHIC BUILD.
# ANY UNAUTHORIZED REPLICATION, REVERSE-ENGINEERING, OR SYSTEMIC TRESPASS
# CONSTITUTES AN IMMEDIATE INFRINGEMENT OF ORIGINAL PROVENANCE.
# ==============================================================================
#
# DAISY INTEGRATION: Double-Tap Widget + Compiler Engine
# This file replaces app/main.py with full DAISY gesture capture wired in.
# ==============================================================================

import os
import json
import time
import zipfile
import hashlib
import threading
from datetime import datetime

from kivy.app import App
from kivy.uix.floatlayout import FloatLayout
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.scrollview import ScrollView
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.popup import Popup
from kivy.uix.widget import Widget
from kivy.graphics import Color, RoundedRectangle, Line
from kivy.clock import Clock
from kivy.core.window import Window
from kivy.utils import get_color_from_hex
from kivy.animation import Animation

# Import DAISY compiler (same package)
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from widget.compiler_engine import compile_fragments


# ==============================================================================
# SECTION 1 — TEXT REGISTRY
# Tracks all visible text labels and their screen positions
# Used by the double-tap detector to find the nearest text to a tap
# ==============================================================================

class TextRegistry:
    """
    Central registry of all Label widgets currently rendered on screen.
    Widgets self-register when added and deregister when removed.
    """
    def __init__(self):
        self._registry = {}   # {(cx, cy): "text content"}
        self._lock = threading.Lock()

    def register(self, widget, text):
        cx = widget.center_x
        cy = widget.center_y
        with self._lock:
            self._registry[(cx, cy)] = text

    def deregister(self, widget):
        cx = widget.center_x
        cy = widget.center_y
        with self._lock:
            self._registry.pop((cx, cy), None)

    def snapshot(self):
        with self._lock:
            return dict(self._registry)

    def update_positions(self):
        """Call after layout changes to keep positions fresh."""
        pass  # Position refresh handled per-widget via bind in production


# ==============================================================================
# SECTION 2 — TETHER OVERLAY
# Animated gold capture confirmation ring
# ==============================================================================

class TetherOverlay(Widget):
    """
    Gold ring that flashes on the tapped text and flies to the DAISY orb.
    """
    def __init__(self, pos, text_preview, on_complete=None, **kwargs):
        super().__init__(**kwargs)
        self.size = (220, 52)
        self.pos = (pos[0] - 110, pos[1] - 26)
        self.on_complete = on_complete
        self._build(text_preview)
        self._animate()

    def _build(self, text_preview):
        preview = (text_preview[:30] + "...") if len(text_preview) > 30 else text_preview
        with self.canvas:
            Color(0.831, 0.686, 0.216, 1.0)   # burnished gold
            RoundedRectangle(pos=self.pos, size=self.size, radius=[10])
            Color(0.05, 0.05, 0.05, 0.92)
            RoundedRectangle(
                pos=(self.pos[0]+2, self.pos[1]+2),
                size=(self.size[0]-4, self.size[1]-4),
                radius=[8]
            )
        self._label = Label(
            text=f'[b]⬡[/b]  "{preview}"',
            markup=True,
            font_size='11sp',
            color=get_color_from_hex('#d4af37'),
            pos=self.pos,
            size=self.size,
            halign='center',
            valign='middle',
        )
        self.add_widget(self._label)

    def _animate(self):
        anim = (
            Animation(opacity=1.0, duration=0.1)
            + Animation(opacity=0.8, duration=0.25)
            + Animation(
                x=Window.width - 90,
                y=Window.height - 90,
                opacity=0.0,
                duration=0.4,
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
# Sits transparently over the full screen — intercepts all double-taps
# ==============================================================================

class DoubleTapDetector(Widget):
    TAP_WINDOW_S = 0.32    # Max gap between two taps
    TAP_RADIUS_PX = 65     # Max pixel distance between taps

    def __init__(self, text_registry: TextRegistry, on_capture, **kwargs):
        super().__init__(**kwargs)
        self.size = Window.size
        self.pos = (0, 0)
        self.size_hint = (None, None)
        self.text_registry = text_registry
        self.on_capture = on_capture
        self._last = None    # (x, y, timestamp)

    def on_touch_down(self, touch):
        now = time.time()
        tx, ty = touch.x, touch.y

        if self._last:
            lx, ly, lt = self._last
            dt = now - lt
            dist = ((tx - lx) ** 2 + (ty - ly) ** 2) ** 0.5

            if dt < self.TAP_WINDOW_S and dist < self.TAP_RADIUS_PX:
                self._last = None
                self._fire(tx, ty)
                return True  # consume the event

        self._last = (tx, ty, now)
        Clock.schedule_once(lambda dt: self._clear_last(), self.TAP_WINDOW_S + 0.05)
        return False   # pass through to widgets below

    def _clear_last(self):
        self._last = None

    def _fire(self, x, y):
        registry = self.text_registry.snapshot()
        if not registry:
            return
        best_text = None
        best_dist = float("inf")
        for (wx, wy), text in registry.items():
            d = ((x - wx) ** 2 + (y - wy) ** 2) ** 0.5
            if d < best_dist:
                best_dist = d
                best_text = text
        if best_text and best_dist < 180:
            self.on_capture(best_text, (x, y))


# ==============================================================================
# SECTION 4 — BUBBLE COLLECTOR ORB
# Floating DAISY orb — shows fragment count, opens compilation panel on tap
# ==============================================================================

class BubbleCollectorOrb(Widget):
    def __init__(self, on_open, **kwargs):
        super().__init__(**kwargs)
        self.size = (68, 68)
        self.pos = (Window.width - 84, Window.height - 84)
        self.count = 0
        self.on_open = on_open
        self._draw()

    def _draw(self):
        self.canvas.clear()
        with self.canvas:
            Color(0.831, 0.686, 0.216, 0.95)
            RoundedRectangle(pos=self.pos, size=self.size, radius=[34])
            Color(0.04, 0.04, 0.04, 0.95)
            RoundedRectangle(
                pos=(self.pos[0]+3, self.pos[1]+3),
                size=(self.size[0]-6, self.size[1]-6),
                radius=[31]
            )
        if hasattr(self, "_lbl"):
            self.remove_widget(self._lbl)
        self._lbl = Label(
            text=f"[b]{self.count}[/b]\n[size=8sp]DAISY[/size]",
            markup=True,
            font_size='13sp',
            color=get_color_from_hex('#d4af37'),
            pos=self.pos,
            size=self.size,
            halign='center',
            valign='middle',
        )
        self.add_widget(self._lbl)

    def add_fragment(self):
        self.count += 1
        self._draw()
        anim = Animation(opacity=0.4, duration=0.08) + Animation(opacity=1.0, duration=0.12)
        anim.start(self)

    def on_touch_down(self, touch):
        if self.collide_point(*touch.pos):
            self.on_open()
            return True
        return False


# ==============================================================================
# SECTION 5 — COMPILATION PANEL
# Popup showing all captured fragments + compile button + results
# ==============================================================================

class CompilationPanel(Popup):
    def __init__(self, fragments, on_compile, **kwargs):
        super().__init__(
            title='DAISY — Compilation Panel',
            size_hint=(0.95, 0.85),
            background_color=get_color_from_hex('#0d0d0d'),
            separator_color=get_color_from_hex('#d4af37'),
            **kwargs
        )
        self.fragments = fragments
        self.on_compile = on_compile
        self._build()

    def _build(self):
        root = BoxLayout(orientation='vertical', padding=12, spacing=10)

        # Fragment list
        scroll = ScrollView(size_hint=(1, 0.6))
        frag_list = BoxLayout(
            orientation='vertical',
            spacing=6,
            size_hint_y=None,
        )
        frag_list.bind(minimum_height=frag_list.setter('height'))

        for i, frag in enumerate(self.fragments):
            src = frag.get("source_screen", "unknown")
            text = frag.get("text", "")[:60]
            row = Label(
                text=f'[b][color=d4af37]{i+1}.[/color][/b]  [color=aaaaaa]{src}[/color]\n{text}',
                markup=True,
                font_size='11sp',
                size_hint_y=None,
                height=52,
                halign='left',
                valign='middle',
                text_size=(Window.width * 0.88, None),
            )
            frag_list.add_widget(row)

        scroll.add_widget(frag_list)
        root.add_widget(scroll)

        # Status label
        self.status_lbl = Label(
            text=f'[b]{len(self.fragments)}[/b] fragments ready to compile',
            markup=True,
            font_size='13sp',
            color=get_color_from_hex('#d4af37'),
            size_hint=(1, 0.1),
        )
        root.add_widget(self.status_lbl)

        # Compile button
        btn = Button(
            text='⚙  COMPILE + OPTIMIZE + BUILD',
            font_size='14sp',
            bold=True,
            size_hint=(1, 0.15),
            background_color=get_color_from_hex('#d4af37'),
            color=(0, 0, 0, 1),
        )
        btn.bind(on_press=self._run_compile)
        root.add_widget(btn)

        # Clear button
        clr = Button(
            text='✕  Clear All Fragments',
            font_size='12sp',
            size_hint=(1, 0.12),
            background_color=get_color_from_hex('#333333'),
            color=get_color_from_hex('#ff4444'),
        )
        clr.bind(on_press=lambda x: self.dismiss())
        root.add_widget(clr)

        self.content = root

    def _run_compile(self, *args):
        self.status_lbl.text = '[color=00ff88]⚙  Compiling... running probe analysis...[/color]'
        # Run in background thread to keep UI responsive
        threading.Thread(target=self._compile_worker, daemon=True).start()

    def _compile_worker(self):
        result = compile_fragments(self.fragments)
        Clock.schedule_once(lambda dt: self._show_result(result), 0)

    def _show_result(self, result):
        self.on_compile(result)
        status_color = "00ff88" if result.status == "READY" else "ff8800" if result.status == "PARTIAL" else "ff4444"
        self.status_lbl.text = (
            f'[b][color={status_color}]{result.status}[/color][/b]  '
            f'{result.passed_probes}/{result.total_probes} probes passed  |  '
            f'{result.build_time_ms:.0f}ms  |  App: {result.id}'
        )


# ==============================================================================
# SECTION 6 — MAIN APP (upgraded from original main.py)
# ==============================================================================

class SolveXNodeApp(App):
    def build(self):
        Window.clearcolor = get_color_from_hex('#0d0d0d')

        # Root layout — FloatLayout so we can layer the DAISY orb on top
        self.root_layout = FloatLayout()

        # ---- MAIN CONTENT (original SolveX UI) ----
        main = BoxLayout(
            orientation='vertical',
            padding=20,
            spacing=15,
            size_hint=(1, 1),
            pos=(0, 0),
        )

        self.lbl_header = Label(
            text='[b]SolveX Node[/b]\n[color=00FF00][size=14sp]Status: Active[/size][/color]',
            font_size='22sp',
            markup=True,
            halign='center',
            size_hint=(1, 0.15),
        )

        self.lbl_daisy_status = Label(
            text='[color=d4af37][b]DAISY[/b][/color] — Double-tap any text to capture it',
            markup=True,
            font_size='12sp',
            halign='center',
            size_hint=(1, 0.08),
        )

        self.lbl_status = Label(
            text='Initializing Consensus Ledger...',
            font_size='14sp',
            color=get_color_from_hex('#00FF00'),
            halign='center',
            size_hint=(1, 0.12),
        )

        self.lbl_audit = Label(
            text='[i]Awaiting Byte-Stream Traffic...[/i]',
            font_size='12sp',
            markup=True,
            halign='center',
            color=get_color_from_hex('#888888'),
            size_hint=(1, 0.2),
            text_size=(Window.width - 40, None),
        )

        btn_sync = Button(
            text='Sync Ledger & Enforce 380-Byte Protocol',
            size_hint=(1, 0.12),
            background_color=get_color_from_hex('#1a4a6b'),
            color=(1, 1, 1, 1),
            font_size='14sp',
        )
        btn_sync.bind(on_press=self.on_sync_pressed)

        btn_export = Button(
            text='Export & Zip Forensic Ledger',
            size_hint=(1, 0.12),
            background_color=get_color_from_hex('#6b3a1a'),
            color=(1, 1, 1, 1),
            font_size='14sp',
        )
        btn_export.bind(on_press=self.on_export_pressed)

        main.add_widget(self.lbl_header)
        main.add_widget(self.lbl_daisy_status)
        main.add_widget(self.lbl_status)
        main.add_widget(self.lbl_audit)
        main.add_widget(btn_sync)
        main.add_widget(btn_export)

        self.root_layout.add_widget(main)

        # ---- DAISY LAYER ----
        # Text registry — all visible labels register here
        self.text_registry = TextRegistry()
        self._register_labels([
            self.lbl_header, self.lbl_daisy_status,
            self.lbl_status, self.lbl_audit
        ])

        # Fragment store
        self.fragments = []

        # Bubble collector orb
        self.orb = BubbleCollectorOrb(on_open=self._open_panel)
        self.root_layout.add_widget(self.orb)

        # Double-tap detector (transparent, on top of everything)
        self.detector = DoubleTapDetector(
            text_registry=self.text_registry,
            on_capture=self._on_text_captured,
        )
        self.root_layout.add_widget(self.detector)

        return self.root_layout

    # ---------------------------------------------------------------
    # DAISY: text capture
    # ---------------------------------------------------------------
    def _register_labels(self, labels):
        for lbl in labels:
            Clock.schedule_once(lambda dt, l=lbl: self.text_registry.register(l, l.text), 0.2)

    def _on_text_captured(self, text, pos):
        """Called when a double-tap successfully tethers text."""
        frag = {
            "id": hashlib.sha256(f"{text}{time.time()}".encode()).hexdigest()[:16],
            "text": text,
            "source_screen": "SolveXNodeApp",
            "position": list(pos),
            "timestamp": time.time(),
        }
        self.fragments.append(frag)

        # Show tether animation
        overlay = TetherOverlay(
            pos=pos,
            text_preview=text,
            on_complete=lambda: None,
        )
        self.root_layout.add_widget(overlay)

        # Update orb count
        self.orb.add_fragment()

        # Update status
        self.lbl_daisy_status.text = (
            f'[color=d4af37][b]DAISY[/b][/color] — '
            f'[color=00ff88]{len(self.fragments)} fragment{"s" if len(self.fragments) != 1 else ""} captured[/color]'
        )

    def _open_panel(self):
        if not self.fragments:
            self.lbl_daisy_status.text = '[color=d4af37][b]DAISY[/b][/color] — No fragments yet. Double-tap text to capture.'
            return
        panel = CompilationPanel(
            fragments=self.fragments,
            on_compile=self._on_build_complete,
        )
        panel.open()

    def _on_build_complete(self, result):
        """Called when DAISY compiler finishes building the app."""
        # Save compiled output to file
        out_path = os.path.join(os.path.dirname(__file__), f"daisy_build_{result.id}.py")
        with open(out_path, "w") as f:
            f.write(result.final_code)

        # Update UI
        color = "00ff88" if result.status == "READY" else "ff8800"
        self.lbl_status.text = (
            f'DAISY BUILD {result.status}\n'
            f'{result.passed_probes}/{result.total_probes} probes  |  {result.build_time_ms:.0f}ms'
        )
        self.lbl_status.color = get_color_from_hex(color)
        self.lbl_audit.text = (
            f'[b]App ID:[/b] {result.id}\n'
            f'[b]Graph:[/b] {result.graph_hash[:24]}...\n'
            f'[b]Output:[/b] daisy_build_{result.id}.py'
        )

        # Reset fragment store after successful build
        if result.status == "READY":
            self.fragments = []
            self.orb.count = 0
            self.orb._draw()

    # ---------------------------------------------------------------
    # ORIGINAL SolveX functions (preserved)
    # ---------------------------------------------------------------
    def on_sync_pressed(self, instance):
        from datetime import datetime
        mock_packet = b"SOLVEX_HDR:" + os.urandom(369)
        packet_size = len(mock_packet)
        log_entry = (
            f"[{datetime.now().isoformat()}] "
            f"Packet: {packet_size}B | "
            f"Hex: {mock_packet.hex()[:40]}..."
        )
        log_path = os.path.join(os.path.dirname(__file__), 'forensic_audit_stream.log')
        with open(log_path, 'a') as f:
            f.write(log_entry + "\n")

        self.lbl_status.text = "Forensic Audit Executed.\n380-Byte Constraints Verified."
        self.lbl_status.color = get_color_from_hex('#00FF00')
        self.lbl_audit.text = f'[b]Byte-Stream Audited[/b]\n{log_entry[-60:]}'

        # Also register new audit text in DAISY registry
        self.text_registry.register(self.lbl_audit, self.lbl_audit.text)

    def on_export_pressed(self, instance):
        from datetime import datetime
        log_path = os.path.join(os.path.dirname(__file__), 'forensic_audit_stream.log')
        export_name = f"solvex_ledger_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
        export_path = os.path.join(os.path.dirname(__file__), export_name)

        with zipfile.ZipFile(export_path, 'w', zipfile.ZIP_DEFLATED) as z:
            if os.path.exists(log_path):
                z.write(log_path, 'forensic_audit_stream.log')
            consensus = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                'consensus-vault', 'consensus_memory.json'
            )
            if os.path.exists(consensus):
                z.write(consensus, 'consensus_memory.json')
            # Also export any DAISY build outputs
            base = os.path.dirname(__file__)
            for f in os.listdir(base):
                if f.startswith("daisy_build_") and f.endswith(".py"):
                    z.write(os.path.join(base, f), f)

        self.lbl_status.text = "Ledger Exported Successfully!"
        self.lbl_audit.text = f'[b]Export:[/b] {export_name}'


if __name__ == '__main__':
    SolveXNodeApp().run()
