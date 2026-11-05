import { MonthSummary } from "@/ui/components/Charts/MonthSummary";
import { Panel } from "./Panel";

// TODO: [purchase-photo-animation] Host the animation that moves purchased-item photos to the items that received a photo; the purchases domain does not exist yet.
export const HomePage = () => {
  return (
    <div className="overview_father">
      <Panel>
        <MonthSummary />
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
