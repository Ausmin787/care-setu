import { IconHeartFilled, IconHomeFilled, IconUsersGroup } from "@tabler/icons-react";
import { about } from "@/lib/about";
import { shown, t } from "@/lib/content";
import { Capsules } from "@/components/motion/Capsules";
import { Groups } from "./Groups";
import { Pending } from "./Pending";
import s from "./Manifesto.module.css";

const p = t.aboutPage;
const capIcons = { home: IconHomeFilled, family: IconUsersGroup, heart: IconHeartFilled };

// Vision, then mission (D-032). The vision is one large sentence with three capsules set between its words
// (GetLayers Halden), in the logo colours until Sasanka's still-lifes arrive; they open with scroll (Capsules).
// The mission follows in two columns: its line on the left, and on the right the six groups the founders want to
// bring together, each an inline word that opens its part (Groups). Development only until approved (C-075, C-078).
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
          <div>
            <p className={s.kicker}>
              {p.missionKicker}
              <Pending on={mission.pending} />
            </p>
            <h2 id="mission-title" className={`t-head ${s.missionTitle}`}>
              {mission.title}
            </h2>
          </div>
          {groups && (
            <div className={s.groups}>
              <p className={s.groupsText}>
                {groups.lead} <Groups items={groups.items} />
              </p>
              <p className={s.hint}>{p.groupsHint}</p>
              <p className={s.change}>{groups.change}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
