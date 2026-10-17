"""
Treasury System - Built-in Fund Management
Auto-sweep all recovered funds to secure treasury address
"""

import hashlib
import json
import time
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import uuid


class TreasuryStatus(Enum):
    """Treasury operational status"""
    ACTIVE = "active"
    LOCKED = "locked"
    MAINTENANCE = "maintenance"


@dataclass
class TreasuryTransaction:
    """Treasury transaction record"""
    tx_id: str
    source: str
    amount: int
    tx_hash: str
    status: str  # pending, confirmed, failed
    timestamp: float
    network: str
    
    def to_dict(self):
        return asdict(self)


class TreasuryAccount:
    """Secure treasury account for recovered funds"""
    
    def __init__(self, treasury_address: Optional[str] = None):
        """
        Initialize treasury account
        
        Args:
            treasury_address: Optional pre-defined treasury address
                            If None, generates new address on first use
        """
        self.treasury_id = str(uuid.uuid4())[:16]
        self.treasury_address = treasury_address or self._generate_treasury_address()
        self.balance = 0
        self.total_received = 0
        self.total_withdrawn = 0
        self.transactions: List[TreasuryTransaction] = []
        self.status = TreasuryStatus.ACTIVE
        self.created_at = time.time()
        self.last_sweep = None
        self.auto_sweep_enabled = True
        self.sweep_threshold = 100  # Minimum amount to trigger auto-sweep
    
    def _generate_treasury_address(self) -> str:
        """Generate new treasury address"""
        data = f"treasury_{self.treasury_id}_{time.time()}"
        address_hash = hashlib.sha256(data.encode()).hexdigest()
        return f"0x{address_hash[:40]}"
    
    def deposit(self, amount: int, source: str, network: str, tx_hash: str) -> TreasuryTransaction:
        """Record deposit to treasury"""
        tx_id = str(uuid.uuid4())[:12]
        
        tx = TreasuryTransaction(
            tx_id=tx_id,
            source=source,
            amount=amount,
            tx_hash=tx_hash,
            status="confirmed",
            timestamp=time.time(),
            network=network
        )
        
        self.transactions.append(tx)
        self.balance += amount
        self.total_received += amount
        
        return tx
    
    def withdraw(self, amount: int, destination: str, reason: str = "user_withdrawal") -> Dict:
        """Withdraw funds from treasury"""
        if amount > self.balance:
            return {
                'status': 'failed',
                'error': 'Insufficient balance',
                'balance': self.balance,
                'requested': amount
            }
        
        withdrawal_id = str(uuid.uuid4())[:12]
        tx_hash = hashlib.sha256(f"{withdrawal_id}_{destination}_{time.time()}".encode()).hexdigest()
        
        tx = TreasuryTransaction(
            tx_id=withdrawal_id,
            source=self.treasury_address,
            amount=amount,
            tx_hash=f"0x{tx_hash}",
            status="confirmed",
            timestamp=time.time(),
            network="multi"
        )
        
        self.transactions.append(tx)
        self.balance -= amount
        self.total_withdrawn += amount
        
        return {
            'status': 'success',
            'withdrawal_id': withdrawal_id,
            'amount': amount,
            'destination': destination,
            'tx_hash': f"0x{tx_hash}",
            'new_balance': self.balance,
            'reason': reason
        }
    
    def auto_sweep(self, waste_amount: int, source: str, network: str, tx_hash: str) -> bool:
        """Automatically sweep waste to treasury if threshold met"""
        if not self.auto_sweep_enabled:
            return False
        
        if waste_amount >= self.sweep_threshold:
            self.deposit(waste_amount, source, network, tx_hash)
            self.last_sweep = time.time()
            return True
        
        return False
    
    def get_balance(self) -> Dict:
        """Get current treasury balance"""
        return {
            'treasury_address': self.treasury_address,
            'balance': self.balance,
            'total_received': self.total_received,
            'total_withdrawn': self.total_withdrawn,
            'net_balance': self.total_received - self.total_withdrawn,
            'status': self.status.value,
            'last_sweep': self.last_sweep
        }
    
    def get_transaction_history(self, limit: int = 50) -> List[Dict]:
        """Get transaction history"""
        return [tx.to_dict() for tx in self.transactions[-limit:]]
    
    def get_statistics(self) -> Dict:
        """Get treasury statistics"""
        return {
            'treasury_id': self.treasury_id,
            'treasury_address': self.treasury_address,
            'balance': self.balance,
            'total_received': self.total_received,
            'total_withdrawn': self.total_withdrawn,
            'transaction_count': len(self.transactions),
            'status': self.status.value,
            'auto_sweep_enabled': self.auto_sweep_enabled,
            'sweep_threshold': self.sweep_threshold,
            'created_at': self.created_at,
            'last_sweep': self.last_sweep,
            'average_deposit': self.total_received / len(self.transactions) if self.transactions else 0
        }


class TreasuryManager:
    """Manages multiple treasury accounts and sweep operations"""
    
    def __init__(self):
        self.primary_treasury: Optional[TreasuryAccount] = None
        self.backup_treasuries: List[TreasuryAccount] = []
        self.sweep_history: List[Dict] = []
        self.total_swept = 0
        self.sweep_operations = 0
    
    def initialize_primary_treasury(self, address: Optional[str] = None) -> TreasuryAccount:
        """Initialize primary treasury account"""
        self.primary_treasury = TreasuryAccount(address)
        return self.primary_treasury
    
    def create_backup_treasury(self) -> TreasuryAccount:
        """Create backup treasury account"""
        backup = TreasuryAccount()
        self.backup_treasuries.append(backup)
        return backup
    
    def sweep_to_primary(self, amount: int, source: str, network: str, tx_hash: str) -> bool:
        """Sweep funds to primary treasury"""
        if not self.primary_treasury:
            self.initialize_primary_treasury()
        
        if self.primary_treasury.auto_sweep(amount, source, network, tx_hash):
            self.total_swept += amount
            self.sweep_operations += 1
            
            sweep_record = {
                'timestamp': time.time(),
                'amount': amount,
                'source': source,
                'network': network,
                'tx_hash': tx_hash,
                'destination': self.primary_treasury.treasury_address
            }
            self.sweep_history.append(sweep_record)
            return True
        
        return False
    
    def get_primary_balance(self) -> Dict:
        """Get primary treasury balance"""
        if not self.primary_treasury:
            return {'error': 'No primary treasury initialized'}
        return self.primary_treasury.get_balance()
    
    def withdraw_from_primary(self, amount: int, destination: str) -> Dict:
        """Withdraw from primary treasury"""
        if not self.primary_treasury:
            return {'status': 'failed', 'error': 'No primary treasury'}
        return self.primary_treasury.withdraw(amount, destination)
    
    def get_all_treasury_addresses(self) -> List[str]:
        """Get all treasury addresses"""
        addresses = []
        if self.primary_treasury:
            addresses.append(self.primary_treasury.treasury_address)
        addresses.extend([t.treasury_address for t in self.backup_treasuries])
        return addresses
    
    def get_system_statistics(self) -> Dict:
        """Get overall treasury system statistics"""
        primary_stats = self.primary_treasury.get_statistics() if self.primary_treasury else {}
        backup_stats = [t.get_statistics() for t in self.backup_treasuries]
        
        total_balance = 0
        total_received = 0
        
        if self.primary_treasury:
            total_balance += self.primary_treasury.balance
            total_received += self.primary_treasury.total_received
        
        for backup in self.backup_treasuries:
            total_balance += backup.balance
            total_received += backup.total_received
        
        return {
            'primary_treasury': primary_stats,
            'backup_treasuries': backup_stats,
            'total_balance': total_balance,
            'total_received': total_received,
            'total_swept': self.total_swept,
            'sweep_operations': self.sweep_operations,
            'sweep_history_count': len(self.sweep_history),
            'treasury_count': 1 + len(self.backup_treasuries)
        }
    
    def export_treasury_report(self) -> Dict:
        """Export comprehensive treasury report"""
        return {
            'timestamp': time.time(),
            'system_statistics': self.get_system_statistics(),
            'primary_treasury': {
                'address': self.primary_treasury.treasury_address if self.primary_treasury else None,
                'balance': self.primary_treasury.balance if self.primary_treasury else 0,
                'transactions': self.primary_treasury.get_transaction_history() if self.primary_treasury else []
            },
            'sweep_history': self.sweep_history[-100:],  # Last 100 sweeps
            'treasury_addresses': self.get_all_treasury_addresses()
        }
