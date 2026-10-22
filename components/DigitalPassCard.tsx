"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Share2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { UserProfile } from "@/lib/types";

interface DigitalPassCardProps {
  member: UserProfile;
  compact?: boolean;
}

export default function DigitalPassCard({ member, compact = false }: DigitalPassCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate secure QR payload without exposing personal phone or secret credentials
    const payload = JSON.stringify({
      org: "DATIN-Data2Innovate",
      mid: member.membershipId,
      sub: member.id,
      iat: member.joinedAt,
      ver: "v1.0",
    });

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 1,
      color: {
        dark: "#141414",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code Error:", err));
  }, [member]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `DATIN Member Pass — ${member.name}`,
          text: `Official DATIN Digital Membership Pass for ${member.name} (${member.membershipId})`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="border-2 border-nirmaan-black rounded-3xl p-4 sm:p-7 bg-[#f7f3ea] text-nirmaan-black shadow-md flex flex-col justify-between">
      <div>
        {/* Pass Top Branding */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <div className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight flex items-baseline">
              datin<span className="text-nirmaan-red font-black text-2xl sm:text-3xl leading-none">.</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
              OFFICIAL MEMBER PASS
            </p>
          </div>
          <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-[10px] font-black border border-nirmaan-black/20 shrink-0">
            ACTIVE MEMBER
          </span>
        </div>

        {/* Member Details */}
        <div className="space-y-1.5 sm:space-y-2 mb-5">
          <h2 className="font-display text-xl sm:text-3xl font-black uppercase text-nirmaan-black leading-tight break-words">
            {member.name}
          </h2>
          <p className="text-xs font-semibold text-neutral-600">
            {member.department}
          </p>

          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-full bg-nirmaan-blue/10 text-nirmaan-blue text-[10px] sm:text-[11px] font-bold border border-nirmaan-blue/20">
              {member.domain}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-neutral-200/80 text-neutral-700 text-[10px] sm:text-[11px] font-extrabold uppercase">
              ID: {member.membershipId}
            </span>
          </div>
        </div>

        {/* QR Code Frame */}
        <div className="bg-white rounded-2xl p-3 sm:p-5 border border-nirmaan-black/15 shadow-xs text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-nirmaan-green-dark border border-green-200 text-[10px] font-extrabold uppercase mb-2 sm:mb-3">
            <span className="live-dot" />
            OFFICIAL DIGITAL PASS
          </div>

          <div className="relative w-40 h-40 sm:w-56 sm:h-56 bg-white flex items-center justify-center p-2 rounded-xl">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Pass for ${member.name}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-400">
                Generating QR...
              </div>
            )}
          </div>

          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-neutral-400 mt-2">
            SCAN FOR ON-DESK CHECK-IN & WORKSHOPS
          </p>
        </div>

        {/* Important Advisory Callout */}
        <div className="bg-nirmaan-amber/15 border border-nirmaan-amber/30 rounded-2xl p-3 sm:p-3.5 mt-3 sm:mt-4 text-[11px] text-neutral-800 leading-relaxed font-medium">
          <strong className="font-black text-nirmaan-black uppercase mr-1">Important:</strong>
          Show this official QR Pass on event day at the venue desk for registration, session check-in, and voting.
        </div>
      </div>

      {/* Action Buttons */}
      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mt-4 sm:mt-5 no-print">
          <button
            onClick={handleDownload}
            className="nirmaan-btn nirmaan-btn-dark text-xs py-3 px-4 font-bold flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-nirmaan-amber shrink-0" />
            <span>SAVE / PRINT PASS</span>
          </button>
          <button
            onClick={handleShare}
            className="nirmaan-btn nirmaan-btn-primary text-xs py-3 px-4 font-bold flex items-center justify-center gap-2"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Share2 className="w-4 h-4 shrink-0" />}
            <span>{copied ? "LINK COPIED!" : "SHARE PASS"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
