"""
Zero Gas Fee Module - Gasless Transaction & Rent Reclamation Engine
Handles meta-transactions, relayer patterns, and Solana rent reclamation
"""

import json
import hashlib
import time
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum


class GasOptimizationStrategy(Enum):
    """Gas optimization strategies"""
    RELAYER_PATTERN = "relayer_pattern"
    META_TRANSACTION = "meta_transaction"
    BATCH_PROCESSING = "batch_processing"
    SOLANA_RENT_RECLAIM = "solana_rent_reclaim"
    DUST_SWEEP = "dust_sweep"
    ACCOUNT_CLOSURE = "account_closure"


@dataclass
class GaslessTransaction:
    """Represents a gasless transaction"""
    tx_id: str
    strategy: GasOptimizationStrategy
    from_address: str
    to_address: str
    amount: int
    gas_saved: int
    relayer_address: Optional[str] = None
    nonce: int = 0
    signature: Optional[str] = None
    status: str = "pending"  # pending, submitted, confirmed, failed
    created_at: float = None
    confirmed_at: Optional[float] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = time.time()
    
    def to_dict(self):
        return {
            'tx_id': self.tx_id,
            'strategy': self.strategy.value,
            'from_address': self.from_address,
            'to_address': self.to_address,
            'amount': self.amount,
            'gas_saved': self.gas_saved,
            'relayer_address': self.relayer_address,
            'nonce': self.nonce,
            'signature': self.signature,
            'status': self.status,
            'created_at': self.created_at,
            'confirmed_at': self.confirmed_at
        }


@dataclass
class RentReclaimRecord:
    """Solana rent reclamation record"""
    reclaim_id: str
    wallet_address: str
    account_to_close: str
    rent_amount: int  # in lamports
    destination_address: str
    tx_signature: Optional[str] = None
    status: str = "pending"
    created_at: float = None
    confirmed_at: Optional[float] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = time.time()
    
    def to_dict(self):
        return {
            'reclaim_id': self.reclaim_id,
            'wallet_address': self.wallet_address,
            'account_to_close': self.account_to_close,
            'rent_amount': self.rent_amount,
            'destination_address': self.destination_address,
            'tx_signature': self.tx_signature,
            'status': self.status,
            'created_at': self.created_at,
            'confirmed_at': self.confirmed_at
        }


class ZeroGasFeeEngine:
    """Main zero gas fee and rent reclamation engine"""
    
    def __init__(self, relayer_address: str, forwarder_contract: str):
        """
        Initialize zero gas fee engine
        
        Args:
            relayer_address: Address of the relayer service
            forwarder_contract: Address of the forwarder contract
        """
        self.relayer_address = relayer_address
        self.forwarder_contract = forwarder_contract
        self.gasless_txs: List[GaslessTransaction] = []
        self.rent_reclaims: List[RentReclaimRecord] = []
        self.total_gas_saved = 0
        self.total_rent_reclaimed = 0
        self.nonce_counter = {}
    
    def generate_tx_id(self, strategy: GasOptimizationStrategy, from_addr: str) -> str:
        """Generate unique transaction ID"""
        data = f"{strategy.value}:{from_addr}:{time.time()}"
        return hashlib.sha256(data.encode()).hexdigest()[:16]
    
    def get_nonce(self, address: str) -> int:
        """Get and increment nonce for address"""
        if address not in self.nonce_counter:
            self.nonce_counter[address] = 0
        nonce = self.nonce_counter[address]
        self.nonce_counter[address] += 1
        return nonce
    
    def create_meta_transaction(
        self,
        from_address: str,
        to_address: str,
        amount: int,
        estimated_gas: int = 21000
    ) -> GaslessTransaction:
        """
        Create a meta-transaction for gasless execution
        
        Meta-transactions allow users to sign transactions without holding gas.
        The relayer pays the gas and is compensated from the transaction value.
        """
        tx_id = self.generate_tx_id(GasOptimizationStrategy.META_TRANSACTION, from_address)
        nonce = self.get_nonce(from_address)
        
        # Calculate gas savings (user saves 100% of gas cost)
        gas_saved = estimated_gas
        
        tx = GaslessTransaction(
            tx_id=tx_id,
            strategy=GasOptimizationStrategy.META_TRANSACTION,
            from_address=from_address,
            to_address=to_address,
            amount=amount,
            gas_saved=gas_saved,
            relayer_address=self.relayer_address,
            nonce=nonce,
            status="pending"
        )
        
        self.gasless_txs.append(tx)
        self.total_gas_saved += gas_saved
        
        return tx
    
    def create_relayer_transaction(
        self,
        from_address: str,
        to_address: str,
        amount: int,
        estimated_gas: int = 21000
    ) -> GaslessTransaction:
        """
        Create a relayer-pattern transaction
        
        Relayer pattern: User signs a message, relayer submits the transaction.
        Perfect for batch processing and optimized execution.
        """
        tx_id = self.generate_tx_id(GasOptimizationStrategy.RELAYER_PATTERN, from_address)
        nonce = self.get_nonce(from_address)
        
        gas_saved = estimated_gas
        
        tx = GaslessTransaction(
            tx_id=tx_id,
            strategy=GasOptimizationStrategy.RELAYER_PATTERN,
            from_address=from_address,
            to_address=to_address,
            amount=amount,
            gas_saved=gas_saved,
            relayer_address=self.relayer_address,
            nonce=nonce,
            status="pending"
        )
        
        self.gasless_txs.append(tx)
        self.total_gas_saved += gas_saved
        
        return tx
    
    def batch_gasless_transactions(
        self,
        transactions: List[Tuple[str, str, int]]  # (from, to, amount)
    ) -> List[GaslessTransaction]:
        """
        Batch multiple transactions for optimized gas usage
        
        Batching reduces per-transaction overhead and can save 30-50% gas.
        """
        batch_txs = []
        
        for from_addr, to_addr, amount in transactions:
            tx_id = self.generate_tx_id(GasOptimizationStrategy.BATCH_PROCESSING, from_addr)
            nonce = self.get_nonce(from_addr)
            
            # Batch processing saves ~40% gas per transaction
            gas_saved = int(21000 * 0.4)
            
            tx = GaslessTransaction(
                tx_id=tx_id,
                strategy=GasOptimizationStrategy.BATCH_PROCESSING,
                from_address=from_addr,
                to_address=to_addr,
                amount=amount,
                gas_saved=gas_saved,
                relayer_address=self.relayer_address,
                nonce=nonce,
                status="pending"
            )
            
            batch_txs.append(tx)
            self.gasless_txs.append(tx)
            self.total_gas_saved += gas_saved
        
        return batch_txs
    
    def create_solana_rent_reclaim(
        self,
        wallet_address: str,
        account_to_close: str,
        rent_amount: int,  # in lamports
        destination_address: str
    ) -> RentReclaimRecord:
        """
        Create a Solana rent reclamation transaction
        
        On Solana, closing empty token accounts recovers ~0.002039 SOL per account.
        This is completely gasless on Solana (rent is recovered, not paid).
        """
        reclaim_id = hashlib.sha256(
            f"rent_reclaim:{account_to_close}:{time.time()}".encode()
        ).hexdigest()[:16]
        
        reclaim = RentReclaimRecord(
            reclaim_id=reclaim_id,
            wallet_address=wallet_address,
            account_to_close=account_to_close,
            rent_amount=rent_amount,
            destination_address=destination_address,
            status="pending"
        )
        
        self.rent_reclaims.append(reclaim)
        self.total_rent_reclaimed += rent_amount
        
        return reclaim
    
    def batch_rent_reclaims(
        self,
        wallet_address: str,
        accounts: List[Tuple[str, int]],  # (account_address, rent_amount)
        destination_address: str
    ) -> List[RentReclaimRecord]:
        """
        Batch multiple rent reclamation transactions
        
        Solana allows batching multiple CloseAccount instructions in one transaction.
        """
        reclaims = []
        
        for account_addr, rent_amount in accounts:
            reclaim = self.create_solana_rent_reclaim(
                wallet_address,
                account_addr,
                rent_amount,
                destination_address
            )
            reclaims.append(reclaim)
        
        return reclaims
    
    def confirm_transaction(self, tx_id: str, signature: str) -> Optional[GaslessTransaction]:
        """Confirm a gasless transaction"""
        for tx in self.gasless_txs:
            if tx.tx_id == tx_id:
                tx.signature = signature
                tx.status = "confirmed"
                tx.confirmed_at = time.time()
                return tx
        return None
    
    def confirm_rent_reclaim(self, reclaim_id: str, tx_signature: str) -> Optional[RentReclaimRecord]:
        """Confirm a rent reclamation transaction"""
        for reclaim in self.rent_reclaims:
            if reclaim.reclaim_id == reclaim_id:
                reclaim.tx_signature = tx_signature
                reclaim.status = "confirmed"
                reclaim.confirmed_at = time.time()
                return reclaim
        return None
    
    def get_statistics(self) -> Dict:
        """Get zero gas fee statistics"""
        pending_txs = [tx for tx in self.gasless_txs if tx.status == "pending"]
        confirmed_txs = [tx for tx in self.gasless_txs if tx.status == "confirmed"]
        
        pending_reclaims = [r for r in self.rent_reclaims if r.status == "pending"]
        confirmed_reclaims = [r for r in self.rent_reclaims if r.status == "confirmed"]
        
        return {
            'gasless_transactions': {
                'total': len(self.gasless_txs),
                'pending': len(pending_txs),
                'confirmed': len(confirmed_txs),
                'total_gas_saved': self.total_gas_saved
            },
            'rent_reclamations': {
                'total': len(self.rent_reclaims),
                'pending': len(pending_reclaims),
                'confirmed': len(confirmed_reclaims),
                'total_rent_reclaimed': self.total_rent_reclaimed
            },
            'efficiency': {
                'avg_gas_saved_per_tx': self.total_gas_saved / len(self.gasless_txs) if self.gasless_txs else 0,
                'avg_rent_reclaimed_per_tx': self.total_rent_reclaimed / len(self.rent_reclaims) if self.rent_reclaims else 0
            }
        }
    
    def export_report(self) -> Dict:
        """Export comprehensive zero gas fee report"""
        return {
            'timestamp': time.time(),
            'statistics': self.get_statistics(),
            'gasless_transactions': [tx.to_dict() for tx in self.gasless_txs],
            'rent_reclamations': [r.to_dict() for r in self.rent_reclaims],
            'configuration': {
                'relayer_address': self.relayer_address,
                'forwarder_contract': self.forwarder_contract
            }
        }
