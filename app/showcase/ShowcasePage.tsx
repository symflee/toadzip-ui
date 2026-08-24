import { createShowcaseDesign } from "./actions";
import { PrototypeShowcase } from "./PrototypeShowcase";
import { loadShowcaseDesignPage } from "./server/showcase-design-dal";
import type { ShowcaseView } from "./showcase-version-registry";

interface ShowcasePageProps {
  view: ShowcaseView;
}

export async function ShowcasePage({ view }: ShowcasePageProps) {
  const registeredDesignPage = await loadShowcaseDesignPage(view);

  return (
    <PrototypeShowcase
      view={view}
      registeredDesignPage={registeredDesignPage}
      createRegisteredDesign={createShowcaseDesign}
    />
  );
}
