import { ASCIIConverter } from "@/ui/components/ASCIIConverter/ASCIIConverter";

export const AsciiPage = () => {
  return (
    <div className="window">
      <div className="title-bar">
        <div className="title-bar-text">Panel ASCII</div>
      </div>
      <div className="window-body">
        <ASCIIConverter />
      </div>
    </div>
  );
};
