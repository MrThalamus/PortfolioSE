"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/ui/FadeIn";

const TYPE_LABEL: Record<Project["type"], string> = {
  VIDEO: "Demo",
  LIVE: "Live",
  REPO: "Code",
};

const TYPE_VARIANT: Record<Project["type"], "video" | "live" | "repo"> = {
  VIDEO: "video",
  LIVE: "live",
  REPO: "repo",
};

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Project | null>(null);

  if (projects.length === 0) {
    return (
      <p className="font-mono text-sm text-foreground-muted">
        No projects published yet. Add some from /admin/projects.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        {projects.map((project, i) => (
          <FadeIn key={project.id} delay={i * 0.05}>
            <button
              type="button"
              onClick={() => setActive(project)}
              className="group flex h-full w-full flex-col rounded-lg border border-border-default bg-background-elevated p-5 text-left transition-all hover:-translate-y-1 hover:border-accent/60"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="font-semibold tracking-tight group-hover:text-accent">
                  {project.title}
                </h3>
                <Badge variant={TYPE_VARIANT[project.type]}>{TYPE_LABEL[project.type]}</Badge>
              </div>
              <p className="mb-4 flex-1 text-sm text-foreground-muted">{project.summary}</p>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <Badge key={tech}>{tech}</Badge>
                ))}
              </div>
            </button>
          </FadeIn>
        ))}
      </div>

      <AnimatePresence>
        {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-lg border border-border-default bg-background-elevated p-6 sm:rounded-lg"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <Badge variant={TYPE_VARIANT[project.type]} className="mb-2">
              {TYPE_LABEL[project.type]}
            </Badge>
            <h3 className="text-xl font-semibold tracking-tight">{project.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border-default text-foreground-muted hover:border-accent hover:text-accent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <Badge key={tech} variant="accent">
              {tech}
            </Badge>
          ))}
        </div>

        {project.type === "VIDEO" && project.videoUrl && (
          <div className="mb-5 aspect-video overflow-hidden rounded-md border border-border-default">
            <video src={project.videoUrl} controls className="h-full w-full" />
          </div>
        )}

        <p className="mb-5 text-sm text-foreground-muted">{project.description}</p>

        <dl className="mb-5 space-y-4">
          {project.problem && <DetailBlock label="Problem" value={project.problem} />}
          {project.approach && <DetailBlock label="Approach" value={project.approach} />}
          {project.outcome && <DetailBlock label="Outcome" value={project.outcome} />}
        </dl>

        <div className="flex flex-wrap gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-accent px-4 py-2 font-mono text-sm font-medium text-accent-foreground"
            >
              View Live ↗
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-border-default px-4 py-2 font-mono text-sm font-medium hover:border-accent hover:text-accent"
            >
              View Code ↗
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-1 font-mono text-xs uppercase tracking-widest text-accent">{label}</dt>
      <dd className="text-sm text-foreground-muted">{value}</dd>
    </div>
  );
}
