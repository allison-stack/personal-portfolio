import { Console } from "./components/Console";
import { TopBar } from "./components/TopBar";
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
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
        <div className="flex flex-col min-h-[60dvh] lg:h-[58dvh]">
          <Chat />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NowPanel index={0} />
          <DayPanel index={1} />
          <LeetcodePanel index={2} />
          <LatestPanel index={3} />
          <div className="lg:col-span-2">
            <ProjectsPanel index={4} />
          </div>
        </div>
        <SystemFooter />
      </main>
    </Console>
  );
}
