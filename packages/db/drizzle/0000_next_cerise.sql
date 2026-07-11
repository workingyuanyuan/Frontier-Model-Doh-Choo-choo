CREATE TABLE "benchmark_metrics" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"benchmark_version_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"unit" text NOT NULL,
	"higher_is_better" boolean DEFAULT true NOT NULL,
	"theoretical_min" numeric(16, 6),
	"theoretical_max" numeric(16, 6),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "benchmark_results" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"model_variant_id" uuid NOT NULL,
	"benchmark_metric_id" uuid NOT NULL,
	"evaluation_config_id" uuid,
	"value" numeric(16, 6) NOT NULL,
	"sample_size" integer,
	"measured_at" timestamp with time zone,
	"publication_status" text DEFAULT 'PUBLISHED' NOT NULL,
	"quality_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "benchmark_versions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"benchmark_id" uuid NOT NULL,
	"version" text NOT NULL,
	"released_at" timestamp with time zone,
	"methodology_url" text,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "benchmarks" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"homepage_url" text,
	"license_spdx" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluation_configs" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"benchmark_version_id" uuid NOT NULL,
	"config_hash" text NOT NULL,
	"display_name" text NOT NULL,
	"evaluator" text,
	"config" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_runs" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"source_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"status" text NOT NULL,
	"connector_version" text NOT NULL,
	"records_seen" integer DEFAULT 0 NOT NULL,
	"records_accepted" integer DEFAULT 0 NOT NULL,
	"error_summary" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "result_evidence" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"benchmark_result_id" uuid NOT NULL,
	"source_snapshot_id" uuid NOT NULL,
	"staged_result_id" uuid,
	"evidence_kind" text NOT NULL,
	"locator" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"source_id" uuid NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL,
	"request_url" text NOT NULL,
	"response_status" integer,
	"content_sha256" text NOT NULL,
	"content_type" text,
	"storage_path" text NOT NULL,
	"byte_length" integer NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "source_snapshots_byte_length_check" CHECK ("source_snapshots"."byte_length" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"source_type" text NOT NULL,
	"base_url" text,
	"trust_tier" text NOT NULL,
	"license_spdx" text,
	"terms_url" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staged_results" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"ingestion_run_id" uuid NOT NULL,
	"source_snapshot_id" uuid NOT NULL,
	"source_record_key" text NOT NULL,
	"raw_model_name" text NOT NULL,
	"resolved_model_variant_id" uuid,
	"payload" jsonb NOT NULL,
	"validation_status" text NOT NULL,
	"validation_errors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_aliases" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"model_variant_id" uuid NOT NULL,
	"namespace" text NOT NULL,
	"alias" text NOT NULL,
	"is_canonical" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_families" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"provider_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_variants" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"model_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"release_date" date,
	"lifecycle_status" text DEFAULT 'ACTIVE' NOT NULL,
	"parameter_count_millions" integer,
	"context_window_tokens" integer,
	"is_open_weights" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "models" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"family_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"architecture" text,
	"modality" jsonb DEFAULT '{"input":[],"output":[]}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"website_url" text,
	"country_code" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"request_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"previous_hash" text,
	"entry_hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_events" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" text NOT NULL,
	"actor" text NOT NULL,
	"reason" text,
	"before" jsonb,
	"after" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theme_presets" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"slug" text NOT NULL,
	"display_name_zh_tw" text NOT NULL,
	"display_name_en" text NOT NULL,
	"tokens" jsonb NOT NULL,
	"geometry_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_jobs" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"weekly_edition_id" uuid NOT NULL,
	"theme_preset_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"status" text DEFAULT 'QUEUED' NOT NULL,
	"composition_id" text NOT NULL,
	"input_snapshot_sha256" text NOT NULL,
	"output_path" text,
	"output_sha256" text,
	"error_summary" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "benchmark_dimension_mappings" (
	"scoring_method_version_id" uuid NOT NULL,
	"benchmark_metric_id" uuid NOT NULL,
	"dimension_id" text NOT NULL,
	"weight" numeric(8, 6) NOT NULL,
	"normalization" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "benchmark_dimension_mappings_pk" PRIMARY KEY("scoring_method_version_id","benchmark_metric_id","dimension_id"),
	CONSTRAINT "benchmark_dimension_mappings_weight_check" CHECK ("benchmark_dimension_mappings"."weight" > 0 AND "benchmark_dimension_mappings"."weight" <= 1)
);
--> statement-breakpoint
CREATE TABLE "dimension_scores" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"scoring_method_version_id" uuid NOT NULL,
	"model_variant_id" uuid NOT NULL,
	"dimension_id" text NOT NULL,
	"score" numeric(8, 4),
	"coverage" numeric(7, 6) NOT NULL,
	"confidence" numeric(7, 4) NOT NULL,
	"status" text NOT NULL,
	"component_results" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dimension_scores_score_check" CHECK ("dimension_scores"."score" IS NULL OR ("dimension_scores"."score" >= 0 AND "dimension_scores"."score" <= 100)),
	CONSTRAINT "dimension_scores_coverage_check" CHECK ("dimension_scores"."coverage" >= 0 AND "dimension_scores"."coverage" <= 1),
	CONSTRAINT "dimension_scores_confidence_check" CHECK ("dimension_scores"."confidence" >= 0 AND "dimension_scores"."confidence" <= 100)
);
--> statement-breakpoint
CREATE TABLE "dimensions" (
	"id" text PRIMARY KEY NOT NULL,
	"display_order" integer NOT NULL,
	"name_zh_tw" text NOT NULL,
	"name_en" text NOT NULL,
	"description_zh_tw" text,
	"description_en" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "overall_scores" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"scoring_method_version_id" uuid NOT NULL,
	"model_variant_id" uuid NOT NULL,
	"score" numeric(8, 4),
	"coverage" numeric(7, 6) NOT NULL,
	"confidence" numeric(7, 4) NOT NULL,
	"independent_evidence_share" numeric(7, 6) NOT NULL,
	"ranking_status" text NOT NULL,
	"quality_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "overall_scores_score_check" CHECK ("overall_scores"."score" IS NULL OR ("overall_scores"."score" >= 0 AND "overall_scores"."score" <= 100)),
	CONSTRAINT "overall_scores_coverage_check" CHECK ("overall_scores"."coverage" >= 0 AND "overall_scores"."coverage" <= 1),
	CONSTRAINT "overall_scores_confidence_check" CHECK ("overall_scores"."confidence" >= 0 AND "overall_scores"."confidence" <= 100)
);
--> statement-breakpoint
CREATE TABLE "ranking_entries" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"ranking_snapshot_id" uuid NOT NULL,
	"model_variant_id" uuid NOT NULL,
	"rank" integer,
	"overall_score" numeric(8, 4),
	"overall_coverage" numeric(7, 6) NOT NULL,
	"overall_confidence" numeric(7, 4) NOT NULL,
	"ranking_status" text NOT NULL,
	"dimensions" jsonb NOT NULL,
	"quality_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ranking_entries_rank_check" CHECK ("ranking_entries"."rank" IS NULL OR "ranking_entries"."rank" > 0)
);
--> statement-breakpoint
CREATE TABLE "ranking_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"edition_date" date NOT NULL,
	"data_cutoff_at" timestamp with time zone NOT NULL,
	"scoring_method_version_id" uuid NOT NULL,
	"source_snapshot_ids" uuid[] NOT NULL,
	"entry_count" integer NOT NULL,
	"content_sha256" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ranking_snapshots_entry_count_check" CHECK ("ranking_snapshots"."entry_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "scoring_method_versions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"version" text NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"config" jsonb NOT NULL,
	"methodology_markdown" text NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_editions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"edition_date" date NOT NULL,
	"ranking_snapshot_id" uuid NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"title_zh_tw" text NOT NULL,
	"title_en" text NOT NULL,
	"summary_zh_tw" text,
	"summary_en" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "benchmark_metrics" ADD CONSTRAINT "benchmark_metrics_benchmark_version_id_benchmark_versions_id_fk" FOREIGN KEY ("benchmark_version_id") REFERENCES "public"."benchmark_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benchmark_results" ADD CONSTRAINT "benchmark_results_model_variant_id_model_variants_id_fk" FOREIGN KEY ("model_variant_id") REFERENCES "public"."model_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benchmark_results" ADD CONSTRAINT "benchmark_results_benchmark_metric_id_benchmark_metrics_id_fk" FOREIGN KEY ("benchmark_metric_id") REFERENCES "public"."benchmark_metrics"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benchmark_results" ADD CONSTRAINT "benchmark_results_evaluation_config_id_evaluation_configs_id_fk" FOREIGN KEY ("evaluation_config_id") REFERENCES "public"."evaluation_configs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benchmark_versions" ADD CONSTRAINT "benchmark_versions_benchmark_id_benchmarks_id_fk" FOREIGN KEY ("benchmark_id") REFERENCES "public"."benchmarks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluation_configs" ADD CONSTRAINT "evaluation_configs_benchmark_version_id_benchmark_versions_id_fk" FOREIGN KEY ("benchmark_version_id") REFERENCES "public"."benchmark_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_runs" ADD CONSTRAINT "ingestion_runs_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_evidence" ADD CONSTRAINT "result_evidence_benchmark_result_id_benchmark_results_id_fk" FOREIGN KEY ("benchmark_result_id") REFERENCES "public"."benchmark_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_evidence" ADD CONSTRAINT "result_evidence_source_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("source_snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_evidence" ADD CONSTRAINT "result_evidence_staged_result_id_staged_results_id_fk" FOREIGN KEY ("staged_result_id") REFERENCES "public"."staged_results"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_snapshots" ADD CONSTRAINT "source_snapshots_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staged_results" ADD CONSTRAINT "staged_results_ingestion_run_id_ingestion_runs_id_fk" FOREIGN KEY ("ingestion_run_id") REFERENCES "public"."ingestion_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staged_results" ADD CONSTRAINT "staged_results_source_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("source_snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staged_results" ADD CONSTRAINT "staged_results_resolved_model_variant_id_model_variants_id_fk" FOREIGN KEY ("resolved_model_variant_id") REFERENCES "public"."model_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_aliases" ADD CONSTRAINT "model_aliases_model_variant_id_model_variants_id_fk" FOREIGN KEY ("model_variant_id") REFERENCES "public"."model_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_families" ADD CONSTRAINT "model_families_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_variants" ADD CONSTRAINT "model_variants_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "models" ADD CONSTRAINT "models_family_id_model_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."model_families"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_jobs" ADD CONSTRAINT "video_jobs_weekly_edition_id_weekly_editions_id_fk" FOREIGN KEY ("weekly_edition_id") REFERENCES "public"."weekly_editions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_jobs" ADD CONSTRAINT "video_jobs_theme_preset_id_theme_presets_id_fk" FOREIGN KEY ("theme_preset_id") REFERENCES "public"."theme_presets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benchmark_dimension_mappings" ADD CONSTRAINT "benchmark_dimension_mappings_scoring_method_version_id_scoring_method_versions_id_fk" FOREIGN KEY ("scoring_method_version_id") REFERENCES "public"."scoring_method_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benchmark_dimension_mappings" ADD CONSTRAINT "benchmark_dimension_mappings_benchmark_metric_id_benchmark_metrics_id_fk" FOREIGN KEY ("benchmark_metric_id") REFERENCES "public"."benchmark_metrics"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benchmark_dimension_mappings" ADD CONSTRAINT "benchmark_dimension_mappings_dimension_id_dimensions_id_fk" FOREIGN KEY ("dimension_id") REFERENCES "public"."dimensions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dimension_scores" ADD CONSTRAINT "dimension_scores_scoring_method_version_id_scoring_method_versions_id_fk" FOREIGN KEY ("scoring_method_version_id") REFERENCES "public"."scoring_method_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dimension_scores" ADD CONSTRAINT "dimension_scores_model_variant_id_model_variants_id_fk" FOREIGN KEY ("model_variant_id") REFERENCES "public"."model_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dimension_scores" ADD CONSTRAINT "dimension_scores_dimension_id_dimensions_id_fk" FOREIGN KEY ("dimension_id") REFERENCES "public"."dimensions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overall_scores" ADD CONSTRAINT "overall_scores_scoring_method_version_id_scoring_method_versions_id_fk" FOREIGN KEY ("scoring_method_version_id") REFERENCES "public"."scoring_method_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overall_scores" ADD CONSTRAINT "overall_scores_model_variant_id_model_variants_id_fk" FOREIGN KEY ("model_variant_id") REFERENCES "public"."model_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ranking_entries" ADD CONSTRAINT "ranking_entries_ranking_snapshot_id_ranking_snapshots_id_fk" FOREIGN KEY ("ranking_snapshot_id") REFERENCES "public"."ranking_snapshots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ranking_entries" ADD CONSTRAINT "ranking_entries_model_variant_id_model_variants_id_fk" FOREIGN KEY ("model_variant_id") REFERENCES "public"."model_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ranking_snapshots" ADD CONSTRAINT "ranking_snapshots_scoring_method_version_id_scoring_method_versions_id_fk" FOREIGN KEY ("scoring_method_version_id") REFERENCES "public"."scoring_method_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_editions" ADD CONSTRAINT "weekly_editions_ranking_snapshot_id_ranking_snapshots_id_fk" FOREIGN KEY ("ranking_snapshot_id") REFERENCES "public"."ranking_snapshots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "benchmark_metrics_version_slug_uidx" ON "benchmark_metrics" USING btree ("benchmark_version_id","slug");--> statement-breakpoint
CREATE INDEX "benchmark_results_variant_metric_idx" ON "benchmark_results" USING btree ("model_variant_id","benchmark_metric_id");--> statement-breakpoint
CREATE UNIQUE INDEX "benchmark_versions_benchmark_version_uidx" ON "benchmark_versions" USING btree ("benchmark_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "benchmarks_slug_uidx" ON "benchmarks" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "evaluation_configs_hash_uidx" ON "evaluation_configs" USING btree ("config_hash");--> statement-breakpoint
CREATE INDEX "ingestion_runs_source_started_idx" ON "ingestion_runs" USING btree ("source_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "result_evidence_result_snapshot_uidx" ON "result_evidence" USING btree ("benchmark_result_id","source_snapshot_id");--> statement-breakpoint
CREATE UNIQUE INDEX "source_snapshots_source_hash_uidx" ON "source_snapshots" USING btree ("source_id","content_sha256");--> statement-breakpoint
CREATE INDEX "source_snapshots_fetched_idx" ON "source_snapshots" USING btree ("fetched_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sources_slug_uidx" ON "sources" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "staged_results_run_record_uidx" ON "staged_results" USING btree ("ingestion_run_id","source_record_key");--> statement-breakpoint
CREATE UNIQUE INDEX "model_aliases_namespace_alias_uidx" ON "model_aliases" USING btree ("namespace","alias");--> statement-breakpoint
CREATE INDEX "model_aliases_variant_idx" ON "model_aliases" USING btree ("model_variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "model_families_provider_slug_uidx" ON "model_families" USING btree ("provider_id","slug");--> statement-breakpoint
CREATE INDEX "model_families_provider_idx" ON "model_families" USING btree ("provider_id");--> statement-breakpoint
CREATE UNIQUE INDEX "model_variants_slug_uidx" ON "model_variants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "model_variants_model_idx" ON "model_variants" USING btree ("model_id");--> statement-breakpoint
CREATE UNIQUE INDEX "models_family_slug_uidx" ON "models" USING btree ("family_id","slug");--> statement-breakpoint
CREATE INDEX "models_family_idx" ON "models" USING btree ("family_id");--> statement-breakpoint
CREATE UNIQUE INDEX "providers_slug_uidx" ON "providers" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "audit_logs_entry_hash_uidx" ON "audit_logs" USING btree ("entry_hash");--> statement-breakpoint
CREATE INDEX "audit_logs_occurred_idx" ON "audit_logs" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "review_events_entity_idx" ON "review_events" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "theme_presets_slug_uidx" ON "theme_presets" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "video_jobs_edition_status_idx" ON "video_jobs" USING btree ("weekly_edition_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "dimension_scores_method_variant_dimension_uidx" ON "dimension_scores" USING btree ("scoring_method_version_id","model_variant_id","dimension_id");--> statement-breakpoint
CREATE UNIQUE INDEX "overall_scores_method_variant_uidx" ON "overall_scores" USING btree ("scoring_method_version_id","model_variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ranking_entries_snapshot_variant_uidx" ON "ranking_entries" USING btree ("ranking_snapshot_id","model_variant_id");--> statement-breakpoint
CREATE INDEX "ranking_entries_snapshot_rank_idx" ON "ranking_entries" USING btree ("ranking_snapshot_id","rank");--> statement-breakpoint
CREATE UNIQUE INDEX "ranking_snapshots_edition_method_uidx" ON "ranking_snapshots" USING btree ("edition_date","scoring_method_version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "scoring_method_versions_version_uidx" ON "scoring_method_versions" USING btree ("version");--> statement-breakpoint
CREATE UNIQUE INDEX "weekly_editions_date_uidx" ON "weekly_editions" USING btree ("edition_date");