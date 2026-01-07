import ThreeDotsActionsMenu from './../threeDotsActionMenu/threeDotsActionMenu';
import clsx from 'clsx';
import type { MenuItem } from 'primereact/menuitem';
import { type ReactNode } from 'react';
import { Link, type To } from 'react-router';
import './card-custom.scss';

export type CustomCardProps = {
  title: string;
  icon?: string | ReactNode;
  threeDotsItems: MenuItem[];
  linkTo?: To; // Resa OPZIONALE
  subTitle?: string | null;
  version?: string | null;
  tags?: string[] | ReactNode;
  footer?: string;
  onClick?: () => void;
  creationInformation?: {
    createdBy: string;
    createdOn: string;
    lastUpdate: string;
  };
};

export default function CardCustom({
  title,
  icon,
  subTitle,
  version,
  tags,
  creationInformation,
  threeDotsItems,
  linkTo, // linkTo ora può essere undefined
  footer,
  onClick,
}: CustomCardProps) {
  // Use a single space when the subtitle is empty so that cards without a subtitle keep the same height as those with text.
  // If it's null or undefined, hide it entirely.
  const subTitlePlaceHolder = subTitle === '' ? ' ' : subTitle;
  const cardContent = (
    <div
      className={clsx(
        `custom-card-container`,
        icon ? '' : 'no-icon',
        // AGGIUNTA: se c'è onClick o linkTo, aggiunge la classe 'is-clickable'
        (onClick || linkTo) && 'is-clickable',
      )}
      onClick={onClick}
    >
      {icon}
      <span className="text-22 title-text" title={title}>
        {title}
      </span>
      <ThreeDotsActionsMenu items={threeDotsItems} />

      <div className="description text-12-secondary">
        {subTitlePlaceHolder && (
          <span className="description-text text-12-secondary" title={subTitlePlaceHolder}>
            {subTitlePlaceHolder}
          </span>
        )}

        {version && (
          <span className={`version text-12-secondary ${!version ? 'empty-placeholder' : ''}`}>
            {version ? (
              <>
                <i className="pi pi-history" style={{ marginRight: '6px' }} />
                {version}
              </>
            ) : (
              ' '
            )}
          </span>
        )}

        {creationInformation && (
          <div className="stats-table">
            <div className="cell">
              <span>{`${'created_by'}:`}</span>
              <span>{creationInformation?.createdBy}</span>
            </div>

            <div className="cell">
              <span>{`${'created_on'}:`}</span>
              <span>{creationInformation?.createdOn}</span>
            </div>

            <div className="cell">
              <span>{`${'last_update'}:`}</span>
              <span>{creationInformation?.lastUpdate}</span>
            </div>
          </div>
        )}

        {footer && (
          <div className="footer">
            <span>{footer}</span>
          </div>
        )}
      </div>

      <div className="tags">
        {Array.isArray(tags) &&
          tags.map((tag, index) => (
            <span key={index} className="tag-item text-12-secondary">
              {tag}
            </span>
          ))}
      </div>
    </div>
  );
  return linkTo ? <Link to={linkTo}>{cardContent}</Link> : <>{cardContent}</>;
}
