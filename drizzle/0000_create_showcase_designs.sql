CREATE TABLE "showcase_designs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"view_id" varchar(40) NOT NULL,
	"sequence" bigint GENERATED ALWAYS AS IDENTITY (sequence name "showcase_designs_sequence_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"submission_key" uuid NOT NULL,
	"title" varchar(80) NOT NULL,
	"description" varchar(300),
	"html" text NOT NULL,
	"css" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "showcase_designs_submission_key_unique" UNIQUE("submission_key"),
	CONSTRAINT "showcase_designs_view_id_check" CHECK ("showcase_designs"."view_id" in ('notice-card', 'notice-list', 'notice-detail', 'complex-card', 'complex-list', 'complex-detail', 'map-marker', 'top-bar'))
);
--> statement-breakpoint
CREATE INDEX "showcase_designs_view_sequence_idx" ON "showcase_designs" USING btree ("view_id","sequence" desc);