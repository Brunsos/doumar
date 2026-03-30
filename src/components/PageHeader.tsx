interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="bg-navy text-white py-14 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-light tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-lg text-white/70 font-light">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
