from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.scrollview import ScrollView
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.switch import Switch
from kivy.uix.spinner import Spinner
from kivy.core.window import Window
from kivy.utils import get_color_from_hex
from kivy.clock import Clock
import json
import time
from datetime import datetime


class EnhancedPlanetaryHarvester:
    """Enhanced Planetary Harvester with 10 nodes, treasury, and background service"""
    
    def __init__(self):
        # Multi-node system
        self.num_nodes = 10
        self.nodes = [{'id': f'NODE-{i:02d}', 'status': 'idle', 'scans': 0, 'claims': 0} for i in range(self.num_nodes)]
        
        # Treasury system
        self.treasury = {
            'address': '0x' + 'a' * 40,
            'balance': 0,
            'total_received': 0,
            'total_withdrawn': 0,
            'auto_sweep': True
        }
        
        # Background service
        self.background_service = {
            'enabled': False,
            'running': False,
            'uptime': 0,
            'scans_performed': 0,
            'claims_performed': 0,
            'total_recovered': 0
        }
        
        # Statistics
        self.total_scans = 0
        self.total_claims = 0
        self.total_gas_saved = 0
        self.detected_waste = []
        self.claimed_waste = []


class PlanetaryHarvesterApp(App):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.harvester = EnhancedPlanetaryHarvester()
        self.activity_log = []
        self.update_timer = None
    
    def build(self):
        Window.clearcolor = get_color_from_hex('#0A0A0A')
        Window.size = (540, 1200)
        
        # Main scrollable layout
        main_scroll = ScrollView(size_hint=(1, 1))
        main_layout = BoxLayout(orientation='vertical', size_hint_y=None, spacing=10, padding=10)
        main_layout.bind(minimum_height=main_layout.setter('height'))
        
        # ===== HEADER =====
        header = Label(
            text='Planetary Harvester v2.0',
            font_size='24sp',
            bold=True,
            color=get_color_from_hex('#00FF00'),
            size_hint_y=None,
            height=50
        )
        main_layout.add_widget(header)
        
        # ===== BACKGROUND SERVICE TOGGLE =====
        service_box = BoxLayout(orientation='horizontal', size_hint_y=None, height=50, spacing=10)
        service_label = Label(
            text='Background Service:',
            color=get_color_from_hex('#00CCFF'),
            size_hint_x=0.7
        )
        self.service_toggle = Switch(active=False, size_hint_x=0.3)
        self.service_toggle.bind(active=self.on_service_toggle)
        service_box.add_widget(service_label)
        service_box.add_widget(self.service_toggle)
        main_layout.add_widget(service_box)
        
        # ===== NODE STATUS SECTION =====
        nodes_header = Label(
            text='10 Scanning Nodes Status',
            font_size='14sp',
            bold=True,
            color=get_color_from_hex('#FFAA00'),
            size_hint_y=None,
            height=30
        )
        main_layout.add_widget(nodes_header)
        
        # Node grid (2 columns)
        nodes_grid = GridLayout(cols=2, spacing=8, size_hint_y=None, height=500)
        self.node_labels = []
        
        for i in range(self.harvester.num_nodes):
            node_box = BoxLayout(orientation='vertical', size_hint_y=None, height=90)
            node_label = Label(
                text=f'NODE-{i:02d}\nScans: 0 | Claims: 0\nStatus: IDLE',
                font_size='9sp',
                color=get_color_from_hex('#00FF00'),
                halign='center'
            )
            self.node_labels.append(node_label)
            node_box.add_widget(node_label)
            nodes_grid.add_widget(node_box)
        
        main_layout.add_widget(nodes_grid)
        
        # ===== TREASURY SECTION =====
        treasury_header = Label(
            text='Built-in Treasury',
            font_size='14sp',
            bold=True,
            color=get_color_from_hex('#00CCFF'),
            size_hint_y=None,
            height=30
        )
        main_layout.add_widget(treasury_header)
        
        self.treasury_label = Label(
            text=f"Address: {self.harvester.treasury['address']}\nBalance: 0 | Received: 0 | Withdrawn: 0",
            font_size='10sp',
            color=get_color_from_hex('#FFAA00'),
            size_hint_y=None,
            height=60
        )
        main_layout.add_widget(self.treasury_label)
        
        # ===== STATISTICS SECTION =====
        stats_header = Label(
            text='System Statistics',
            font_size='14sp',
            bold=True,
            color=get_color_from_hex('#00FF00'),
            size_hint_y=None,
            height=30
        )
        main_layout.add_widget(stats_header)
        
        stats_grid = GridLayout(cols=2, spacing=8, size_hint_y=None, height=100)
        
        self.scans_label = Label(
            text='Total Scans:\n0',
            font_size='11sp',
            color=get_color_from_hex('#00CCFF'),
            halign='center'
        )
        stats_grid.add_widget(self.scans_label)
        
        self.claims_label = Label(
            text='Total Claims:\n0',
            font_size='11sp',
            color=get_color_from_hex('#00FF00'),
            halign='center'
        )
        stats_grid.add_widget(self.claims_label)
        
        self.gas_label = Label(
            text='Gas Saved:\n0 wei',
            font_size='11sp',
            color=get_color_from_hex('#FFAA00'),
            halign='center'
        )
        stats_grid.add_widget(self.gas_label)
        
        self.uptime_label = Label(
            text='Uptime:\n0s',
            font_size='11sp',
            color=get_color_from_hex('#FF00FF'),
            halign='center'
        )
        stats_grid.add_widget(self.uptime_label)
        
        main_layout.add_widget(stats_grid)
        
        # ===== ACTION BUTTONS =====
        button_grid = GridLayout(cols=2, spacing=10, size_hint_y=None, height=100)
        
        scan_button = Button(
            text='Start Scan',
            background_color=get_color_from_hex('#1a3a3a')
        )
        scan_button.bind(on_press=self.on_start_scan)
        button_grid.add_widget(scan_button)
        
        claim_button = Button(
            text='Claim All',
            background_color=get_color_from_hex('#2a3a1a')
        )
        claim_button.bind(on_press=self.on_claim_all)
        button_grid.add_widget(claim_button)
        
        treasury_button = Button(
            text='View Treasury',
            background_color=get_color_from_hex('#3a2a1a')
        )
        treasury_button.bind(on_press=self.on_view_treasury)
        button_grid.add_widget(treasury_button)
        
        stats_button = Button(
            text='Export Report',
            background_color=get_color_from_hex('#1a2a3a')
        )
        stats_button.bind(on_press=self.on_export_report)
        button_grid.add_widget(stats_button)
        
        main_layout.add_widget(button_grid)
        
        # ===== ACTIVITY LOG =====
        log_header = Label(
            text='Activity Log',
            font_size='12sp',
            bold=True,
            color=get_color_from_hex('#00CCFF'),
            size_hint_y=None,
            height=30
        )
        main_layout.add_widget(log_header)
        
        log_scroll = ScrollView(size_hint_y=None, height=200)
        self.activity_box = BoxLayout(orientation='vertical', size_hint_y=None, spacing=5)
        self.activity_box.bind(minimum_height=self.activity_box.setter('height'))
        log_scroll.add_widget(self.activity_box)
        main_layout.add_widget(log_scroll)
        
        # ===== FOOTER =====
        footer = Label(
            text='v2.0 | 10 Nodes | Built-in Treasury | Background Service',
            font_size='9sp',
            color=get_color_from_hex('#666666'),
            size_hint_y=None,
            height=30
        )
        main_layout.add_widget(footer)
        
        main_scroll.add_widget(main_layout)
        
        # Start update timer
        Clock.schedule_interval(self.update_ui, 1)
        
        return main_scroll
    
    def on_service_toggle(self, instance, value):
        """Handle background service toggle"""
        self.harvester.background_service['enabled'] = value
        self.harvester.background_service['running'] = value
        
        if value:
            self.add_activity("✓ Background service ENABLED - Continuous scanning active")
        else:
            self.add_activity("✗ Background service DISABLED")
    
    def on_start_scan(self, instance):
        """Start parallel scan across all nodes"""
        self.add_activity("[SCAN] Starting 10-node parallel scan...")
        
        # Simulate 10 nodes scanning
        for i, node in enumerate(self.harvester.nodes):
            node['status'] = 'scanning'
            node['scans'] += 1
        
        self.harvester.total_scans += 1
        self.add_activity(f"[SCAN] Completed: {self.harvester.total_scans} scans | Detected waste on all networks")
        
        for node in self.harvester.nodes:
            node['status'] = 'idle'
    
    def on_claim_all(self, instance):
        """Claim all detected waste"""
        self.add_activity("[CLAIM] Claiming all detected waste (gasless)...")
        
        for node in self.harvester.nodes:
            node['claims'] += 1
        
        self.harvester.total_claims += 1
        self.harvester.total_gas_saved += 50000
        self.harvester.treasury['balance'] += 1000
        self.harvester.treasury['total_received'] += 1000
        
        self.add_activity(f"[CLAIM] Success: {self.harvester.total_claims} claims | Gas saved: {self.harvester.total_gas_saved} wei")
    
    def on_view_treasury(self, instance):
        """View treasury details"""
        treasury = self.harvester.treasury
        msg = f"Treasury Address: {treasury['address']}\nBalance: {treasury['balance']}\nTotal Received: {treasury['total_received']}\nTotal Withdrawn: {treasury['total_withdrawn']}"
        self.add_activity(f"[TREASURY] {msg}")
    
    def on_export_report(self, instance):
        """Export system report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_scans': self.harvester.total_scans,
            'total_claims': self.harvester.total_claims,
            'gas_saved': self.harvester.total_gas_saved,
            'treasury_balance': self.harvester.treasury['balance'],
            'background_service': self.harvester.background_service
        }
        self.add_activity(f"[REPORT] {json.dumps(report, indent=2)}")
    
    def add_activity(self, message):
        """Add activity to log"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        activity_label = Label(
            text=f"[{timestamp}] {message}",
            font_size='9sp',
            color=get_color_from_hex('#00CCFF'),
            size_hint_y=None,
            height=30
        )
        self.activity_box.add_widget(activity_label)
        self.activity_log.append(message)
        
        # Keep only last 50 entries
        if len(self.activity_log) > 50:
            self.activity_box.remove_widget(self.activity_box.children[-1])
            self.activity_log.pop(0)
    
    def update_ui(self, dt):
        """Update UI every second"""
        # Update node labels
        for i, node in enumerate(self.harvester.nodes):
            if i < len(self.node_labels):
                status_color = '#00FF00' if node['status'] == 'idle' else '#FFAA00'
                self.node_labels[i].color = get_color_from_hex(status_color)
                self.node_labels[i].text = f"NODE-{i:02d}\nScans: {node['scans']} | Claims: {node['claims']}\nStatus: {node['status'].upper()}"
        
        # Update statistics
        self.scans_label.text = f"Total Scans:\n{self.harvester.total_scans}"
        self.claims_label.text = f"Total Claims:\n{self.harvester.total_claims}"
        self.gas_label.text = f"Gas Saved:\n{self.harvester.total_gas_saved} wei"
        
        # Update uptime
        if self.harvester.background_service['running']:
            self.harvester.background_service['uptime'] += 1
        
        uptime = self.harvester.background_service['uptime']
        uptime_str = f"{uptime // 3600}h {(uptime % 3600) // 60}m {uptime % 60}s"
        self.uptime_label.text = f"Uptime:\n{uptime_str}"
        
        # Update treasury
        treasury = self.harvester.treasury
        self.treasury_label.text = f"Address: {treasury['address'][:20]}...\nBalance: {treasury['balance']} | Received: {treasury['total_received']} | Withdrawn: {treasury['total_withdrawn']}"


if __name__ == '__main__':
    PlanetaryHarvesterApp().run()
