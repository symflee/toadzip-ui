"use client";

import { LocateFixed, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker, TileLayer } from "leaflet";
import {
  clusterListings,
  formatMoney,
  type HousingListing,
  type MapViewport,
} from "./housing-data";

interface HousingMapProps {
  listings: HousingListing[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onViewportChange: (viewport: MapViewport) => void;
  onTileError: () => void;
  onLocationError: () => void;
}

interface MapRuntime {
  map: LeafletMap;
  markers: Marker[];
  tileLayer: TileLayer;
  leaflet: typeof import("leaflet");
}

interface MapCallbacks {
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onViewportChange: (viewport: MapViewport) => void;
  onTileError: () => void;
  onLocationError: () => void;
}

interface MarkerState {
  listings: HousingListing[];
  selectedId: string | null;
  hoveredId: string | null;
}

interface CallbackRef {
  current: MapCallbacks;
}

const INITIAL_CENTER: [number, number] = [37.4454, 127.1408];

function viewportFromMap(map: LeafletMap): MapViewport {
  const bounds = map.getBounds();
  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
    zoom: map.getZoom(),
  };
}

function statusText(listing: HousingListing) {
  if (listing.status === "upcoming") return "모집예정";
  if (listing.status === "always") return "상시모집";
  if ((listing.daysLeft ?? 0) <= 3) return `마감 D-${listing.daysLeft ?? 0}`;
  return "모집중";
}

function markerHtml(listing: HousingListing, selected: boolean, hovered: boolean) {
  const classes = [
    "housing-marker",
    `housing-marker--${listing.status}`,
    selected ? "is-selected" : "",
    hovered ? "is-hovered" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <div class="${classes}">
      <span class="housing-marker__top">${listing.provider} · ${statusText(listing)}</span>
      <span class="housing-marker__body">
        <strong>${listing.areaSquareMeters}㎡</strong>
        <b>월 ${formatMoney(listing.monthlyRentWon)}</b>
      </span>
    </div>
  `;
}

function clusterHtml(regionName: string, count: number) {
  return `
    <div class="cluster-marker">
      <span>${regionName}</span>
      <strong>${count}곳</strong>
    </div>
  `;
}

function addClusterMarker(
  runtime: MapRuntime,
  cluster: ReturnType<typeof clusterListings>[number],
) {
  const icon = runtime.leaflet.divIcon({
    className: "map-icon-shell map-icon-shell--cluster",
    html: clusterHtml(cluster.regionName, cluster.count),
    iconSize: [76, 62],
    iconAnchor: [38, 31],
  });
  const marker = runtime.leaflet.marker([cluster.lat, cluster.lng], {
    icon,
    keyboard: true,
    title: `${cluster.regionName}, 공공임대 ${cluster.count}곳`,
    alt: `${cluster.regionName} 공공임대 ${cluster.count}곳 묶음`,
  });
  marker.on("click", () => {
    runtime.map.setView([cluster.lat, cluster.lng], runtime.map.getZoom() + 2);
  });
  marker.addTo(runtime.map);
  runtime.markers.push(marker);
}

function addListingMarker(
  runtime: MapRuntime,
  listing: HousingListing,
  state: MarkerState,
  callbacksRef: CallbackRef,
) {
  const selected = listing.id === state.selectedId;
  const hovered = listing.id === state.hoveredId;
  const icon = runtime.leaflet.divIcon({
    className: "map-icon-shell",
    html: markerHtml(listing, selected, hovered),
    iconSize: [112, 70],
    iconAnchor: [56, 70],
  });
  const marker = runtime.leaflet.marker([listing.latitude, listing.longitude], {
    icon,
    keyboard: true,
    riseOnHover: true,
    title: `${listing.title}, ${listing.areaSquareMeters}제곱미터, 월 ${formatMoney(listing.monthlyRentWon)}`,
    alt: `${listing.title} 지도 핀`,
  });
  marker.on("click", () => callbacksRef.current.onSelect(listing.id));
  marker.on("mouseover", () => callbacksRef.current.onHover(listing.id));
  marker.on("mouseout", () => callbacksRef.current.onHover(null));
  marker.addTo(runtime.map);
  runtime.markers.push(marker);
}

function drawMarkers(
  runtime: MapRuntime,
  state: MarkerState,
  callbacksRef: CallbackRef,
) {
  runtime.markers.forEach((marker) => marker.remove());
  runtime.markers = [];
  const clusters = clusterListings(state.listings, runtime.map.getZoom());

  clusters.forEach((cluster) => {
    const listing = state.listings.find((item) => item.id === cluster.listingIds[0]);
    if (!listing) return;
    if (cluster.count > 1) {
      addClusterMarker(runtime, cluster);
      return;
    }
    addListingMarker(runtime, listing, state, callbacksRef);
  });
}

export function HousingMap({
  listings,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  onViewportChange,
  onTileError,
  onLocationError,
}: HousingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<MapRuntime | null>(null);
  const callbacksRef = useRef({
    onSelect,
    onHover,
    onViewportChange,
    onTileError,
    onLocationError,
  });
  const stateRef = useRef({ listings, selectedId, hoveredId });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    callbacksRef.current = {
      onSelect,
      onHover,
      onViewportChange,
      onTileError,
      onLocationError,
    };
  }, [onHover, onLocationError, onSelect, onTileError, onViewportChange]);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      if (!containerRef.current || runtimeRef.current) return;
      const leaflet = await import("leaflet");
      if (cancelled || !containerRef.current) return;
      const map = leaflet.map(containerRef.current, {
        zoomControl: false,
        minZoom: 11,
        maxZoom: 18,
        preferCanvas: true,
      });
      map.setView(INITIAL_CENTER, 13);
      const tileLayer = leaflet.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        },
      );
      tileLayer.on("tileerror", () => callbacksRef.current.onTileError());
      tileLayer.addTo(map);
      const runtime = { map, markers: [], tileLayer, leaflet };
      runtimeRef.current = runtime;
      map.on("moveend", () => {
        callbacksRef.current.onViewportChange(viewportFromMap(map));
        drawMarkers(runtime, stateRef.current, callbacksRef);
      });
      drawMarkers(runtime, stateRef.current, callbacksRef);
      callbacksRef.current.onViewportChange(viewportFromMap(map));
      setReady(true);
    };
    void initialize();
    return () => {
      cancelled = true;
      runtimeRef.current?.map.remove();
      runtimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const state = { listings, selectedId, hoveredId };
    stateRef.current = state;
    if (!runtimeRef.current) return;
    drawMarkers(runtimeRef.current, state, callbacksRef);
  }, [listings, selectedId, hoveredId]);

  const zoomBy = (amount: number) => {
    if (amount > 0) runtimeRef.current?.map.zoomIn(amount);
    if (amount < 0) runtimeRef.current?.map.zoomOut(Math.abs(amount));
  };

  const locate = () => {
    if (!navigator.geolocation) {
      callbacksRef.current.onLocationError();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        runtimeRef.current?.map.setView(
          [position.coords.latitude, position.coords.longitude],
          15,
        );
      },
      () => callbacksRef.current.onLocationError(),
      { enableHighAccuracy: false, timeout: 6000 },
    );
  };

  return (
    <div className="map-canvas-wrap">
      <div
        ref={containerRef}
        className="map-canvas"
        role="application"
        aria-label="성남·위례권 공공임대 지도"
      />
      {!ready && (
        <div className="map-loading" role="status">
          <span className="map-loading__pulse" />
          지도를 준비하고 있어요
        </div>
      )}
      <div className="map-controls" aria-label="지도 조작">
        <button type="button" onClick={locate} aria-label="현재 위치로 이동">
          <LocateFixed size={19} strokeWidth={2.2} />
        </button>
        <span className="map-controls__divider" />
        <button type="button" onClick={() => zoomBy(1)} aria-label="지도 확대">
          <Plus size={20} />
        </button>
        <button type="button" onClick={() => zoomBy(-1)} aria-label="지도 축소">
          <Minus size={20} />
        </button>
      </div>
    </div>
  );
}
