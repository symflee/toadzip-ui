import { PrototypeShowcase } from "../PrototypeShowcase";
import { createShowcaseMetadata } from "../showcase-metadata";

export const metadata = createShowcaseMetadata(
  "단지 목록 UI 시안",
  "두꺼비집 단지 목록 UI를 A, B, C 시안 자리에서 비교합니다.",
);

export default function ComplexListShowcasePage() {
  return <PrototypeShowcase view="complex-list" />;
}
