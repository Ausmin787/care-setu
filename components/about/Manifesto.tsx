import { IconHeartFilled, IconHomeFilled, IconUsersGroup } from "@tabler/icons-react";
import { about } from "@/lib/about";
import { LINES, shown, t } from "@/lib/content";
import { Capsules } from "@/components/motion/Capsules";
import { Bridge } from "./Bridge";
import { Pending } from "./Pending";
import s from "./Manifesto.module.css";

const p = t.aboutPage;
const capIcons = { home: IconHomeFilled, family: IconUsersGroup, heart: IconHeartFilled };

// Vision, then mission (D-032). The vision is one large sentence with three capsules set between its words
// (GetLayers Halden), in the logo colours, each with an icon (the still-lifes tried there were dropped, D-039); they
// open with scroll (Capsules).
// The mission follows on an ink panel (D-034): its line, the founders' lead-in, and the six groups they want to
// bring together drawn as stations whose lines merge into one (Bridge). Development only until approved (C-075, C-078).
export function Manifesto() {
  const vision = shown(about.vision);
  const mission = shown(about.mission);
  const groups = shown(mission?.groups);
  if (!vision && !mission) return null;

  return (
    <section className={s.section} aria-labelledby={vision ? "vision-title" : "mission-title"}>
      {vision && (
        <div className={`${s.vision} wrap`}>
          <div className={s.visionHead}>
            <p className={s.kicker}>
              {p.visionKicker}
              <Pending on={vision.pending} />
            </p>
            <h2 id="vision-title" className={s.visionTitle}>
              {vision.title}
            </h2>
          </div>
          <Capsules className={`t-display ${s.manifesto}`}>
            {vision.lead}{" "}
            {vision.clauses.map((c) => {
              const Icon = capIcons[c.icon];
              return (
                <span key={c.before}>
                  {c.before}{" "}
                  <span className={s.capsule} data-capsule data-line={c.line} aria-hidden="true">
                    <Icon />
                  </span>{" "}
                  {c.after}{" "}
                </span>
              );
            })}
          </Capsules>
        </div>
      )}

      {mission && (
        <div className={`${s.mission} wrap`}>
          <div className={s.panel} data-mode="ink">
            <div className={s.missionHead}>
              <p className={s.kicker}>
                {p.missionKicker}
                <Pending on={mission.pending} />
              </p>
              <h2 id="mission-title" className={`t-head ${s.missionTitle}`}>
                {mission.title}
              </h2>
            </div>
            {groups && <p className={s.lead}>{groups.lead}</p>}
            {groups && (
              <Bridge
                items={groups.items.map((g, i) => ({ ...g, line: LINES[i % LINES.length] }))}
                change={groups.change}
                hint={p.groupsHint}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
