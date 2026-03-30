interface ServiceCardProps {
  title: string;
  description: string;
}

export default function ServiceCard({ title, description }: ServiceCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <h3 className="text-xl font-semibold text-navy mb-3">{title}</h3>
      <p className="text-gray-700 leading-relaxed">{description}</p>
    </div>
  );
}
