const PageHeader = ({ title, subtitle, actions, breadcrumb }) => (
  <div className="page-header-pro">
    {breadcrumb && <div className="breadcrumb">{breadcrumb}</div>}
    <div className="page-header-row">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  </div>
);

export default PageHeader;
