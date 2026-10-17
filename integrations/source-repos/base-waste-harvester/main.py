from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.scrollview import ScrollView
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.core.window import Window
from kivy.utils import get_color_from_hex
from kivy.clock import Clock
import json
import random
import threading


class WasteScanner:
    """Systemic waste detection and claiming engine"""
    
    def __init__(self):
        self.detected_waste = []
        self.claimed_waste = []
        self.scan_active = False
        self.contracts = {
            'multicall': '0xd8253782c45a13051464144e11df19f5c17c6b1a',
            'relayer': '0xcA11bde05977b3631167028862bE2a173976CA11',
            'forwarder': '0xd8253782c45a13051464144e11df19f5c17c6b1a'
        }
    
    def scan_for_waste(self, callback):
        """Scan blockchain for systemic waste"""
        def _scan():
            self.scan_active = True
            # Simulate blockchain scanning
            waste_types = ['orphaned_gas', 'failed_txs', 'dust_tokens', 'dead_contracts', 'unused_allowances']
            
            for i in range(5):
                if not self.scan_active:
                    break
                
                waste_item = {
                    'id': f'waste_{i}',
                    'type': random.choice(waste_types),
                    'amount': random.randint(100, 10000),
                    'address': f'0x{random.randint(0, 0xffffffff):08x}',
                    'recoverable': True
                }
                self.detected_waste.append(waste_item)
                callback(f"Detected: {waste_item['type']} - {waste_item['amount']} units")
            
            self.scan_active = False
            callback("Scan complete")
        
        thread = threading.Thread(target=_scan, daemon=True)
        thread.start()
    
    def claim_waste(self, waste_id, callback):
        """Claim detected waste via smart contracts"""
        for waste in self.detected_waste:
            if waste['id'] == waste_id:
                # Simulate blockchain transaction
                claim_tx = {
                    'waste_id': waste_id,
                    'amount': waste['amount'],
                    'tx_hash': f'0x{random.randint(0, 0xffffffff):064x}',
                    'status': 'confirmed',
                    'contract': self.contracts['multicall']
                }
                self.claimed_waste.append(claim_tx)
                self.detected_waste.remove(waste)
                callback(f"Claimed: {waste['amount']} units (tx: {claim_tx['tx_hash'][:10]}...)")
                return True
        
        return False


class PlanetaryHarvesterApp(App):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.scanner = WasteScanner()
        self.waste_display_items = []
    
    def build(self):
        Window.clearcolor = get_color_from_hex('#0A0A0A')
        Window.size = (540, 960)
        
        # Main layout
        main_layout = BoxLayout(orientation='vertical', padding=15, spacing=15)
        
        # Header
        header = Label(
            text='Planetary Harvester',
            font_size='28sp',
            bold=True,
            color=get_color_from_hex('#00FF00'),
            size_hint_y=0.08
        )
        main_layout.add_widget(header)
        
        # Status info
        status_info = Label(
            text='Systemic Waste Reclamation Engine\nIdentity: Sovereign | Audit: Secure',
            font_size='12sp',
            color=get_color_from_hex('#00FF00'),
            halign='center',
            size_hint_y=0.06
        )
        main_layout.add_widget(status_info)
        
        # Stats section
        stats_layout = GridLayout(cols=3, spacing=8, size_hint_y=0.12)
        
        self.detected_label = Label(
            text='Detected:\n0',
            font_size='14sp',
            color=get_color_from_hex('#00CCFF'),
            halign='center'
        )
        stats_layout.add_widget(self.detected_label)
        
        self.claimed_label = Label(
            text='Claimed:\n0',
            font_size='14sp',
            color=get_color_from_hex('#00FF00'),
            halign='center'
        )
        stats_layout.add_widget(self.claimed_label)
        
        self.total_label = Label(
            text='Total:\n0',
            font_size='14sp',
            color=get_color_from_hex('#FFAA00'),
            halign='center'
        )
        stats_layout.add_widget(self.total_label)
        
        main_layout.add_widget(stats_layout)
        
        # Waste list (scrollable)
        scroll = ScrollView(size_hint_y=0.50)
        self.waste_list = BoxLayout(orientation='vertical', size_hint_y=None, spacing=8)
        self.waste_list.bind(minimum_height=self.waste_list.setter('height'))
        scroll.add_widget(self.waste_list)
        main_layout.add_widget(scroll)
        
        # Action buttons
        button_layout = GridLayout(cols=2, spacing=10, size_hint_y=0.18)
        
        scan_button = Button(
            text='Scan for Waste',
            background_color=get_color_from_hex('#1a3a3a')
        )
        scan_button.bind(on_press=self.on_scan_pressed)
        button_layout.add_widget(scan_button)
        
        claim_button = Button(
            text='Claim All',
            background_color=get_color_from_hex('#2a3a1a')
        )
        claim_button.bind(on_press=self.on_claim_all_pressed)
        button_layout.add_widget(claim_button)
        
        main_layout.add_widget(button_layout)
        
        # Footer
        footer = Label(
            text='v1.0.0 | Base Network | Waste Reclamation',
            font_size='10sp',
            color=get_color_from_hex('#666666'),
            size_hint_y=0.06
        )
        main_layout.add_widget(footer)
        
        return main_layout
    
    def on_scan_pressed(self, instance):
        """Start waste scanning"""
        self.waste_list.clear_widgets()
        self.waste_display_items = []
        
        def update_ui(message):
            Clock.schedule_once(lambda dt: self._add_waste_item(message), 0)
        
        self.scanner.scan_for_waste(update_ui)
    
    def _add_waste_item(self, message):
        """Add waste item to UI"""
        waste_box = BoxLayout(orientation='horizontal', size_hint_y=None, height=60, spacing=8)
        
        info_label = Label(
            text=message,
            font_size='11sp',
            color=get_color_from_hex('#00CCFF'),
            halign='left',
            size_hint_x=0.7
        )
        waste_box.add_widget(info_label)
        
        # Extract waste ID from message if it's a detected waste
        waste_id = None
        for waste in self.scanner.detected_waste:
            if waste['type'] in message:
                waste_id = waste['id']
                break
        
        if waste_id:
            claim_btn = Button(
                text='Claim',
                size_hint_x=0.3,
                background_color=get_color_from_hex('#2a3a1a')
            )
            claim_btn.bind(on_press=lambda x: self.on_claim_pressed(waste_id))
            waste_box.add_widget(claim_btn)
        
        self.waste_list.add_widget(waste_box)
        self.waste_display_items.append(waste_box)
        
        # Update stats
        self._update_stats()
    
    def on_claim_pressed(self, waste_id):
        """Claim individual waste"""
        def update_ui(message):
            Clock.schedule_once(lambda dt: self._add_waste_item(message), 0)
        
        self.scanner.claim_waste(waste_id, update_ui)
    
    def on_claim_all_pressed(self, instance):
        """Claim all detected waste"""
        def update_ui(message):
            Clock.schedule_once(lambda dt: self._add_waste_item(message), 0)
        
        for waste in list(self.scanner.detected_waste):
            self.scanner.claim_waste(waste['id'], update_ui)
    
    def _update_stats(self):
        """Update statistics display"""
        detected = len(self.scanner.detected_waste)
        claimed = len(self.scanner.claimed_waste)
        total = sum(w['amount'] for w in self.scanner.claimed_waste)
        
        self.detected_label.text = f'Detected:\n{detected}'
        self.claimed_label.text = f'Claimed:\n{claimed}'
        self.total_label.text = f'Total:\n{total}'


if __name__ == '__main__':
    PlanetaryHarvesterApp().run()
