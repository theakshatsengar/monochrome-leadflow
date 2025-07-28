import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useLeadStore } from "@/store/leadStore";
import { LEAD_STATUSES, INTERNS, LeadStatus } from "@/types/lead";
import { toast } from "@/hooks/use-toast";

export function AddLeadDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    contactPersonName: "",
    contactEmail: "",
    linkedinProfile: "",
    assignedIntern: "",
    status: "new" as LeadStatus,
  });

  const { addLead } = useLeadStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.contactPersonName || !formData.contactEmail || !formData.assignedIntern) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      addLead({
        ...formData,
        linkedinProfile: formData.linkedinProfile || undefined,
      });

      toast({
        title: "Lead added successfully",
        description: `${formData.companyName} has been added to your leads.`,
      });

      setFormData({
        companyName: "",
        website: "",
        contactPersonName: "",
        contactEmail: "",
        linkedinProfile: "",
        assignedIntern: "",
        status: "new",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error adding lead",
        description: error instanceof Error ? error.message : "Failed to add lead",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Lead</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new lead to your pipeline. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-foreground">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Acme Corp"
                className="bg-background border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-foreground">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://acmecorp.com"
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPersonName" className="text-foreground">Contact Person *</Label>
              <Input
                id="contactPersonName"
                value={formData.contactPersonName}
                onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                placeholder="John Smith"
                className="bg-background border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-foreground">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="john@acmecorp.com"
                className="bg-background border-border text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinProfile" className="text-foreground">LinkedIn Profile (Optional)</Label>
            <Input
              id="linkedinProfile"
              type="url"
              value={formData.linkedinProfile}
              onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
              placeholder="https://linkedin.com/in/johnsmith"
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedIntern" className="text-foreground">Assigned Intern *</Label>
              <Select
                value={formData.assignedIntern}
                onValueChange={(value) => setFormData({ ...formData, assignedIntern: value })}
                required
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select intern" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border">
                  {INTERNS.map((intern) => (
                    <SelectItem key={intern} value={intern} className="text-foreground hover:bg-muted">
                      {intern}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-foreground">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as LeadStatus })}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border">
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value} className="text-foreground hover:bg-muted">
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Add Lead
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}