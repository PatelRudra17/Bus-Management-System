import React from 'react';
import { FileText, Users, CreditCard, Search, Bell, CheckCircle } from 'lucide-react';

const iconMap = {
  'file': FileText,
  'user': Users,
  'card': CreditCard,
  'search': Search,
  'bell': Bell,
  'check': CheckCircle,
  'default': FileText
};

const EmptyState = ({ 
  icon = 'default', 
  title = 'No Data Found', 
  description = 'There are no items to display at the moment.', 
  action = null,
  actionLabel = 'Get Started',
  actionLink = null
}) => {
  const IconComponent = iconMap[icon] || iconMap.default;

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <IconComponent size={50} style={{ color: 'var(--primary)' }} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        actionLink ? (
          <a href={actionLink} className="btn btn-primary">
            {actionLabel}
          </a>
        ) : (
          <button onClick={action} className="btn btn-primary">
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
};

export default EmptyState;
