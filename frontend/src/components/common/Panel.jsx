import { Search } from 'lucide-react';

export const FilterBar = ({ search, onSearchChange, searchPlaceholder = 'Search...', children }) => (
  <div className="filter-bar-pro">
    <div className="search-wrapper">
      <Search size={16} />
      <input
        className="search-input"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
    {children}
  </div>
);

export const Panel = ({ title, subtitle, actions, children, noPadding }) => (
  <div className="panel">
    {(title || actions) && (
      <div className="panel-header">
        <div>
          {title && <h3 className="panel-title">{title}</h3>}
          {subtitle && <p className="panel-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="panel-actions">{actions}</div>}
      </div>
    )}
    <div className={noPadding ? '' : 'panel-body'}>{children}</div>
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="empty-state-pro">
    {Icon && <Icon size={48} strokeWidth={1.2} />}
    <h4>{title}</h4>
    {description && <p>{description}</p>}
    {action}
  </div>
);

export const ActionMenu = ({ children }) => (
  <div className="action-btns">{children}</div>
);
