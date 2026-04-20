export default function BuilderSection({ icon, title, children }) {
  return (
    <div className="affiliate-design-builder-card">
      <div className="affiliate-design-builder-title">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}