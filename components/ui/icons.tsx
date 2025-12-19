export function FaucetSvg({
  className,
  active,
}: {
  active: boolean;
  className?: string;
}) {
  const src = active ? "/icons/faucet-active.svg" : "/icons/faucet.svg";
  return (
    <img src={src} alt="Faucet" width={60} height={60} className={className} />
  );
}

export function ReceiveSvg({
  className,
  active,
}: {
  active: boolean;
  className?: string;
}) {
  const src = active ? "/icons/receive-active.svg" : "/icons/receive.svg";
  return (
    <img src={src} alt="Receive" width={60} height={60} className={className} />
  );
}

export function SendSvg({
  className,
  active,
}: {
  active: boolean;
  className?: string;
}) {
  const src = active ? "/icons/send-active.svg" : "/icons/send.svg";
  return (
    <img src={src} alt="Send" width={60} height={60} className={className} />
  );
}

export function ActivtySvg({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  const src = active ? "/icons/activity-active.svg" : "/icons/activity.svg";
  return (
    <img
      src={src}
      alt="Activity"
      width={60}
      height={60}
      className={className}
    />
  );
}
