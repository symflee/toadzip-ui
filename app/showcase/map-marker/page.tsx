import { ShowcasePage } from "../ShowcasePage";
import { createShowcaseMetadata } from "../showcase-metadata";

export const metadata = createShowcaseMetadata(
  "지도 마커 UI 시안",
  "두꺼비집 지도 마커 UI를 A, B, C 시안 자리에서 비교합니다.",
);

export default function MapMarkerShowcasePage() {
  return <ShowcasePage view="map-marker" />;
}
