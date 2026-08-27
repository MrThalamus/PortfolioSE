import type { SkillGroup } from "@/lib/data";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/ui/FadeIn";

export function About({ bio, skills }: { bio: string; skills: SkillGroup[] }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
      <FadeIn>
        <p className="whitespace-pre-line text-foreground-muted">{bio}</p>
      </FadeIn>
      <div className="space-y-5">
        {skills.map((group, i) => (
          <FadeIn key={group.category} delay={i * 0.05}>
            <div>
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent">
                {group.category}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Badge key={item}>{item}</Badge>
                ))}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
