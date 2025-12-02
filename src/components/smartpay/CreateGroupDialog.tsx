import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Users, Sparkles } from "lucide-react";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateGroupDialog = ({ open, onOpenChange, onSuccess }: CreateGroupDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate trip code
      const { data: codeData, error: codeError } = await supabase.rpc("generate_trip_code");
      if (codeError) throw codeError;

      // Create group
      const { data: group, error: groupError } = await supabase
        .from("trip_groups")
        .insert({
          name: name.trim(),
          description: description.trim(),
          created_by: user.id,
          trip_code: codeData,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
          name: user.email || "You",
          is_admin: true,
        });

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: `Group created! Share code: ${codeData}`,
      });

      setName("");
      setDescription("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-foreground">
            Create Trip Group
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Create a new group to manage expenses with your travel companions
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Group Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Goa Trip 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="e.g., Weekend getaway with friends"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              A unique trip code will be generated to share with your group members.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1 border-border text-foreground hover:bg-muted"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={loading}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;