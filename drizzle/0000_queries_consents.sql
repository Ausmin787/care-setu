CREATE TYPE "public"."area" AS ENUM('noida', 'delhi', 'other');--> statement-breakpoint
CREATE TYPE "public"."patient_location" AS ENUM('hospital', 'home', 'not_sure');--> statement-breakpoint
CREATE TYPE "public"."query_status" AS ENUM('new', 'contacted', 'quoted', 'closed', 'spam');--> statement-breakpoint
CREATE TABLE "consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query_id" uuid NOT NULL,
	"notice_version" varchar(40) NOT NULL,
	"purpose" varchar(60) NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "queries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(10) NOT NULL,
	"patient_location" "patient_location" NOT NULL,
	"service_slug" text,
	"area" "area" NOT NULL,
	"message" varchar(1000) NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone" varchar(13) NOT NULL,
	"email" varchar(254),
	"status" "query_status" DEFAULT 'new' NOT NULL,
	"source_page" varchar(200) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "queries_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_query_id_queries_id_fk" FOREIGN KEY ("query_id") REFERENCES "public"."queries"("id") ON DELETE cascade ON UPDATE no action;