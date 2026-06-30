import FlowPageTransition from '@/components/features/FlowPageTransition';

export default function FlowLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <FlowPageTransition>{children}</FlowPageTransition>;
}
