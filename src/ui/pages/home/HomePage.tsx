import { MonthSummary } from "@/ui/components/Charts/MonthSummary";
import { Panel } from "./Panel";

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
