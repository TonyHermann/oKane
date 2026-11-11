import { SpendingDashboard } from "@/ui/components/Charts/SpendingDashboard";
import { Panel } from "./Panel";

// TODO: [purchase-photo-animation] Host the animation that moves purchased-item photos to the items that received a photo; the purchases domain does not exist yet.
export const HomePage = () => {
  return (
    <div className="overview_father">
      <Panel>
        <SpendingDashboard />
      </Panel>
      <div className="panel" />
      <div className="panel" />
      <div className="panel" />
      <div className="panel" />
      <div className="panel" />
      <div className="panel" />
      <div className="panel" />
      <div className="panel" />
    </div>
  );
};
