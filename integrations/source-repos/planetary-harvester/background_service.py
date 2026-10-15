"""
Background Service - Continuous Operation & Persistence
Manages background scanning, claiming, and treasury operations
"""

import json
import os
import time
import threading
from typing import Dict, Optional, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import uuid


class ServiceStatus(Enum):
    """Background service status"""
    STOPPED = "stopped"
    STARTING = "starting"
    RUNNING = "running"
    PAUSED = "paused"
    STOPPING = "stopping"
    ERROR = "error"


@dataclass
class ServiceConfig:
    """Background service configuration"""
    enabled: bool = False
    scan_interval: int = 30  # seconds
    auto_claim: bool = True
    auto_sweep: bool = True
    notification_enabled: bool = True
    battery_optimization: bool = True
    network_optimization: bool = True
    max_concurrent_scans: int = 10
    
    def to_dict(self):
        return asdict(self)
    
    @staticmethod
    def from_dict(data: Dict):
        return ServiceConfig(**data)


class BackgroundService:
    """Manages continuous background operations"""
    
    CONFIG_FILE = "/home/ubuntu/.agate_node/background_service.json"
    STATE_FILE = "/home/ubuntu/.agate_node/service_state.json"
    
    def __init__(self):
        self.service_id = str(uuid.uuid4())[:16]
        self.status = ServiceStatus.STOPPED
        self.config = ServiceConfig()
        self.service_thread: Optional[threading.Thread] = None
        self.running = False
        self.paused = False
        
        # Statistics
        self.start_time: Optional[float] = None
        self.uptime = 0
        self.scans_performed = 0
        self.claims_performed = 0
        self.sweeps_performed = 0
        self.total_recovered = 0
        self.errors_encountered = 0
        
        # Callbacks
        self.on_scan_complete: Optional[Callable] = None
        self.on_claim_complete: Optional[Callable] = None
        self.on_sweep_complete: Optional[Callable] = None
        self.on_error: Optional[Callable] = None
        
        self._load_config()
    
    def _ensure_config_dir(self):
        """Ensure config directory exists"""
        config_dir = os.path.dirname(self.CONFIG_FILE)
        os.makedirs(config_dir, exist_ok=True)
    
    def _load_config(self):
        """Load configuration from file"""
        self._ensure_config_dir()
        
        if os.path.exists(self.CONFIG_FILE):
            try:
                with open(self.CONFIG_FILE, 'r') as f:
                    data = json.load(f)
                    self.config = ServiceConfig.from_dict(data)
            except Exception as e:
                print(f"Error loading config: {e}")
                self._save_config()
        else:
            self._save_config()
    
    def _save_config(self):
        """Save configuration to file"""
        self._ensure_config_dir()
        
        try:
            with open(self.CONFIG_FILE, 'w') as f:
                json.dump(self.config.to_dict(), f, indent=2)
        except Exception as e:
            print(f"Error saving config: {e}")
    
    def _save_state(self):
        """Save service state to file"""
        self._ensure_config_dir()
        
        state = {
            'service_id': self.service_id,
            'status': self.status.value,
            'uptime': self.uptime,
            'scans_performed': self.scans_performed,
            'claims_performed': self.claims_performed,
            'sweeps_performed': self.sweeps_performed,
            'total_recovered': self.total_recovered,
            'errors_encountered': self.errors_encountered,
            'last_update': time.time()
        }
        
        try:
            with open(self.STATE_FILE, 'w') as f:
                json.dump(state, f, indent=2)
        except Exception as e:
            print(f"Error saving state: {e}")
    
    def _load_state(self):
        """Load service state from file"""
        if os.path.exists(self.STATE_FILE):
            try:
                with open(self.STATE_FILE, 'r') as f:
                    state = json.load(f)
                    self.scans_performed = state.get('scans_performed', 0)
                    self.claims_performed = state.get('claims_performed', 0)
                    self.sweeps_performed = state.get('sweeps_performed', 0)
                    self.total_recovered = state.get('total_recovered', 0)
                    self.errors_encountered = state.get('errors_encountered', 0)
            except Exception as e:
                print(f"Error loading state: {e}")
    
    def start(self) -> bool:
        """Start background service"""
        if self.running:
            return False
        
        self.status = ServiceStatus.STARTING
        self.running = True
        self.paused = False
        self.start_time = time.time()
        
        self._load_state()
        self._save_config()
        
        self.service_thread = threading.Thread(
            target=self._service_loop,
            daemon=True,
            name="BackgroundService"
        )
        self.service_thread.start()
        
        self.status = ServiceStatus.RUNNING
        return True
    
    def stop(self) -> bool:
        """Stop background service"""
        if not self.running:
            return False
        
        self.status = ServiceStatus.STOPPING
        self.running = False
        
        if self.service_thread:
            self.service_thread.join(timeout=5)
        
        self.status = ServiceStatus.STOPPED
        self._save_state()
        return True
    
    def pause(self) -> bool:
        """Pause background service"""
        if not self.running:
            return False
        
        self.paused = True
        self.status = ServiceStatus.PAUSED
        return True
    
    def resume(self) -> bool:
        """Resume background service"""
        if not self.running:
            return False
        
        self.paused = False
        self.status = ServiceStatus.RUNNING
        return True
    
    def _service_loop(self):
        """Main service loop"""
        while self.running:
            try:
                if not self.paused:
                    self._execute_scan_cycle()
                    self._update_uptime()
                    self._save_state()
                
                time.sleep(self.config.scan_interval)
            
            except Exception as e:
                self.errors_encountered += 1
                self.status = ServiceStatus.ERROR
                
                if self.on_error:
                    self.on_error(str(e))
                
                time.sleep(5)  # Wait before retry
                self.status = ServiceStatus.RUNNING
    
    def _execute_scan_cycle(self):
        """Execute one scan cycle"""
        try:
            # Simulate scan
            self.scans_performed += 1
            
            if self.config.auto_claim:
                self.claims_performed += 1
                self.total_recovered += 1000  # Simulate recovery
            
            if self.config.auto_sweep:
                self.sweeps_performed += 1
            
            if self.on_scan_complete:
                self.on_scan_complete({
                    'scans': self.scans_performed,
                    'claims': self.claims_performed,
                    'recovered': self.total_recovered
                })
        
        except Exception as e:
            self.errors_encountered += 1
            if self.on_error:
                self.on_error(str(e))
    
    def _update_uptime(self):
        """Update service uptime"""
        if self.start_time:
            self.uptime = int(time.time() - self.start_time)
    
    def set_scan_interval(self, interval: int) -> bool:
        """Set scan interval (seconds)"""
        if interval < 10:
            return False
        
        self.config.scan_interval = interval
        self._save_config()
        return True
    
    def set_auto_claim(self, enabled: bool) -> bool:
        """Enable/disable auto-claiming"""
        self.config.auto_claim = enabled
        self._save_config()
        return True
    
    def set_auto_sweep(self, enabled: bool) -> bool:
        """Enable/disable auto-sweep"""
        self.config.auto_sweep = enabled
        self._save_config()
        return True
    
    def set_notifications(self, enabled: bool) -> bool:
        """Enable/disable notifications"""
        self.config.notification_enabled = enabled
        self._save_config()
        return True
    
    def set_battery_optimization(self, enabled: bool) -> bool:
        """Enable/disable battery optimization"""
        self.config.battery_optimization = enabled
        if enabled:
            self.config.scan_interval = max(self.config.scan_interval, 60)
        self._save_config()
        return True
    
    def get_status(self) -> Dict:
        """Get current service status"""
        return {
            'service_id': self.service_id,
            'status': self.status.value,
            'running': self.running,
            'paused': self.paused,
            'uptime': self.uptime,
            'start_time': self.start_time,
            'scans_performed': self.scans_performed,
            'claims_performed': self.claims_performed,
            'sweeps_performed': self.sweeps_performed,
            'total_recovered': self.total_recovered,
            'errors_encountered': self.errors_encountered
        }
    
    def get_configuration(self) -> Dict:
        """Get current configuration"""
        return self.config.to_dict()
    
    def get_statistics(self) -> Dict:
        """Get service statistics"""
        return {
            'uptime_seconds': self.uptime,
            'uptime_hours': self.uptime / 3600,
            'scans_performed': self.scans_performed,
            'claims_performed': self.claims_performed,
            'sweeps_performed': self.sweeps_performed,
            'total_recovered': self.total_recovered,
            'errors_encountered': self.errors_encountered,
            'average_recovery_per_scan': self.total_recovered / max(self.scans_performed, 1),
            'error_rate': self.errors_encountered / max(self.scans_performed, 1)
        }
    
    def export_report(self) -> Dict:
        """Export comprehensive service report"""
        return {
            'timestamp': time.time(),
            'service_status': self.get_status(),
            'configuration': self.get_configuration(),
            'statistics': self.get_statistics(),
            'service_id': self.service_id
        }


class ServiceManager:
    """Manages service lifecycle and persistence"""
    
    _instance: Optional[BackgroundService] = None
    _lock = threading.Lock()
    
    @classmethod
    def get_instance(cls) -> BackgroundService:
        """Get or create singleton service instance"""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = BackgroundService()
        return cls._instance
    
    @classmethod
    def start_service(cls) -> bool:
        """Start the background service"""
        service = cls.get_instance()
        return service.start()
    
    @classmethod
    def stop_service(cls) -> bool:
        """Stop the background service"""
        service = cls.get_instance()
        return service.stop()
    
    @classmethod
    def get_service_status(cls) -> Dict:
        """Get service status"""
        service = cls.get_instance()
        return service.get_status()
