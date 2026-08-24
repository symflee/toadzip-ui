import { PrototypeShowcase } from "../PrototypeShowcase";
import { createShowcaseMetadata } from "../showcase-metadata";

export const metadata = createShowcaseMetadata(
  "상단 바 UI 시안",
  "두꺼비집 상단 바 UI를 A, B, C 시안 자리에서 비교합니다.",
);

export default function TopBarShowcasePage() {
  return <PrototypeShowcase view="top-bar" />;
}
