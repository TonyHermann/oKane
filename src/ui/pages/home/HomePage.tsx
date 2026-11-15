import { SpendingSummary } from "@/ui/components/Charts/SpendingSummary";
import { Panel } from "./Panel";

// TODO: [purchase-photo-animation] Host the animation that moves purchased-item photos to the items that received a photo; the purchases domain does not exist yet.
export const HomePage = () => {
  return (
    <div className="overview_father">
      <Panel>
        <SpendingSummary />
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
