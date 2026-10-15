import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, ShieldCheck, ShieldAlert, Cpu, Bot, Check, FileWarning, Search, X, Crosshair } from 'lucide-react';
import { cn } from '../lib/utils';

interface EvidencePack {
  id: string;
  filename: string;
  verified: boolean;
  tags: string[];
  metadata: any;
  timestamp: Date;
}

export function Warden() {
  const [isScanning, setIsScanning] = useState(false);
  const [evidencePacks, setEvidencePacks] = useState<EvidencePack[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsScanning(true);

    // Simulate C2PA Metadata Extraction and Security check
    setTimeout(() => {
      setIsScanning(false);
      
      // We simulate checking for a "Master Secret signature"
      // Since it's uploaded by the user, we will likely mock it as missing or forged to demonstrate functionality.
      // We could use file size or name to randomize it for demo purposes
      const isVerified = Math.random() > 0.5;
      
      const newEvidence: EvidencePack = {
        id: `EVID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        filename: file.name,
        verified: isVerified,
        tags: isVerified ? ['C2PA Verified', 'Authentic Output'] : ['C2PA Forgery', 'Missing Master Signature', 'Generated Content'],
        metadata: {
          size: file.size,
          lastModified: file.lastModified,
          contentTypes: file.type
        },
        timestamp: new Date()
      };

      setEvidencePacks(prev => [newEvidence, ...prev]);
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="p-4 md:p-[32px] bg-card border border-border rounded-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldAlert className="w-32 h-32" />
        </div>
        <div className="relative z-10 space-y-2">
          <h2 className="font-sans text-[24px] md:text-[32px] font-black tracking-[1px] uppercase flex items-center gap-3">
            <Crosshair className="w-6 h-6 text-primary" />
            WARDEN PROTOCOL
          </h2>
          <p className="text-muted-foreground mt-1 text-xs md:text-[13px] uppercase tracking-widest font-bold">
            Autonomous C2PA Metadata Forensics & Signature Verification
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-md p-6 flex flex-col">
          <h3 className="font-sans text-[16px] font-bold tracking-[1px] uppercase mb-[20px] flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            Asset Interrogation
          </h3>
          
          <div 
            className={cn(
              "flex-1 border-2 border-dashed rounded-lg flex items-center justify-center p-8 transition-all relative overflow-hidden min-h-[300px]",
              isScanning ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
            )}
            onClick={() => !isScanning && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />
            
            <AnimatePresence mode="wait">
              {isScanning ? (
                  <motion.div 
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center space-y-4"
                  >
                    {previewImage && (
                      <div className="absolute inset-0 opacity-20">
                        <img src={previewImage} alt="Scanning" className="w-full h-full object-cover grayscale" />
                        <div className="absolute inset-0 border-[4px] border-primary/50 animate-pulse" />
                        <motion.div 
                          initial={{ top: 0 }}
                          animate={{ top: '100%' }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="absolute w-full h-1 bg-primary shadow-[0_0_15px_#39ff14]"
                        />
                      </div>
                    )}
                    <Cpu className="w-12 h-12 text-primary animate-pulse relative z-10" />
                    <div className="space-y-1 relative z-10">
                      <p className="font-mono text-[12px] text-primary uppercase font-bold tracking-widest">
                        Deconstructing Metadata Fragments...
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase opacity-70">
                        Verifying Master Secret Signature
                      </p>
                    </div>
                  </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  <div className="p-4 bg-background rounded-full border border-border">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold uppercase tracking-wider">Deploy Target Asset</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Upload an image to interrogate C2PA signatures.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="bg-card border border-border rounded-md p-6 flex flex-col max-h-[600px]">
          <h3 className="font-sans text-[16px] font-bold tracking-[1px] uppercase mb-[20px] flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-primary" />
            Evidence Vault
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            <AnimatePresence>
              {evidencePacks.map((pack) => (
                <motion.div 
                  key={pack.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-background border border-border rounded-md group hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-mono text-[10px] text-primary block mb-1">
                        {pack.id} <span className="opacity-50">|</span> {pack.timestamp.toLocaleTimeString()}
                      </span>
                      <p className="text-[12px] font-bold uppercase tracking-wide truncate max-w-[200px]">
                        {pack.filename}
                      </p>
                    </div>
                    {pack.verified ? (
                      <div className="p-1 px-2 bg-primary/10 text-primary border border-primary/20 rounded flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span className="text-[9px] font-mono font-bold uppercase">Authentic</span>
                      </div>
                    ) : (
                      <div className="p-1 px-2 bg-destructive/10 text-destructive border border-destructive/20 rounded flex items-center gap-1 animate-pulse">
                        <ShieldAlert className="w-3 h-3" />
                        <span className="text-[9px] font-mono font-bold uppercase">Forgery</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {pack.tags.map(tag => (
                        <span 
                          key={tag} 
                          className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                            tag === 'C2PA Forgery' 
                              ? "bg-destructive text-white" 
                              : tag === 'Missing Master Signature' 
                                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" 
                                : "bg-primary/20 text-primary border border-primary/30"
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {!pack.verified && (
                      <div className="mt-2 p-2 bg-destructive/5 border border-destructive/20 rounded text-[9px] font-mono text-destructive tracking-widest leading-relaxed">
                        <span className="block opacity-70 mb-1">C2PA_ERROR: [HASH_MISMATCH_OR_MISSING]</span>
                        The target image has been flagged as a non-sovereign entity. It lacks the Agate Genesis signature. Added to systemic waste pipeline.
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {evidencePacks.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50 py-12">
                  <Bot className="w-8 h-8 text-muted-foreground" />
                  <p className="text-[12px] uppercase font-bold tracking-widest">Vault Empty</p>
                  <p className="text-[10px] text-muted-foreground">Awaiting target uploads for forensic verification.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
