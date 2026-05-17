import { Console } from "./components/Console";
import { TopBar } from "./components/TopBar";
import { Identity } from "./components/Identity";
import { SystemFooter } from "./components/SystemFooter";
import { Chat } from "./components/ama/Chat";
import { NowPanel } from "./components/panels/NowPanel";
import { DayPanel } from "./components/panels/DayPanel";
import { LeetcodePanel } from "./components/panels/LeetcodePanel";
import { ProjectsPanel } from "./components/panels/ProjectsPanel";
import { LatestPanel } from "./components/panels/LatestPanel";

export default function Home() {
  return (
    <Console>
      <TopBar />
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <Identity />
        </div>
        <div className="lg:col-span-8 flex flex-col gap-4">
          <Chat />
          <ProjectsPanel />
        </div>
        <aside className="lg:col-span-4 flex flex-col gap-4">
          <NowPanel />
          <DayPanel />
          <LeetcodePanel />
          <LatestPanel />
        </aside>
        <div className="lg:col-span-12 pt-2 pb-4">
          <SystemFooter />
        </div>
      </main>
    </Console>
  );
}
