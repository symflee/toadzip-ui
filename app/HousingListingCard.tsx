"use client";

import { Bell, BellRing, Bookmark } from "lucide-react";
import { type CSSProperties, type KeyboardEvent } from "react";
import {
  formatMoney,
  type HousingListing,
} from "./housing-data";

interface HousingListingCardProps {
  listing: HousingListing;
  selected: boolean;
  hovered: boolean;
  saved: boolean;
  alerted: boolean;
  cardRef?: (node: HTMLElement | null) => void;
  onSelect: () => void;
  onHover: (hovering: boolean) => void;
  onSave: () => void;
  onAlert: () => void;
  onOpenNotice: () => void;
}

export function HousingListingCard({
  listing,
  selected,
  hovered,
  saved,
  alerted,
  cardRef,
  onSelect,
  onHover,
  onSave,
  onAlert,
  onOpenNotice,
}: HousingListingCardProps) {
  const status = listingStatus(listing);
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect();
  };

  return (
    <article
      ref={cardRef}
      className={`listing-card ${selected ? "is-selected" : ""} ${hovered ? "is-hovered" : ""}`}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      aria-label={`${listing.title}, ${listing.areaSquareMeters}제곱미터, 월 ${formatMoney(listing.monthlyRentWon)}`}
    >
      <ListingImage listing={listing} status={status} />
      <ListingSummary listing={listing} saved={saved} onSave={onSave} />
      <ListingConditions
        listing={listing}
        alerted={alerted}
        onAlert={onAlert}
        onOpenNotice={onOpenNotice}
      />
    </article>
  );
}

function ListingImage({
  listing,
  status,
}: {
  listing: HousingListing;
  status: ReturnType<typeof listingStatus>;
}) {
  return (
    <div
      className="listing-card__media"
      role="img"
      aria-label={`${listing.title} 단지 이미지`}
      style={{
        "--listing-image": `url("${listing.complexDetails.photoUrl}")`,
      } as CSSProperties}
    >
      <div className="listing-card__media-badges">
        <span className={`status-badge status-badge--${listing.status}`}>
          {status.label}
        </span>
        {status.deadline && <span className="deadline-badge">{status.deadline}</span>}
      </div>
    </div>
  );
}

function ListingSummary({
  listing,
  saved,
  onSave,
}: {
  listing: HousingListing;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <section className="listing-card__summary">
      <div className="listing-card__summary-topline">
        <p className="listing-card__location">
          {listing.regionLabel} {listing.district}
        </p>
        <button
          className={`icon-button save-button listing-card__bookmark ${saved ? "is-saved" : ""}`}
          type="button"
          aria-label={saved ? `${listing.title} 저장 해제` : `${listing.title} 저장`}
          aria-pressed={saved}
          onClick={(event) => {
            event.stopPropagation();
            onSave();
          }}
        >
          <Bookmark size={21} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <h3>{listing.title}</h3>
      <p className="listing-card__operator">
        <strong>{listing.provider}</strong>
        <span aria-hidden="true" />
        <strong>{listing.rentalType}</strong>
      </p>

      <div className="listing-card__tags">
        <span>전용 {listing.areaSquareMeters}㎡</span>
        <span>{listing.completedAt ? `준공 ${listing.completedAt}` : "준공 정보 확인 중"}</span>
      </div>
    </section>
  );
}

function ListingConditions({
  listing,
  alerted,
  onAlert,
  onOpenNotice,
}: {
  listing: HousingListing;
  alerted: boolean;
  onAlert: () => void;
  onOpenNotice: () => void;
}) {
  return (
    <aside className="listing-card__conditions" aria-label="주요 임대 조건">
      <p className="listing-card__conditions-title">주요 임대 조건</p>
      <ListingPrice label="임대보증금" value={formatMoney(listing.depositWon)} />
      <ListingPrice label="월 임대료" value={formatMoney(listing.monthlyRentWon)} monthly />
      {listing.status === "upcoming" && (
        <button
          type="button"
          className={`alert-button listing-card__action ${alerted ? "is-alerted" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            onAlert();
          }}
        >
          {alerted ? <BellRing size={15} /> : <Bell size={15} />}
          {alerted ? "알림 설정됨" : "공고 알림"}
        </button>
      )}
      {listing.status !== "upcoming" && (
        <button
          type="button"
          className="listing-primary-action listing-card__action"
          onClick={(event) => {
            event.stopPropagation();
            onOpenNotice();
          }}
        >
          공고 확인
        </button>
      )}
    </aside>
  );
}

function ListingPrice({
  label,
  value,
  monthly = false,
}: {
  label: string;
  value: string;
  monthly?: boolean;
}) {
  return (
    <div className={`listing-card__condition ${monthly ? "listing-card__condition--monthly" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function listingStatus(listing: HousingListing) {
  if (listing.status === "closed") return { label: "접수마감", deadline: null };
  if (listing.status === "always") return { label: "상시모집", deadline: null };
  const deadline = listing.daysLeft === null ? null : `D-${listing.daysLeft}`;
  if (listing.status === "upcoming") return { label: "모집예정", deadline };
  return { label: "접수중", deadline };
}
