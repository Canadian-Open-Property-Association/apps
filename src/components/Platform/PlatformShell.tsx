import PlatformBar from './PlatformBar';

interface PlatformShellProps {
  children: React.ReactNode;
  appName?: string;
  appIcon?: React.ReactNode;
}

export default function PlatformShell({ children, appName, appIcon }: PlatformShellProps) {
  return (
    <div className="flex flex-col h-screen">
      <PlatformBar appName={appName} appIcon={appIcon} />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
