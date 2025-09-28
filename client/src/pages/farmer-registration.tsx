import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sprout } from "lucide-react";
import BlueHarvestLogo from "@/components/blue-harvest-logo";
import { insertFarmerSchema } from "@shared/schema";

export default function FarmerRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    farmName: "",
    farmLocation: "",
    totalAcres: "",
    soilType: "",
    irrigationMethod: "",
  });

  const createFarmerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/farmers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create farmer profile");
      return response.json();
    },
    onSuccess: (farmer) => {
      toast({
        title: "Registration Successful",
        description: "Your farmer profile has been created successfully.",
      });
      // Redirect to main dashboard (will automatically load the farmer)
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: "Failed to create your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataToValidate = {
        ...formData,
        // Keep totalAcres as string since decimal fields expect strings
      };
      
      const validatedData = insertFarmerSchema.parse(dataToValidate);
      
      createFarmerMutation.mutate(validatedData);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BlueHarvestLogo size="lg" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="text-registration-title">
            Register Your Farm
          </h2>
          <p className="text-muted-foreground">
            Join the smart irrigation platform for optimized water management
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle data-testid="text-form-title">Farmer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  data-testid="input-phone"
                />
              </div>

              {/* Farm Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Farm Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="farmName">Farm Name *</Label>
                    <Input
                      id="farmName"
                      value={formData.farmName}
                      onChange={(e) => handleInputChange("farmName", e.target.value)}
                      required
                      data-testid="input-farm-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalAcres">Total Acres *</Label>
                    <Input
                      id="totalAcres"
                      type="number"
                      step="0.1"
                      value={formData.totalAcres}
                      onChange={(e) => handleInputChange("totalAcres", e.target.value)}
                      required
                      data-testid="input-total-acres"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <Label htmlFor="farmLocation">Farm Location (City, State) *</Label>
                  <Input
                    id="farmLocation"
                    value={formData.farmLocation}
                    onChange={(e) => handleInputChange("farmLocation", e.target.value)}
                    placeholder="e.g., Fresno, CA"
                    required
                    data-testid="input-farm-location"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="soilType">Primary Soil Type *</Label>
                    <Select value={formData.soilType} onValueChange={(value) => handleInputChange("soilType", value)}>
                      <SelectTrigger data-testid="select-soil-type">
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clay">Clay</SelectItem>
                        <SelectItem value="loam">Loam</SelectItem>
                        <SelectItem value="sand">Sandy</SelectItem>
                        <SelectItem value="silt">Silt</SelectItem>
                        <SelectItem value="rocky">Rocky</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="irrigationMethod">Primary Irrigation Method *</Label>
                    <Select value={formData.irrigationMethod} onValueChange={(value) => handleInputChange("irrigationMethod", value)}>
                      <SelectTrigger data-testid="select-irrigation-method">
                        <SelectValue placeholder="Select irrigation method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="drip">Drip Irrigation</SelectItem>
                        <SelectItem value="sprinkler">Sprinkler System</SelectItem>
                        <SelectItem value="flood">Flood Irrigation</SelectItem>
                        <SelectItem value="pivot">Center Pivot</SelectItem>
                        <SelectItem value="furrow">Furrow Irrigation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setLocation("/")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createFarmerMutation.isPending}
                  data-testid="button-register"
                >
                  {createFarmerMutation.isPending ? "Creating Profile..." : "Register Farm"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
