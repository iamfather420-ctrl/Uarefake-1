import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowDownToLine, Send, History, Loader2, ShieldCheck, Activity, ExternalLink, Copy, Check, Edit2, Save, AlertTriangle, X, Bot, Zap, Database, Fingerprint, Lock, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { useSendTransaction } from 'wagmi';
import { SolanaRentReclamation } from './SolanaRentReclamation';

export function Wallet() {
  const { address: connectedAddress, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const [liveStats, setLiveStats] = useState<{ balance: number, txCount: number } | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [treasurySolBalance, setTreasurySolBalance] = useState<number>(0);
  const [payoutAddress, setPayoutAddress] = useState<string>('');
  const [payoutAddressSol, setPayoutAddressSol] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<string>('SOL');
  const [settlementMode, setSettlementMode] = useState<'STANDARD' | 'RELAY'>('STANDARD');
  const [liquidityStrategy, setLiquidityStrategy] = useState<string>('PAYOUT');
  const [supportedAssets, setSupportedAssets] = useState<string[]>(['SOL', 'USDC_SPL']);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>('');
  const [inputAddress, setInputAddress] = useState<string>('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [treasuryAddress, setTreasuryAddress] = useState<string>('');
  const [treasuryAddressSol, setTreasuryAddressSol] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastTx, setLastTx] = useState<string | null>(null);
  const [error, setError] = useState<{ title: string, message: string, suggestion?: string } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [engineStats, setEngineStats] = useState<any>(null);
  const [totalLiquidity, setTotalLiquidity] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [networkVerification, setNetworkVerification] = useState<{ confirmed: boolean, network: string, exists: boolean, isContract: boolean, address?: string } | null>(null);
  const [calibration, setCalibration] = useState<any>(null);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [showManualIdInput, setShowManualIdInput] = useState(false);
  const [manualProjectId, setManualProjectId] = useState(() => localStorage.getItem('warhive_manual_project_id') || '');
  const [activity, setActivity] = useState<any[]>([]);
  const [gsnStatus, setGsnStatus] = useState<any>(null);

  // Send Tokens Modal State
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { walletProvider } = useAppKitProvider('solana' as any);
  const { sendTransactionAsync } = useSendTransaction();

  const handleSendTokens = async () => {
    setIsSending(true);
    try {
      if (!sendRecipient || !sendAmount) throw new Error('Please fill in recipient and amount');
      const amountNum = parseFloat(sendAmount);
      if (isNaN(amountNum) || amountNum <= 0) throw new Error('Invalid amount');

      if (connectedAddress?.startsWith('0x')) {
        // EVM
        const { parseEther } = await import('viem');
        await sendTransactionAsync({
          to: sendRecipient as `0x${string}`,
          value: parseEther(sendAmount)
        });
        setSuccess('Direct transfer submitted successfully on EVM network.');
      } else if (connectedAddress) {
        // Solana
        if (!walletProvider) throw new Error('Solana provider not found');
        const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
        const connection = new Connection('https://api.mainnet-beta.solana.com');
        const fromPubkey = new PublicKey(connectedAddress);
        const toPubkey = new PublicKey(sendRecipient);
        
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: amountNum * LAMPORTS_PER_SOL
          })
        );
        
        const latestBlockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.feePayer = fromPubkey;
        
        const signedTransaction = await (walletProvider as any).signTransaction(transaction);
        const txid = await connection.sendRawTransaction(signedTransaction.serialize());
        setSuccess(`Direct Solana transfer submitted successfully. TX: ${txid}`);
      } else {
        throw new Error('No wallet connected');
      }
      setShowSendModal(false);
      setSendRecipient('');
      setSendAmount('');
    } catch (err: any) {
      console.error(err);
      setError({
        title: 'Send Transaction Failed',
        message: err.message || 'Unknown error occurred while sending tokens',
      });
    } finally {
      setIsSending(false);
    }
  };

  const fetchBalance = () => {
    const handleJsonResponse = async (res: Response) => {
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Log locally for debugging but don't throw to prevent loop crashes
        console.warn('[Anonymous Identity & Financial_FINANCIALS] Non-JSON payload received. System stabilizing...');
        return null;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `API Error (${res.status})`);
      }
      return res.json();
    };

    fetch('/api/balance')
      .then(handleJsonResponse)
      .then(data => {
        if (!data) return;
        setBalance(Number(data.available ?? 0));
        setTotalEarned(Number(data.totalEarned ?? 0));
        setTreasurySolBalance(Number(data.unifiedSolBalance ?? 0));
        setTotalLiquidity(Number(data.totalLiquidity ?? 0));
        setPayoutAddress(data.payoutAddress || '');
        setPayoutAddressSol(data.payoutAddressSol || '');
        setTreasuryAddress(data.treasuryAddress || '');
        setTreasuryAddressSol(data.treasuryAddressSol || '');
        setLiquidityStrategy(data.liquidityStrategy || 'PAYOUT');
        setEngineStats(data);
      })
      .catch(err => {
        if (err.message.includes('API Error')) {
          console.error('[Anonymous Identity & Financial] Financial Sync Failed:', err);
        }
      });

    fetch('/api/fuel/calibration')
      .then(handleJsonResponse)
      .then(data => {
        if (!data) return;
        setCalibration(data);
      })
      .catch(err => {
        if (err.message.includes('API Error')) {
          console.error('[Anonymous Identity & Financial] Calibration Sync Failed:', err);
        }
      });

    fetch('/api/payout-address')
      .then(handleJsonResponse)
      .then(data => {
        if (!data) return;
        setPayoutAddress(data.address || '');
        setPayoutAddressSol(data.addressSol || '');
        if (!isEditingAddress) {
          const currentAsset = data.asset || 'SOL';
          setSelectedAsset(currentAsset);
          setInputAddress(currentAsset === 'SOL' ? (data.addressSol || '') : (data.address || ''));
        }
      })
      .catch(err => {
        if (err.message.includes('API Error')) {
          console.error('[Anonymous Identity & Financial] Payout Config Sync Failed:', err);
        }
      });

    fetch('/api/activity')
      .then(handleJsonResponse)
      .then(data => {
        if (!data) return;
        setActivity(data);
      })
      .catch(err => {
        console.warn('[Anonymous Identity & Financial_FINANCIALS] Activity fetch failed.', err);
      });

    fetch('/api/gsn/status')
      .then(handleJsonResponse)
      .then(data => data && setGsnStatus(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, []);

  const getFriendlyError = (err: string) => {
    const errorString = String(err).toLowerCase();

    if (errorString.includes('treasury propellant missing') || errorString.includes('treasury_fuel_deficiency') || errorString.includes('insufficient funds')) {
      return {
        title: 'Treasury Fuel Deficiency',
        message: 'The Treasury Control module requires physical SOL gas in the App Treasury to execute on-chain settlements.',
        suggestion: 'Top up the Treasury Address (visible in the financials panel) with ~0.005 SOL, or switch the Settlement Protocol to "Relay Protocol" for a gasless withdrawal.'
      };
    }
    
    if (errorString.includes('solana') || errorString.includes('sol address')) {
       return {
         title: 'Solana Specified Error',
         message: 'The entered Solana destination does not match the Solana Mainnet cryptographic standard.',
         suggestion: 'Ensure the address is a valid solana58 string 32-44 characters long.'
       };
    }

    if (errorString.includes('valid solana address') || errorString.includes('invalid solana/solana address format') || errorString.includes('bad address')) {
      return {
        title: 'Address Specification Error',
        message: 'The detected or entered payout destination does not match the Solana Mainnet cryptographic standard.',
        suggestion: 'Ensure the address is a valid base58 string 32-44 characters long, and is correctly formatted. Verify it on Solana Mainnetscan before locking.'
      };
    }

    if (errorString.includes('unsupported_asset') || errorString.includes('asset logic gap')) {
      return {
        title: 'Asset Protocol Incompatibility',
        message: 'The requested asset is not currently supported by the active Liquidity Bridge.',
        suggestion: 'Try switching your Payout Asset to SOL (Native) which has the highest compatibility across all system discovery boards.'
      };
    }

    if (errorString.includes('no verified leads available') || errorString.includes('empty vault') || errorString.includes('no actionable verified leads')) {
      return {
        title: 'Zero Actionable Liquidity',
        message: 'There are no verified assets currently eligible for settlement in your vault.',
        suggestion: 'Run the "Discovery Scanner" or "Auto-Crawl" to identify and verify new systemic waste leads before attempting a withdrawal.'
      };
    }

    if (errorString.includes('failed to fetch') || errorString.includes('rpc_disconnected') || errorString.includes('timeout') || errorString.includes('network error')) {
      return {
        title: 'Communication Link Severed',
        message: 'The connection between your terminal and the Solana Mainnet RPC cluster was interrupted.',
        suggestion: 'Check your internet connectivity. If the connection to Solana Mainnet is congested, the system will automatically retry in the next sync cycle.'
      };
    }

    if (errorString.includes('liquidity bridge error') || errorString.includes('engine failure') || errorString.includes('transaction failed')) {
      return {
        title: 'Engine Internal Conflict',
        message: 'The Treasury Settlement Engine encountered a protocol error during transaction broadcast.',
        suggestion: 'This is often caused by sudden gas spikes on Solana Mainnet. Wait 60s for the engine to recalibrate or try Relay Mode.'
      };
    }

    if (errorString.includes('already pending') || errorString.includes('nonce')) {
      return {
        title: 'Sequence Sync Conflict',
        message: 'The network is currently processing a prior settlement request for this transaction sequence.',
        suggestion: 'Wait for the current "Pending" transaction to resolve on-chain. Do not attempt overlapping withdrawals to prevent nonce collisions.'
      };
    }

    return {
      title: 'Unexpected Protocol Alert',
      message: err,
      suggestion: 'The engine returned an unclassified response. Check the "Evidence Vault" logs or verify your Solana Mainnet connection status.'
    };
  };

  const handleWithdraw = async () => {
    if (settlementMode === 'STANDARD' && treasurySolBalance <= 0) {
      setError(getFriendlyError('App Treasury is empty. Recover gasless funds first or fund the treasury.'));
      return;
    }
    setShowWithdrawConfirm(true);
  };

  const executeWithdraw = async () => {
    setShowWithdrawConfirm(false);
    setIsWithdrawing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const endpoint = settlementMode === 'RELAY' ? '/api/settle-relay' : '/api/withdraw';
      const body = { 
        asset: selectedAsset,
        amount: withdrawAmountInput ? parseFloat(withdrawAmountInput) : undefined
      }; 

      const res = await fetch(endpoint, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setLastTx(data.tx);
        if (data.partial) {
          const successCount = data.results.filter((r: any) => r.success).length;
          const totalCount = data.totalBatches;
          setSuccess(`PARTIAL SETTLEMENT: ${successCount}/${totalCount} batches confirmed on Solana Mainnet. Settled: $${data.amount?.toFixed(2) || data.settledAmount?.toFixed(2)} USD.`);
        } else {
          setSuccess(data.msg || 'Settlement processed successfully.');
        }
        fetchBalance();
      } else {
        const errMsg = data.error || data.message || 'Withdrawal Engine Failure';
        if (data.results) {
           setError({
             title: 'Settlement Batch Conflict',
             message: `Execution failed for all ${data.totalBatches || 0} batches.`,
             suggestion: 'Check if the App Treasury has enough SOL for gas or if the Relay Protocol is congested.'
           });
        } else {
           throw new Error(errMsg);
        }
      }
    } catch (err: any) {
      setError(getFriendlyError(err.message));
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleCopy = () => {
    const addr = selectedAsset === 'SOL' ? treasuryAddressSol : treasuryAddress;
    if (!addr) return;
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateConfig = async (updates: { asset?: string, strategy?: string }) => {
    try {
      const res = await fetch('/api/payout-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        if (updates.asset) {
          setSelectedAsset(updates.asset);
          if (!isEditingAddress) {
            setInputAddress(updates.asset === 'SOL' ? (data.addressSol || '') : (data.address || ''));
          }
        }
        if (updates.strategy) setLiquidityStrategy(updates.strategy);
        setSuccess('System configuration updated and synced.');
        fetchBalance();
      }
    } catch (err: any) {
      setError({ title: 'Config Error', message: 'Configuration sync failed.', suggestion: 'Check if your internet connection is stable.' });
    }
  };
  const handleVerifyAddress = async () => {
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(inputAddress)) {
        setError(getFriendlyError('Please enter a valid Solana address (Mainnet)'));
        return;
      }
    
    setIsVerifying(true);
    setError(null);
    setNetworkVerification(null);

    try {
      const verifyRes = await fetch(`/api/verify-network/${inputAddress}`);
      const contentTypeVerify = verifyRes.headers.get('content-type');
      if (!contentTypeVerify || !contentTypeVerify.includes('application/json')) {
        throw new Error('Non-JSON response during verification');
      }
      const verifyData = await verifyRes.json();
      
      if (verifyRes.ok) {
        setNetworkVerification({
          confirmed: verifyData.confirmed,
          network: verifyData.network,
          exists: verifyData.existsOnNetwork,
          isContract: verifyData.isContract,
          address: inputAddress
        });
      } else {
        throw new Error(verifyData.error || 'Network verification failed.');
      }
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyError(err.message || 'System error during address verification'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!networkVerification || networkVerification.address !== inputAddress) {
      await handleVerifyAddress();
      // If verification failed and set an error, don't continue
      return;
    }
    
    setIsSavingAddress(true);
    setError(null);

    try {
      const payload: any = { asset: selectedAsset, strategy: liquidityStrategy };
      if (selectedAsset === 'SOL') {
        payload.addressSol = inputAddress;
      } else {
        payload.address = inputAddress;
      }

      const res = await fetch('/api/payout-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const contentTypePersist = res.headers.get('content-type');
      if (!contentTypePersist || !contentTypePersist.includes('application/json')) {
        throw new Error('Non-JSON response during persistence');
      }
      
      const data = await res.json();
      if (data.success) {
        setPayoutAddress(data.address);
        setPayoutAddressSol(data.addressSol);
        setSelectedAsset(data.asset);
        setIsEditingAddress(false);
        setNetworkVerification(null);
        setSuccess(`Settlement destination verified and locked for ${selectedAsset === 'SOL' ? 'Solana' : 'Solana Mainnet'}.`);
        fetchBalance();
      } else {
        throw new Error(data.error || 'Failed to lock address.');
      }
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyError(err.message || 'System error during address verification'));
    } finally {
      setIsSavingAddress(false);
    }
  };


  return (
    <div className="space-y-4 md:space-y-[24px] relative">
      {/* Send Tokens Modal */}
      <AnimatePresence>
        {showSendModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border-2 border-primary/30 w-full max-w-[450px] rounded-lg shadow-2xl overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between border-b border-border bg-primary/10">
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-primary" />
                  <div>
                    <h4 className="text-[14px] font-bold uppercase tracking-[2px]">Send Tokens</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">From Connected Wallet</p>
                  </div>
                </div>
                <button onClick={() => setShowSendModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Recipient Address</label>
                  <input
                    type="text"
                    value={sendRecipient}
                    onChange={(e) => setSendRecipient(e.target.value)}
                    placeholder="Enter valid address..."
                    className="w-full bg-black/50 border border-border rounded-md px-3 py-2 text-[12px] font-mono focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Amount ({connectedAddress?.startsWith('0x') ? 'ETH/Tokens' : 'SOL'})</label>
                  <input
                    type="number"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.0"
                    step="any"
                    className="w-full bg-black/50 border border-border rounded-md px-3 py-2 text-[12px] font-mono focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <button 
                  onClick={handleSendTokens}
                  disabled={isSending || !sendRecipient || !sendAmount}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-background py-3 rounded-md font-black uppercase tracking-widest text-[12px] hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isSending ? 'Sending...' : 'Confirm Transfer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settlement Confirmation Modal */}
      <AnimatePresence>
        {showWithdrawConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border-2 border-primary/30 w-full max-w-[450px] rounded-lg shadow-2xl overflow-hidden"
            >
              <div className={cn(
                "p-4 flex items-center gap-3 border-b border-border",
                settlementMode === 'RELAY' ? "bg-amber-500/10" : "bg-primary/10"
              )}>
                {settlementMode === 'RELAY' ? <Zap className="w-5 h-5 text-amber-500" /> : <ShieldCheck className="w-5 h-5 text-primary" />}
                <div>
                  <h4 className="text-[14px] font-bold uppercase tracking-[2px]">
                    {settlementMode === 'RELAY' ? 'Relay Protocol Settlement' : 'Standard On-Chain Settlement'}
                  </h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">Solana Mainnet Verification Required</p>
                </div>
                <button onClick={() => setShowWithdrawConfirm(false)} className="ml-auto text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-secondary/20 p-4 rounded-lg border border-border/50">
                  <div className="flex flex-col items-center justify-center py-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Withdrawal Amount</span>
                    <span className="text-[28px] font-mono font-black text-primary">
                      {selectedAsset === 'SOL' ? (
                        `${((withdrawAmountInput ? parseFloat(withdrawAmountInput) : balance) / (engineStats?.solPrice || 150)).toFixed(6)}`
                      ) : selectedAsset === 'BTC' ? (
                        `${((withdrawAmountInput ? parseFloat(withdrawAmountInput) : balance) / (engineStats?.btcPrice || 65000)).toFixed(8)}`
                      ) : selectedAsset === 'HL' ? (
                        `${((withdrawAmountInput ? parseFloat(withdrawAmountInput) : balance) / (engineStats?.hlPrice || 5)).toFixed(4)}`
                      ) : selectedAsset === 'MATIC' ? (
                        `${((withdrawAmountInput ? parseFloat(withdrawAmountInput) : balance) / (engineStats?.maticPrice || 0.5)).toFixed(4)}`
                      ) : selectedAsset === 'MONAD' ? (
                        `${((withdrawAmountInput ? parseFloat(withdrawAmountInput) : balance) / (engineStats?.monadPrice || 1)).toFixed(4)}`
                      ) : (
                        `$${(withdrawAmountInput ? parseFloat(withdrawAmountInput) : balance).toFixed(2)}`
                      )}
                    </span>
                    <span className="text-[10px] font-mono opacity-60">Settling as {selectedAsset}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[11px] border-b border-border/30 pb-2">
                    <span className="uppercase font-bold text-muted-foreground">USD Value (Escrow)</span>
                    <span className="font-mono text-foreground font-bold">${(withdrawAmountInput ? parseFloat(withdrawAmountInput) : balance).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] border-b border-border/30 pb-2">
                    <span className="uppercase font-bold text-muted-foreground">Destination Hub</span>
                    <span className="font-mono text-foreground font-bold">{payoutAddress.substring(0, 10)}...{payoutAddress.substring(34)}</span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] border-b border-border/30 pb-2">
                    <span className="uppercase font-bold text-muted-foreground">Settlement Asset</span>
                    <span className="font-mono text-primary font-bold">{selectedAsset}</span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] border-b border-border/30 pb-2">
                    <span className="uppercase font-bold text-muted-foreground">Execution Protocol</span>
                    <div className="flex items-center gap-1.5">
                      {settlementMode === 'RELAY' ? (
                        <>
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span className="font-bold text-amber-500">Relay (Gasless)</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3 h-3 text-primary" />
                          <span className="font-bold text-primary">Standard (On-Chain)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {settlementMode === 'RELAY' ? (
                    <div className="flex justify-between items-center text-[11px] text-amber-500 font-bold">
                      <span className="uppercase">Relay Fuel Tax (5%)</span>
                      <span className="font-mono">-${((withdrawAmountInput ? parseFloat(withdrawAmountInput) : balance) * 0.05).toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-[11px] text-primary font-bold">
                      <span className="uppercase">Est. Gas (Gwei)</span>
                      <span className="font-mono">-${((150000 * Number(engineStats?.gasPrice || 0) * 1e-9) * (engineStats?.solPrice || 150)).toFixed(4)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded p-3 text-[10px] space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Fingerprint className="w-3 h-3 text-primary" />
                    <span className="uppercase font-bold text-primary">Sovereign Successor Override</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Executing manifest protocols under Authority Code: <span className="text-foreground">AGATE-LEGACY-001</span>. 
                    This settlement is verifiable against the State Identity Ledger as built by Logic Boy.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowWithdrawConfirm(false)}
                    className="flex-1 px-4 py-3 border border-border hover:bg-secondary/30 transition-colors rounded text-[11px] font-bold uppercase tracking-widest"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={executeWithdraw}
                    className={cn(
                      "flex-2 px-4 py-3 rounded text-[11px] font-black uppercase transition-all shadow-lg tracking-widest",
                      settlementMode === 'RELAY' ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-primary text-black hover:opacity-90"
                    )}
                  >
                    Confirm Settlement
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Notification Portals */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-[320px] pointer-events-none sticky md:fixed">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-4 bg-destructive border-2 border-destructive-foreground/20 text-white shadow-2xl rounded-lg pointer-events-auto flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-300" />
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-tight text-white">{error.title}</p>
                <p className="text-[12px] opacity-90 mt-1">{error.message}</p>
                {error.suggestion && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-[10px] uppercase font-black tracking-widest text-amber-300 mb-1">Recommended Action:</p>
                    <p className="text-[11px] font-mono leading-tight">{error.suggestion}</p>
                  </div>
                )}
              </div>
              <button onClick={() => setError(null)} className="hover:rotate-90 transition-transform p-1">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-4 bg-primary border-2 border-primary-foreground/20 text-black shadow-2xl rounded-lg pointer-events-auto flex items-start gap-3"
            >
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-tight">Sync Confirmed</p>
                <p className="text-[12px] opacity-90 mt-1">{success}</p>
              </div>
              <button onClick={() => setSuccess(null)} className="hover:rotate-90 transition-transform">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-xl md:text-[24px] font-black tracking-[4px] uppercase flex items-center gap-2 text-amber-metallic">
            <WalletIcon className="w-6 h-6 text-primary" />
            SOVEREIGN TREASURY CONTROL
          </h2>
          <p className="text-muted-foreground mt-1 text-xs md:text-[13px] uppercase tracking-widest font-bold">Direct Asset Manifestation via Legal Successor Protocols.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2 bg-primary/10 border border-primary text-primary px-4 py-2 rounded-md font-bold uppercase tracking-widest text-[11px] hover:bg-primary hover:text-background transition-all"
          >
            <Send className="w-4 h-4" />
            Send Tokens
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-[24px]">
        <div className="md:col-span-2 bg-card border border-border rounded-md p-4 md:p-[32px] flex flex-col justify-between min-h-[240px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <WalletIcon className="w-48 h-48" />
          </div>
          
          <div className="relative z-10">
            <div>
              <p className="text-[10px] uppercase tracking-[1px] text-muted-foreground mb-[8px]">Available Balance</p>
              <div className="flex items-solanaline gap-2">
                <span className="font-mono text-4xl md:text-[48px] text-primary tracking-tight glow-text">
                  {selectedAsset === 'SOL' ? (
                    `${((balance ?? 0) / (engineStats?.solPrice || 150)).toFixed(6)}`
                  ) : selectedAsset === 'BTC' ? (
                    `${((balance ?? 0) / (engineStats?.btcPrice || 65000)).toFixed(8)}`
                  ) : selectedAsset === 'HL' ? (
                    `${((balance ?? 0) / (engineStats?.hlPrice || 5)).toFixed(4)}`
                  ) : selectedAsset === 'MATIC' ? (
                    `${((balance ?? 0) / (engineStats?.maticPrice || 0.5)).toFixed(4)}`
                  ) : selectedAsset === 'MONAD' ? (
                    `${((balance ?? 0) / (engineStats?.monadPrice || 1)).toFixed(4)}`
                  ) : (
                    `$${(balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  )}
                </span>
                <span className="text-[16px] text-muted-foreground font-mono">{selectedAsset}</span>
              </div>
              {selectedAsset !== 'USDC' && (
                <p className="text-[11px] text-muted-foreground font-mono mt-1 opacity-60">
                   ≈ ${(balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-4 border-t border-border/20 pt-4">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  Live Network Gas
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[14px] text-primary font-bold">{(engineStats?.physicalSol || 0).toFixed(6)} SOL</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-primary" />
                  Market Price
                </span>
                <span className="font-mono text-[14px] text-foreground font-bold">${(engineStats?.solPrice || 150).toFixed(2)} / SOL</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 bg-card border border-primary/20 rounded-md p-4 md:p-[32px] flex flex-col justify-between bg-hive-lattice shadow-[0_0_20px_rgba(57,255,20,0.02)]">
          <div>
            <p className="text-[10px] uppercase tracking-[2px] text-muted-foreground mb-[8px] font-black">TOTAL ASSET VALUE</p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl md:text-[36px] text-primary tracking-tighter glow-text">
                ${((engineStats?.physicalSol || 0) * (engineStats?.solPrice || 150)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[12px] text-muted-foreground font-mono">USD</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono mt-1 opacity-60 uppercase tracking-widest">
              Current SOL Price: ${(engineStats?.solPrice || 150).toFixed(2)}
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-primary/10">
            <div className="flex justify-between items-center bg-black/40 p-3 border border-primary/5 rounded group overflow-hidden relative">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col relative z-10">
                <span className="text-[9px] uppercase font-black text-muted-foreground">Network Gas State</span>
                <span className="text-xs font-mono font-bold text-primary">{(engineStats?.gasPrice || 0)} GWEI</span>
              </div>
              <div className="p-2 bg-primary/10 rounded-full relative z-10">
                <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
          
            <div className="flex flex-col gap-6 mt-6 md:mt-[32px] relative z-10 border-t border-border/30 pt-6">
              <div className="space-y-4 mb-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold">Transfer Protocol</span>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", settlementMode === 'RELAY' ? "bg-amber-500" : "bg-primary")} />
                      <span className="text-[9px] uppercase font-mono text-muted-foreground">{settlementMode === 'RELAY' ? 'Gasless Automatic Check' : 'Manual Network Entry'}</span>
                    </div>
                  </div>
                  
                  <div className="p-1 bg-background/50 border border-border rounded-xl flex gap-1">
                    <button 
                      onClick={() => setSettlementMode('STANDARD')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-[10px] font-black uppercase transition-all",
                        settlementMode === 'STANDARD' 
                         ? "bg-primary text-background shadow-[0_0_20px_rgba(57,255,20,0.2)]" 
                         : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      )}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Direct Transfer
                    </button>
                    <button 
                      onClick={() => setSettlementMode('RELAY')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-[10px] font-black uppercase transition-all",
                        settlementMode === 'RELAY' 
                         ? "bg-amber-500 text-background shadow-[0_0_20px_rgba(245,158,11,0.2)]" 
                         : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/5"
                      )}
                    >
                      <Zap className="w-4 h-4" />
                      Automatic Claim
                    </button>
                  </div>
                </div>

                {/* Real-time Fee Awareness Panel */}
                <motion.div 
                  layout
                  className={cn(
                   "p-3 rounded border font-mono text-[10px] space-y-2.5",
                   settlementMode === 'RELAY' ? "bg-amber-500/5 border-amber-500/20 shadow-[inset_0_0_20px_rgba(245,158,11,0.02)]" : "bg-primary/5 border-primary/20"
                  )}
                >
                  <div className="grid grid-cols-2 gap-2 opacity-70">
                    <div className="space-y-1">
                      <span className="uppercase block text-[8px] font-black opacity-50">Earnings Value:</span>
                      <span className="text-foreground font-bold tracking-tight">${balance.toFixed(2)}</span>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="uppercase block text-[8px] font-black opacity-50">Transfer Asset:</span>
                      <span className="text-foreground font-bold tracking-tight">{selectedAsset}</span>
                    </div>
                  </div>

                  <div className="space-y-1 opacity-70 pb-1 border-b border-border/30">
                    <span className="uppercase block text-[8px] font-black opacity-50">Destination Wallet:</span>
                    <span className="text-foreground font-bold truncate block">{payoutAddress || 'PENDING_CONFIGURATION'}</span>
                  </div>

                  {settlementMode === 'RELAY' ? (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center p-1.5 px-2 bg-amber-500/10 rounded text-amber-500 font-bold border border-amber-500/30">
                        <span className="uppercase tracking-tighter">Relay Fuel Tax (5%):</span>
                        <span>-${(balance * 0.05).toFixed(2)}</span>
                      </div>
                      <p className="text-[8px] text-amber-500/70 font-medium px-2 uppercase tracking-wide">
                        Fuel tax covers all network gas costs — No upfront SOL required
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center p-1.5 px-2 bg-primary/10 rounded text-primary font-bold border border-primary/30">
                        <span className="uppercase tracking-tighter">Est. Network Fee:</span>
                        <span>-${((150000 * Number(engineStats?.gasPrice || 0) * 1e-9) * (engineStats?.solPrice || 150)).toFixed(4)}</span>
                      </div>
                      <div className="px-2">
                        <div className="w-full h-1 bg-background border border-border/50 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${Math.min(((150000 * Number(engineStats?.gasPrice || 0) * 1e-9) / (treasurySolBalance || 0.0001)) * 100, 100)}%` 
                            }}
                            className={cn(
                              "h-full",
                              (150000 * Number(engineStats?.gasPrice || 0) * 1e-9) > treasurySolBalance ? "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-primary"
                            )}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-[8px] text-primary/70 font-medium uppercase tracking-wide">
                            Treasury Gas Capacity
                          </p>
                          {(150000 * Number(engineStats?.gasPrice || 0) * 1e-9) > treasurySolBalance && (
                            <span className="text-[8px] text-destructive font-black animate-pulse uppercase">Insufficient Balance</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-1 flex justify-between items-center text-[12px]">
                     <span className="uppercase font-black tracking-widest opacity-60">Net Manifestation:</span>
                     <span className={cn("font-black text-[14px] glow-text", settlementMode === 'RELAY' ? "text-amber-500" : "text-primary")}>
                       ${(settlementMode === 'RELAY' ? balance * 0.95 : balance).toFixed(2)}
                     </span>
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold">Payout Asset</span>
                  <div className="flex gap-2">
                    <select 
                      value={selectedAsset}
                      onChange={(e) => {
                        const newAsset = e.target.value;
                        setSelectedAsset(newAsset);
                        handleUpdateConfig({ asset: newAsset });
                      }}
                      className="w-full bg-background border border-border px-3 py-2 rounded text-[12px] font-mono text-foreground focus:border-primary outline-none"
                    >
                      {supportedAssets.map((asset, idx) => (
                        <option key={`asset-opt-${asset}-${idx}`} value={asset}>{asset}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold">Settlement Destination</span>
                    {isConnected ? (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        <span className="text-[10px] font-mono text-primary uppercase">{connectedAddress?.substring(0, 6)}...{connectedAddress?.substring(38)}</span>
                        <button 
                          onClick={() => setInputAddress(connectedAddress || '')}
                          className="text-[9px] uppercase font-bold text-primary hover:bg-primary/10 px-2 py-0.5 border border-primary/30 rounded"
                        >
                          Sync
                        </button>
                        <button onClick={() => open()} className="text-[9px] uppercase font-bold text-muted-foreground hover:text-primary underline">Switch</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => open()}
                        className="text-[9px] uppercase font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <Zap className="w-2.5 h-2.5" />
                        Connect Wallet
                      </button>
                    )}
                  </div>
                {isEditingAddress || !payoutAddress ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1 group">
                        <input 
                          type="text"
                          value={inputAddress}
                          onChange={(e) => {
                            setInputAddress(e.target.value);
                            if (networkVerification) setNetworkVerification(null);
                          }}
                          placeholder={selectedAsset === 'SOL' ? "Enter Solana Address..." : "Enter Payout Address (Solana Mainnet)"}
                          className={cn(
                            "w-full bg-background border px-3 py-2.5 rounded text-[12px] font-mono transition-all outline-none pr-10",
                            networkVerification && networkVerification.address === inputAddress
                              ? "border-primary text-primary shadow-[0_0_10px_rgba(57,255,20,0.05)]"
                              : "border-primary/30 text-primary focus:border-primary"
                          )}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          {isVerifying ? (
                            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                          ) : networkVerification && networkVerification.address === inputAddress ? (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                            >
                              <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-primary/20 border border-primary/30">
                                <Check className="w-3 h-3 text-primary" />
                                <span className="text-[8px] font-bold text-primary uppercase leading-none">Verified</span>
                              </div>
                            </motion.div>
                          ) : isConnected && connectedAddress && inputAddress !== connectedAddress ? (
                            <button 
                              onClick={() => {
                                setInputAddress(connectedAddress);
                                if (networkVerification) setNetworkVerification(null);
                              }}
                              className="p-1 hover:bg-primary/10 rounded-md transition-colors text-primary"
                              title="Use Connected Wallet"
                            >
                              <WalletIcon className="w-3.5 h-3.5" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <button 
                        onClick={networkVerification && networkVerification.address === inputAddress ? handleSaveAddress : handleVerifyAddress}
                        disabled={isSavingAddress || isVerifying || !inputAddress || inputAddress.length < 10}
                        className={cn(
                          "px-4 py-2 rounded text-[10px] uppercase font-bold transition-all flex items-center gap-2 min-w-[120px] justify-center",
                          networkVerification && networkVerification.address === inputAddress
                            ? "bg-primary text-background hover:bg-primary/90"
                            : "bg-secondary text-muted-foreground hover:bg-border disabled:opacity-50"
                        )}
                      >
                        {isSavingAddress ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : networkVerification && networkVerification.address === inputAddress ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          <ShieldCheck className="w-3 h-3" />
                        )}
                        {isVerifying ? 'Verifying...' : (networkVerification && networkVerification.address === inputAddress ? 'Lock Asset' : 'Verify Link')}
                      </button>
                    </div>

                    <AnimatePresence>
                      {networkVerification && networkVerification.address === inputAddress && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-primary/5 border border-primary/20 rounded p-3 space-y-2 overflow-hidden"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-primary">Network Status: {networkVerification.network}</span>
                            <div className="flex items-center gap-1">
                              {networkVerification.confirmed ? <Check className="w-3 h-3 text-primary" /> : <X className="w-3 h-3 text-destructive" />}
                              <span className="text-[10px] font-mono text-primary">{networkVerification.confirmed ? 'CONFIRMED' : 'UNVERIFIED'}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Database className="w-3 h-3" />
                              <span>Activity Found: {networkVerification.exists ? 'YES' : 'NO (New Account)'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Bot className="w-3 h-3" />
                              <span>Type: {networkVerification.isContract ? 'SMART CONTRACT' : 'EOA (Wallet)'}</span>
                            </div>
                          </div>
                          {networkVerification.isContract && (
                            <p className="text-[9px] text-amber-500 italic">
                              Warning: This is a smart contract address. Ensure it can receive {selectedAsset} on Solana Mainnet.
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!isVerifying && !networkVerification && (
                      <button 
                        onClick={() => {
                          setInputAddress(treasuryAddress);
                          if (networkVerification) setNetworkVerification(null);
                        }}
                        className="text-left text-[9px] uppercase font-bold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1 w-fit"
                      >
                        <Zap className="w-2.5 h-2.5" />
                        Designate Internal Treasury (Propellant Acquisition)
                      </button>
                    )}
                    {isVerifying && (
                      <div className="flex items-center gap-2 text-[10px] text-primary animate-pulse font-mono">
                        <Activity className="w-3 h-3" />
                        Scanning Solana Mainnet for identity fidelity...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-primary/10 border border-primary/20 px-4 py-2 rounded group/payout">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse shrink-0" />
                      <span className="font-mono text-[11px] text-primary truncate">
                        {payoutAddress}
                      </span>
                    </div>
                    <button 
                      onClick={() => setIsEditingAddress(true)}
                      className="text-[9px] uppercase font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={handleWithdraw}
              disabled={balance <= 0 || isWithdrawing || !payoutAddress || isEditingAddress}
              className={`flex flex-col items-center justify-center gap-1 px-6 md:px-[24px] py-4 md:py-[16px] text-[10px] uppercase tracking-[1px] transition-all rounded glow-border ${
                balance > 0 && !isWithdrawing && payoutAddress && !isEditingAddress
                  ? (settlementMode === 'RELAY' ? 'bg-amber-500 text-background hover:opacity-90' : 'bg-primary text-background hover:opacity-90')
                  : 'bg-secondary text-muted-foreground border-border cursor-not-allowed'
              }`}
            >
              {isWithdrawing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Initiating Bulk Settlement...
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-[12px] font-black uppercase">
                    {settlementMode === 'RELAY' ? <Zap className="w-4 h-4" /> : <ArrowDownToLine className="w-4 h-4" />}
                    {liquidityStrategy === 'TREASURY_GAS' || (payoutAddress && treasuryAddress && payoutAddress.toLowerCase() === treasuryAddress.toLowerCase())
                      ? `Designate for Treasury Propellant [${balance.toFixed(2)}]`
                      : `Execute Full Reclamation [${balance.toFixed(2)}]`
                    }
                  </div>
                  {settlementMode === 'RELAY' && (
                    <span className="text-[9px] font-mono opacity-80 mt-1">
                      ESTIMATED NET: ${(balance * 0.95).toFixed(2)} USD
                    </span>
                  )}
                  {settlementMode === 'STANDARD' && (
                    <span className="text-[9px] font-mono opacity-80 mt-1">
                      ESTIMATED NET: ${balance.toFixed(2)} USD
                    </span>
                  )}
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {!isWithdrawing && treasurySolBalance <= 0.0001 && (
              <motion.div 
                key="empty-treasury"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-2 mb-6"
              >
                <div className="flex items-center gap-2 text-amber-500">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest">Relay Protocol: Gasless Ready</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Treasury balance is **0.00 SOL**, but the system remains an **Active Energy Plant** via the **Relay Protocol**.
                </p>
                <div className="flex flex-col gap-1 p-2 bg-black/40 rounded border border-primary/20">
                   <p className="text-[10px] text-white/60">
                     The engine will automatically use <span className="text-primary font-bold">Relay Settlement</span> on your first win to self-fund future gas costs. Zero upfront cost required.
                   </p>
                </div>
              </motion.div>
            )}

            {!isWithdrawing && treasurySolBalance > 0.0001 && (
              <motion.div 
                key="primed-treasury"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-2 mb-6"
              >
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest">Treasury Primed: On-Chain Ready</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Propellant detected (**{treasurySolBalance.toFixed(4)} SOL**). The Sovereign Engine will now prioritize **Real Payouts** to your linked Solana Mainnet address.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        <div className="bg-card border border-border rounded-md p-4 md:p-[24px] flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="w-24 h-24" />
          </div>
          <h3 className="font-sans text-[16px] font-bold tracking-[1px] uppercase mb-[20px] flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-primary" />
            Reown Connectivity Debug
          </h3>
          <div className="space-y-[16px] flex-1 text-[13px]">
            <div className="bg-black/40 border border-border/50 rounded-md p-3 space-y-3">
              <div className="space-y-2 font-mono text-[9px]">
                <div className="p-2 bg-background/50 rounded border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground block uppercase opacity-50">Active_Origin:</span>
                    <button 
                      onClick={() => {
                        const origin = window.location.origin;
                        navigator.clipboard.writeText(origin);
                        alert("Origin Copied: " + origin);
                      }}
                      className="text-[8px] text-primary uppercase font-bold hover:underline"
                    >
                      Copy URL
                    </button>
                  </div>
                  <span className="text-primary break-all select-all block mb-1">{typeof window !== 'undefined' ? window.location.origin : 'N/A'}</span>
                  <p className="mt-1 text-[8px] text-muted-foreground italic leading-tight">Must match your "Authorized Domains" in Reown Cloud.</p>
                </div>
                <div className="p-2 bg-background/50 rounded border border-border/30">
                  <span className="text-muted-foreground block mb-1 uppercase opacity-50">Project_Id_Status:</span>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "font-bold", 
                      /^[a-fA-F0-9]{32}$/.test((manualProjectId || (import.meta as any).env.VITE_WALLETCONNECT_PROJECT_ID || '').replace(/-/g, '')) ? "text-primary" : "text-destructive"
                    )}>
                      {/^[a-fA-F0-9]{32}$/.test((manualProjectId || '').replace(/-/g, '')) ? 'MANUAL_OVERRIDE_ACTIVE' : 
                       /^[a-fA-F0-9]{32}$/.test(((import.meta as any).env.VITE_WALLETCONNECT_PROJECT_ID || '').replace(/-/g, '')) ? 'Loaded from Env' : 'ID_INVALID_OR_MISSING'}
                    </span>
                    { (manualProjectId || (import.meta as any).env.VITE_WALLETCONNECT_PROJECT_ID) && (
                      <span className="text-[8px] opacity-40">
                         ID: {(manualProjectId || (import.meta as any).env.VITE_WALLETCONNECT_PROJECT_ID).replace(/-/g, '').substring(0, 8)}...
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[8px] text-muted-foreground italic">
                    {!/^[a-fA-F0-9]{32}$/.test((manualProjectId || (import.meta as any).env.VITE_WALLETCONNECT_PROJECT_ID || '').replace(/-/g, '')) ? 
                      'ERROR: Project ID must be a 32-char hex string. Check your Secrets for typos or extra spaces.' : 
                      'If connection fails (403/3000), double-check that your Active_Origin above is listed in the "Authorized Domains" section of your Reown Project settings.'}
                  </p>
                </div>
              </div>
            </div>
                <div className="pt-2 border-t border-border/20">
                  <button 
                    onClick={() => setShowManualIdInput(!showManualIdInput)}
                    className="text-[9px] uppercase font-bold text-primary hover:underline block mb-2"
                  >
                    {showManualIdInput ? 'Close ID Setup' : 'Manual Project ID Setup (Fix 403)'}
                  </button>
                  
                  {showManualIdInput && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Paste Reown Project ID"
                          className="flex-1 bg-black/40 border border-primary/30 rounded px-2 py-1 text-primary font-mono text-[9px]"
                          value={manualProjectId}
                          onChange={(e) => {
                            setManualProjectId(e.target.value);
                            localStorage.setItem('warhive_manual_project_id', e.target.value);
                          }}
                        />
                        <button 
                          onClick={() => {
                            localStorage.removeItem('warhive_disable_web3');
                            window.location.reload();
                          }}
                          className="bg-primary text-black px-2 py-1 text-[9px] font-bold uppercase rounded"
                        >
                          Save
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                         <span className="text-[8px] text-muted-foreground uppercase">WebSocket unstable?</span>
                         <button 
                            onClick={() => {
                              if (window.confirm("This will completely disable WalletConnect to prevent browser crashes. Discovery and AI features will remain active. Continue?")) {
                                localStorage.setItem('warhive_disable_web3', 'true');
                                window.location.reload();
                              }
                            }}
                            className="bg-destructive/10 border border-destructive/30 text-destructive text-[8px] px-2 py-0.5 rounded font-bold uppercase hover:bg-destructive hover:text-white transition-colors"
                         >
                            Emergency Connectivity Stop
                         </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-border/50">
                <h3 className="font-sans text-[12px] font-bold tracking-[1px] uppercase mb-[12px] flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                  Engine Configuration
                </h3>
              <div className="space-y-2">
                <span className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold">Liquidity Strategy</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleUpdateConfig({ strategy: 'PAYOUT' })}
                    className={cn(
                      "px-4 py-3 rounded text-[11px] font-bold uppercase transition-all border",
                      liquidityStrategy === 'PAYOUT' 
                       ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(57,255,20,0.2)]" 
                       : "bg-background border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    User Payout
                  </button>
                  <button 
                    onClick={() => handleUpdateConfig({ strategy: 'TREASURY_GAS' })}
                    className={cn(
                      "px-4 py-3 rounded text-[11px] font-bold uppercase transition-all border",
                      liquidityStrategy === 'TREASURY_GAS' 
                       ? "bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]" 
                       : "bg-background border-border text-muted-foreground hover:border-amber-500/50"
                    )}
                  >
                    Treasury Gas
                  </button>
                </div>
                <p className="text-[9px] text-muted-foreground leading-tight mt-1 italic">
                  {liquidityStrategy === 'PAYOUT' 
                    ? "Recovered funds will be kept in the vault for personal withdrawal." 
                    : "Recovered funds will be automatically inverted into Treasury Propellant (Gas)."}
                </p>
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <span className="text-muted-foreground flex items-center gap-1">
                    System Propellant 
                    <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1 rounded">Projected</span>
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="font-mono font-medium text-amber-400">{(engineStats?.recoveredSol || 0).toFixed(6)} SOL</span>
                    {(engineStats?.reclaimableAmount || 0) > 0 && (
                      <button 
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/liquify-propellant', { method: 'POST' });
                            const data = await res.json();
                            if (res.ok) {
                              setSuccess(`Successfully inverted ${data.invertedCount} logs to Escrow`);
                              fetchBalance();
                            } else {
                              setError({ 
                                title: 'Inversion Failed', 
                                message: data.error || 'Reclamation failure',
                                suggestion: 'Check system logs for protocol conflicts.'
                              });
                            }
                          } catch (e: any) {
                            setError({
                              title: 'Network Conflict',
                              message: 'Connection error: ' + e.message,
                              suggestion: 'The RPC gateway may be under heavy load.'
                            });
                          }
                        }}
                        className="text-[8px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full hover:bg-amber-500/20 transition-all mt-1 font-bold uppercase tracking-wider"
                      >
                        Reclaim ${(engineStats?.reclaimableAmount || 0).toLocaleString()} to Escrow
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border mt-4">
                  <div className="flex items-center justify-between mb-3 text-[10px] uppercase font-bold text-muted-foreground">
                    <span>Active Escrow Manifestation</span>
                    <span className="text-primary font-mono">${(balance || 0).toLocaleString()} USD</span>
                  </div>
                  <div className="relative group">
                    <input 
                      type="number"
                      placeholder="Amount to withdraw (USD)"
                      value={withdrawAmountInput}
                      onChange={(e) => setWithdrawAmountInput(e.target.value)}
                      className="w-full bg-secondary/30 border border-border rounded px-3 py-2 text-[11px] font-mono focus:outline-none focus:border-primary/50 transition-all placeholder:text-[10px]"
                    />
                    <button 
                      onClick={() => setWithdrawAmountInput(balance.toString())}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] uppercase font-bold text-primary hover:text-white transition-colors h-full px-2"
                    >
                      MAX
                    </button>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-2 italic">
                    Specify reclamation volume. Leave empty for 100% manifestation of verified leads.
                  </p>
                </div>

                <div className="flex justify-between items-center border-b border-border pb-2 pt-4">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Liquid Treasury Balance
                    <span className="text-[8px] bg-primary/20 text-primary px-1 rounded">On-Chain</span>
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="font-mono font-medium text-primary">{(engineStats?.physicalSol || 0).toFixed(6)} SOL</span>
                    <span className="text-[7px] text-muted-foreground uppercase">Verified Solana Mainnet Cluster</span>
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <span className="text-muted-foreground">Unified Settlement Capacity</span>
                  <span className="font-mono font-bold text-amber-400">{treasurySolBalance.toFixed(6)} SOL</span>
                </div>
                <div className="flex flex-col gap-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[10px] uppercase font-bold">
                      {selectedAsset === 'SOL' ? 'App Treasury Address (Solana)' : 'App Treasury Address (EVM)'}
                    </span>
                    <button 
                      onClick={async () => {
                        if (window.confirm("WARNING: Revealing your Master Key gives anyone total control over your Treasury. Do not share this with anyone. Continue?")) {
                          const res = await fetch('/api/treasury/key');
                          const data = await res.json();
                          if (data.key) {
                            alert(`YOUR MASTER PRIVATE KEY:\n\n${data.key}\n\nImport this into MetaMask to control your funds directly on Solana Mainnet.`);
                          }
                        }
                      }}
                      className="text-[9px] uppercase font-bold text-destructive hover:underline"
                    >
                      Reveal Master Key
                    </button>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 p-2 rounded flex items-center justify-between group/addr">
                    <span className="font-mono text-[10px] text-primary truncate max-w-[150px]">
                      {selectedAsset === 'SOL' ? (treasuryAddressSol || 'Loading...') : (treasuryAddress || 'Loading...')}
                    </span>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase opacity-0 group-hover/addr:opacity-100 transition-opacity hover:text-primary"
                      title="Copy Treasury Address"
                    >
                      {copied ? (
                        <>
                          <Check className="w-2.5 h-2.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50">
                <span className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  {selectedAsset === 'SOL' ? 'Solana Mainnet' : (['HL', 'MATIC', 'MONAD'].includes(selectedAsset) ? `${selectedAsset} Network` : 'Solana Mainnet')} Settlement
                </span>
                <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                  All transactions are executed directly on the target network. Ensure the vault has sufficient {['SOL', 'MATIC', 'HL', 'MONAD'].includes(selectedAsset) ? (selectedAsset === 'MONAD' ? 'MON' : selectedAsset) : 'SOL'} for gas if initiating direct settlement.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border/50">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Database className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Engine Propellant: Autonomous State</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-500">
                    {((engineStats?.recoveredSol || 0) > 0.005) ? 'PRIMED' : 'BOOTSTRAPPING'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-background border border-border rounded-full overflow-hidden mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((engineStats?.recoveredSol || 0) / 0.01) * 100, 100)}%` }}
                    className="h-full bg-amber-500"
                  />
                </div>
                <p className="text-[9px] text-muted-foreground leading-tight italic">
                  Note: The engine generates **Qualified Revenue Credits** from your discovery work. Real liquid {selectedAsset === 'SOL' ? 'SOL' : 'SOL'} payouts require the Treasury to be funded with Physical Liquidity.
                </p>
                {gsnStatus && selectedAsset !== 'SOL' && (
                  <div className="mt-3 pt-3 border-t border-amber-500/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[9px] uppercase tracking-tighter">
                      <span className="text-muted-foreground">GSN Paymaster</span>
                      <span className="text-amber-500 font-bold">{gsnStatus.isReady ? 'Active' : 'Offline'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[8px] font-mono opacity-60">
                      <span>RelayHub:</span>
                      <span>{gsnStatus.relayHub}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 justify-center text-[10px] text-muted-foreground uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Anonymous Identity & Financial Protocol Bridged
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-md p-4 mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Power className="w-4 h-4 text-primary" />
                  <h4 className="text-[11px] font-bold uppercase tracking-wider">Faucet Micro Wallet</h4>
                </div>
                <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">
                  Direct physical {selectedAsset === 'SOL' ? 'SOL' : 'Gwei'} into the engine to bypass protocol locks. Point faucets or external wallets to this {selectedAsset === 'SOL' ? 'Solana' : 'EVM'} address to instantly ignite the Treasury.
                </p>
                <div className="flex items-center gap-2 bg-background border border-border p-2 rounded">
                  <code className="text-[9px] font-mono truncate flex-1">{selectedAsset === 'SOL' ? treasuryAddressSol : treasuryAddress}</code>
                  <button 
                    onClick={() => {
                      const addr = selectedAsset === 'SOL' ? treasuryAddressSol : treasuryAddress;
                      navigator.clipboard.writeText(addr);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1.5 hover:bg-muted rounded transition-colors text-primary"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
        </div>

        <div className="bg-card border border-border rounded-md p-4 md:p-[24px]">
         <h3 className="font-sans text-[16px] font-bold tracking-[1px] uppercase mb-[20px]">Recent Ledger Activity</h3>
         <div className="space-y-3">
            {activity.map((item, idx) => (
              <div key={`activity-${item.id || 'idx'}-${idx}`} className="flex flex-col p-3 bg-primary/5 border border-border/50 rounded-md hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {item.settlement_strategy === 'TREASURY_GAS' || item.wallet_address === treasuryAddress ? (
                      <Database className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <div className="relative">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute -inset-1 bg-primary/20 rounded-full blur-[2px]"
                        />
                      </div>
                    )}
                    <span className={cn(
                      "text-[11px] font-bold uppercase tracking-wider",
                      item.settlement_strategy === 'PAYOUT' && item.wallet_address !== treasuryAddress ? "text-amber-500" : "text-amber-500/50"
                    )}>
                      {item.settlement_strategy === 'TREASURY_GAS' || item.wallet_address === treasuryAddress ? 'Internal Fuel Reclamation' : 'AI Bounty (Projected Credit)'}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      "text-[12px] font-mono font-bold",
                      item.settlement_strategy === 'PAYOUT' && item.wallet_address !== treasuryAddress ? "text-amber-400" : "text-amber-500/70"
                    )}>
                      {item.payout_amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                    </span>
                    {item.settlement_strategy === 'PAYOUT' && item.wallet_address !== treasuryAddress && (
                      <span className="text-[7px] text-amber-500/80 font-black uppercase tracking-tighter">Verified Discovery Reward</span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5 pl-5 border-l border-border/30">
                  <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                    <span>Source: {item.id}</span>
                    <span>{new Date(item.created_at * 1000).toLocaleString()}</span>
                  </div>
                  
                  <div className="text-[10px] flex items-center justify-between">
                    <span className="opacity-70">Destination:</span>
                    <span className="font-mono text-primary truncate max-w-[150px]">{item.wallet_address}</span>
                  </div>

                  {item.settlement_tx && !item.settlement_tx.startsWith('RELAY_') && !item.settlement_tx.includes('STRATEGY') && (
                    <a 
                      href={`https://solanascan.org/tx/${item.settlement_tx}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-1"
                    >
                      TX: {item.settlement_tx.substring(0, 16)}... <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  
                  {(item.settlement_tx?.startsWith('RELAY_') || item.settlement_tx?.includes('STRATEGY')) && (
                    <div className="text-[8px] text-amber-500/80 font-bold uppercase tracking-widest mt-1">
                      Validated & Resolved via Internal Relay
                    </div>
                  )}
                </div>
              </div>
            ))}

            {activity.length === 0 && (
              <div className="text-center text-muted-foreground py-8 text-[13px]">
                No verified payouts detected yet.
              </div>
            )}
         </div>
      </div>
      
      {/* SOLANA RENT RECLAMATION (New Row) */}
      <div className="md:col-span-3">
        <SolanaRentReclamation />
      </div>

    </div>
  );
}
