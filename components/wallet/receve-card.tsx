"use client";


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { X, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useMidenSdkStore } from '@/providers/sdk-provider';

export const ReceiveCard = ({ onClose }: { onClose?: () => void }) => {
    const [copied, setCopied] = useState(false);

    const walletAddress = useMidenSdkStore((state) => state.account);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            toast.success('Wallet address copied!');
            setTimeout(() => setCopied(false), 1500);
        } catch {
            toast.error('Failed to copy address');
        }
    };

    return (
        <div className="w-full">
            <Card className="bg-card border-border shadow-lg shadow-primary/20 ring-1 ring-primary/10">
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center space-y-2">
                        <span
                            className="cursor-pointer font-mono text-sm bg-muted px-3 py-2 rounded flex items-center gap-2 relative"
                            onClick={handleCopy}
                            title="Copy wallet address"
                        >
                            {walletAddress}
                            <span className="relative flex items-center">
                                <Copy className="h-4 w-4" />
                                {copied && (
                                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-primary bg-background px-1 rounded shadow">
                                        Copied!
                                    </span>
                                )}
                            </span>
                        </span>
                        <p className="text-base text-muted-foreground text-center mt-4">
                            Payment receiving features coming soon.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
