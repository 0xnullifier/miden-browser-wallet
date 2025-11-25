"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { X, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useMidenSdkStore } from "@/providers/sdk-provider";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../ui/button";

export const ReceiveCard = ({ onClose }: { onClose?: () => void }) => {
  const [copied, setCopied] = useState(false);

  const walletAddress = useMidenSdkStore((state) => state.account);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("Wallet address copied!");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy address");
    }
  };

  return (
    <div className="w-full font-geist">
      <Card className="rounded-[5px] py-0 border gap-4">
        <CardHeader className="bg-[#F9F9F9] py-[7px] border-b-[0.5px] flex items-center justify-center">
          <div className="text-center text-sm font-medium">Receive</div>
        </CardHeader>
        <CardContent className="space-y-6 px-0">
          {/* QR Code */}
          <div className="flex justify-center ">
            <div className="p-4 bg-white border border-gray-200">
              <div className="w-40 h-40 bg-white flex items-center justify-center ">
                <QRCodeSVG
                  value={walletAddress}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3 border-t-[0.5px] py-6 px-6">
            <div className="flex items-center gap-1 justify-center">
              <code className="flex-1 text-sm">{walletAddress}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="hover:text-primary shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" color="#FF5500" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
