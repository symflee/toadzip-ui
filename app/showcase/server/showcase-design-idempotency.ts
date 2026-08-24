import type { CreateShowcaseDesignInput } from "../showcase-design-types";

export class SubmissionKeyConflictError extends Error {
  constructor() {
    super("동일한 등록 요청 식별자가 다른 입력에 사용되었습니다.");
    this.name = "SubmissionKeyConflictError";
  }
}

export interface IdempotentShowcaseDesignStore<
  Row,
  ExistingRow extends Row = Row,
> {
  insertIfAbsent(input: CreateShowcaseDesignInput): Promise<Row | null>;
  findBySubmissionKey(submissionKey: string): Promise<ExistingRow | null>;
  matchesInput?: (
    row: ExistingRow,
    input: CreateShowcaseDesignInput,
  ) => boolean;
}

export async function insertIdempotentShowcaseDesign<
  Row,
  ExistingRow extends Row = Row,
>(
  store: IdempotentShowcaseDesignStore<Row, ExistingRow>,
  input: CreateShowcaseDesignInput,
): Promise<Row> {
  const inserted = await store.insertIfAbsent(input);
  if (inserted) {
    return inserted;
  }
  const existing = await store.findBySubmissionKey(input.submissionKey);
  if (!existing) {
    throw new Error("등록 결과를 확인할 수 없습니다.");
  }
  if (store.matchesInput && !store.matchesInput(existing, input)) {
    throw new SubmissionKeyConflictError();
  }
  return existing;
}
