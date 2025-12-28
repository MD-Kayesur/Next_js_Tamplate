// components/AdminPage/CourseManagement/ModuleEditorDialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CourseModule } from "@/type/course";

interface ModuleEditorDialogProps {
  module: CourseModule;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedModule: CourseModule) => void;
}

export const ModuleEditorDialog = ({
  module,
  open,
  onOpenChange,
  onSave,
}: ModuleEditorDialogProps) => {
  const [editedModule, setEditedModule] = useState<CourseModule>(module);

  const handleSave = () => {
    onSave(editedModule);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Module</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="module-title">Title</Label>
            <Input
              id="module-title"
              value={editedModule.title}
              onChange={(e) =>
                setEditedModule({ ...editedModule, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="module-description">Description</Label>
            <Textarea
              id="module-description"
              value={editedModule.description}
              onChange={(e) =>
                setEditedModule({
                  ...editedModule,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="module-order">Order</Label>
            <Input
              id="module-order"
              type="number"
              value={editedModule.order}
              onChange={(e) =>
                setEditedModule({
                  ...editedModule,
                  order: parseInt(e.target.value),
                })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
