import { useState } from "react";
import CategoryDialogs from "./dialogs/CategoryDialogs";
import CategoryList from "./components/CategoryList";
import { MainLayout } from "./layout/MainLayout";

const App = () => {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  return (
    <MainLayout onOpenCategoryManager={() => setIsCategoryDialogOpen(true)}>
      <CategoryList />
      <CategoryDialogs isOpen={isCategoryDialogOpen} onClose={() => setIsCategoryDialogOpen(false)} />
    </MainLayout>
  );
};

export default App;
