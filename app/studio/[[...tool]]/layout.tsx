import "@/app/globals.css";

export const metadata = {
  title: "Lagos Liquor Studio",
  description: "Content management for Lagos Liquor",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
