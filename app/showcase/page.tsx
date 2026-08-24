import { ShowcasePage } from "./ShowcasePage";
import { createShowcaseMetadata } from "./showcase-metadata";

export const metadata = createShowcaseMetadata(
  "공고 목록 카드 UI 시안",
  "두꺼비집 공고 목록 카드 UI를 A, B, C 시안 자리에서 비교합니다.",
);

export default function NoticeCardShowcasePage() {
  return <ShowcasePage view="notice-card" />;
}
