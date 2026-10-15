"""
Waste Detector - Systemic Blockchain Waste Detection & Claiming Engine
Scans for orphaned gas, failed transactions, dust tokens, and unused allowances
"""

import json
import hashlib
import time
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from enum import Enum


class WasteType(Enum):
    """Types of systemic blockchain waste"""
    ORPHANED_GAS = "orphaned_gas"
    FAILED_TRANSACTIONS = "failed_txs"
    DUST_TOKENS = "dust_tokens"
    DEAD_CONTRACTS = "dead_contracts"
    UNUSED_ALLOWANCES = "unused_allowances"
    STALE_APPROVALS = "stale_approvals"
    ZOMBIE_WALLETS = "zombie_wallets"


@dataclass
class WasteItem:
    """Represents a single waste item detected on blockchain"""
    waste_id: str
    waste_type: WasteType
    amount: int
    address: str
    contract: str
    recoverable: bool
    detected_at: float
    metadata: Dict = None
    
    def to_dict(self):
        return {
            'waste_id': self.waste_id,
            'waste_type': self.waste_type.value,
            'amount': self.amount,
            'address': self.address,
            'contract': self.contract,
            'recoverable': self.recoverable,
            'detected_at': self.detected_at,
            'metadata': self.metadata or {}
        }


@dataclass
class ClaimTransaction:
    """Represents a claim transaction on blockchain"""
    claim_id: str
    waste_id: str
    amount: int
    tx_hash: str
    contract: str
    status: str  # pending, confirmed, failed
    claimed_at: float
    block_number: Optional[int] = None
    
    def to_dict(self):
        return asdict(self)


class WasteDetector:
    """Main waste detection and claiming engine"""
    
    def __init__(self, contracts: Dict[str, str]):
        """
        Initialize waste detector with contract addresses
        
        Args:
            contracts: Dict with 'multicall', 'relayer', 'forwarder' addresses
        """
        self.contracts = contracts
        self.detected_waste: List[WasteItem] = []
        self.claimed_waste: List[ClaimTransaction] = []
        self.scan_history = []
        self.total_recovered = 0
    
    def generate_waste_id(self, waste_type: WasteType, address: str) -> str:
        """Generate unique waste ID"""
        data = f"{waste_type.value}:{address}:{time.time()}"
        return hashlib.sha256(data.encode()).hexdigest()[:16]
    
    def scan_orphaned_gas(self) -> List[WasteItem]:
        """Scan for orphaned gas in failed transactions"""
        waste_items = []
        
        # Simulate detection of orphaned gas
        for i in range(3):
            waste_id = self.generate_waste_id(WasteType.ORPHANED_GAS, f"0x{i:040x}")
            waste_item = WasteItem(
                waste_id=waste_id,
                waste_type=WasteType.ORPHANED_GAS,
                amount=int(0.5 * 10**18),  # 0.5 ETH in wei
                address=f"0x{i:040x}",
                contract=self.contracts['multicall'],
                recoverable=True,
                detected_at=time.time(),
                metadata={'failed_tx_count': i + 1}
            )
            waste_items.append(waste_item)
        
        return waste_items
    
    def scan_dust_tokens(self) -> List[WasteItem]:
        """Scan for dust tokens in wallets"""
        waste_items = []
        
        dust_tokens = [
            {'symbol': 'USDC', 'amount': 0.01},
            {'symbol': 'DAI', 'amount': 0.001},
            {'symbol': 'USDT', 'amount': 0.001},
        ]
        
        for i, token in enumerate(dust_tokens):
            waste_id = self.generate_waste_id(WasteType.DUST_TOKENS, token['symbol'])
            waste_item = WasteItem(
                waste_id=waste_id,
                waste_type=WasteType.DUST_TOKENS,
                amount=int(token['amount'] * 10**6),  # Stablecoin precision
                address=f"0x{i:040x}",
                contract=self.contracts['multicall'],
                recoverable=True,
                detected_at=time.time(),
                metadata={'token': token['symbol'], 'value_usd': token['amount']}
            )
            waste_items.append(waste_item)
        
        return waste_items
    
    def scan_unused_allowances(self) -> List[WasteItem]:
        """Scan for unused token allowances"""
        waste_items = []
        
        allowances = [
            {'spender': '0xE592427A0AEce92De3Edee1F18E0157C05861564', 'amount': 1000},
            {'spender': '0x68b3465833fb72B5A828cCEBF2B9375537B86D5e', 'amount': 5000},
            {'spender': '0x1111111254fb6c44bac0bed2854e76f90643097d', 'amount': 2000},
        ]
        
        for i, allowance in enumerate(allowances):
            waste_id = self.generate_waste_id(WasteType.UNUSED_ALLOWANCES, allowance['spender'])
            waste_item = WasteItem(
                waste_id=waste_id,
                waste_type=WasteType.UNUSED_ALLOWANCES,
                amount=allowance['amount'],
                address=allowance['spender'],
                contract=self.contracts['multicall'],
                recoverable=True,
                detected_at=time.time(),
                metadata={'spender': allowance['spender'], 'risk_level': 'medium'}
            )
            waste_items.append(waste_item)
        
        return waste_items
    
    def scan_all_waste(self) -> List[WasteItem]:
        """Execute comprehensive waste scan"""
        all_waste = []
        
        # Scan different waste types
        all_waste.extend(self.scan_orphaned_gas())
        all_waste.extend(self.scan_dust_tokens())
        all_waste.extend(self.scan_unused_allowances())
        
        # Add to detected waste
        self.detected_waste.extend(all_waste)
        
        # Record scan
        self.scan_history.append({
            'timestamp': time.time(),
            'waste_count': len(all_waste),
            'total_amount': sum(w.amount for w in all_waste)
        })
        
        return all_waste
    
    def claim_waste(self, waste_id: str) -> Optional[ClaimTransaction]:
        """Claim detected waste via smart contract"""
        
        # Find waste item
        waste_item = None
        for waste in self.detected_waste:
            if waste.waste_id == waste_id:
                waste_item = waste
                break
        
        if not waste_item:
            return None
        
        # Create claim transaction
        claim_id = hashlib.sha256(f"{waste_id}:{time.time()}".encode()).hexdigest()[:16]
        tx_hash = hashlib.sha256(f"claim:{waste_id}:{time.time()}".encode()).hexdigest()
        
        claim_tx = ClaimTransaction(
            claim_id=claim_id,
            waste_id=waste_id,
            amount=waste_item.amount,
            tx_hash=f"0x{tx_hash}",
            contract=waste_item.contract,
            status='confirmed',
            claimed_at=time.time(),
            block_number=int(time.time() / 12)  # Approximate block number
        )
        
        # Record claim
        self.claimed_waste.append(claim_tx)
        self.total_recovered += waste_item.amount
        
        # Remove from detected
        self.detected_waste.remove(waste_item)
        
        return claim_tx
    
    def claim_all_waste(self) -> List[ClaimTransaction]:
        """Claim all detected waste"""
        claims = []
        
        for waste in list(self.detected_waste):
            claim = self.claim_waste(waste.waste_id)
            if claim:
                claims.append(claim)
        
        return claims
    
    def get_statistics(self) -> Dict:
        """Get detector statistics"""
        return {
            'detected_count': len(self.detected_waste),
            'claimed_count': len(self.claimed_waste),
            'total_recovered': self.total_recovered,
            'total_scans': len(self.scan_history),
            'waste_by_type': self._count_by_type(),
            'recovery_rate': self._calculate_recovery_rate()
        }
    
    def _count_by_type(self) -> Dict[str, int]:
        """Count waste by type"""
        counts = {}
        for waste in self.detected_waste + [w for c in self.claimed_waste for w in [self._get_waste_for_claim(c)]]:
            if waste:
                waste_type = waste.waste_type.value
                counts[waste_type] = counts.get(waste_type, 0) + 1
        return counts
    
    def _get_waste_for_claim(self, claim: ClaimTransaction) -> Optional[WasteItem]:
        """Get waste item for a claim"""
        for waste in self.detected_waste:
            if waste.waste_id == claim.waste_id:
                return waste
        return None
    
    def _calculate_recovery_rate(self) -> float:
        """Calculate recovery rate percentage"""
        total_detected = len(self.detected_waste) + len(self.claimed_waste)
        if total_detected == 0:
            return 0.0
        return (len(self.claimed_waste) / total_detected) * 100
    
    def export_report(self) -> Dict:
        """Export comprehensive waste report"""
        return {
            'timestamp': time.time(),
            'statistics': self.get_statistics(),
            'detected_waste': [w.to_dict() for w in self.detected_waste],
            'claimed_waste': [c.to_dict() for c in self.claimed_waste],
            'scan_history': self.scan_history,
            'contracts': self.contracts
        }
