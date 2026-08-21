import type { Metadata } from "next";
import { HousingExplorer } from "./HousingExplorer";

export const metadata: Metadata = {
  title: "지도에서 찾는 공공임대",
  description:
    "모집 중이거나 곧 모집할 공공임대 주택을 지도에서 빠르게 비교하는 두꺼비집 프로토타입입니다.",
};

export default function Home() {
  return <HousingExplorer />;
}
