
import { TEAM_MEMBERS } from "../../data/aboutData";
import MemberCard from "./MemberCard";

export default function TeamSection() {
  return (
    <section className="space-y-8 py-6 font-sans">
      <div className="text-center space-y-2">
        <h2 className="text-h2 font-black text-[var(--primary-red)] dark:text-white tracking-wider uppercase">
          MEET OUR TEAM
        </h2>
        <div className="w-16 h-1 mx-auto rounded-full bg-[var(--primary-red)]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
        {TEAM_MEMBERS.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}
