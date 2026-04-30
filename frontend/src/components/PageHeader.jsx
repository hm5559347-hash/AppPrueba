export default function PageHeader({ eyebrow, title, italic, description, action }) {
  return (
    <div className="border-b border-black px-6 lg:px-12 py-8 lg:py-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
      <div>
        {eyebrow && (
          <div className="font-mono-label text-[10px] text-neutral-500 mb-3">─── {eyebrow}</div>
        )}
        <h1 className="font-serif-display text-5xl lg:text-6xl leading-[0.9] font-light">
          {title} {italic && <em className="italic font-normal">{italic}</em>}
        </h1>
        {description && (
          <p className="text-sm text-neutral-600 mt-4 max-w-lg font-light">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
