"use server";

import { revalidatePath } from "next/cache";

import type {
  CreateShowcaseDesignInput,
  ShowcaseDesignActionResult,
} from "./showcase-design-types";
import { getShowcasePath } from "./showcase-design-paths";
import { insertShowcaseDesign } from "./server/showcase-design-dal";
import { validateShowcaseDesignInput } from "./showcase-design-validation";

export async function createShowcaseDesign(
  input: CreateShowcaseDesignInput,
): Promise<ShowcaseDesignActionResult> {
  const validation = validateShowcaseDesignInput(input);
  if (!validation.success) {
    return {
      status: "validation-error",
      fieldErrors: validation.fieldErrors,
      issues: validation.issues,
    };
  }
  const result = await insertShowcaseDesign(validation.data);
  if (result.status === "unavailable") {
    return result;
  }
  if (result.status === "conflict") {
    return { status: "error", message: result.message };
  }
  revalidatePath(getShowcasePath(result.design.viewId));
  return { status: "success", design: result.design };
}
