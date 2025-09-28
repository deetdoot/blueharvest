import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database,
  Cloud,
  Link,
  Settings,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";
import NavigationHeader from "@/components/navigation-header";

export default function ExternalIntegration() {
  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader farmerName="Integration Manager" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground" data-testid="text-integration-title">
            External Integrations
          </h2>
          <Button data-testid="button-add-integration">
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>

        {/* Integration Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border" data-testid="card-active-integrations">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Active Integrations</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-active-count">
                    4
                  </p>
                  <p className="text-xs text-muted-foreground">currently running</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border" data-testid="card-available-integrations">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Available Integrations</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-available-count">
                    12
                  </p>
                  <p className="text-xs text-muted-foreground">ready to configure</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Cloud className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border" data-testid="card-integration-health">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">System Health</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-health-status">
                    98%
                  </p>
                  <p className="text-xs text-muted-foreground">uptime this month</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Integrations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-border" data-testid="card-current-integrations">
            <CardHeader>
              <CardTitle data-testid="text-current-integrations-title">
                Current Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid="integration-gemini">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Gemini AI</h4>
                      <p className="text-sm text-muted-foreground">Smart irrigation recommendations</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800" data-testid="badge-gemini-status">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid="integration-sendgrid">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Link className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">SendGrid Email</h4>
                      <p className="text-sm text-muted-foreground">Automated notifications</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800" data-testid="badge-sendgrid-status">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid="integration-postgres">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">PostgreSQL Database</h4>
                      <p className="text-sm text-muted-foreground">Primary data storage</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800" data-testid="badge-postgres-status">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid="integration-weather">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Cloud className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Weather API</h4>
                      <p className="text-sm text-muted-foreground">Real-time weather data</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800" data-testid="badge-weather-status">
                    Mock Data
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border" data-testid="card-available-integrations-list">
            <CardHeader>
              <CardTitle data-testid="text-available-integrations-title">
                Available Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg border-dashed" data-testid="integration-snowflake">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Snowflake</h4>
                      <p className="text-sm text-muted-foreground">Advanced data analytics</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-configure-snowflake">
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg border-dashed" data-testid="integration-stripe">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Link className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Stripe Payments</h4>
                      <p className="text-sm text-muted-foreground">Subscription billing</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-configure-stripe">
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg border-dashed" data-testid="integration-slack">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Slack Notifications</h4>
                      <p className="text-sm text-muted-foreground">Team alerts</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-configure-slack">
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg border-dashed" data-testid="integration-aws">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Cloud className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">AWS IoT</h4>
                      <p className="text-sm text-muted-foreground">Sensor data collection</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-configure-aws">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Logs */}
        <div className="mt-8">
          <Card className="border-border" data-testid="card-integration-logs">
            <CardHeader>
              <CardTitle data-testid="text-integration-logs-title">
                Recent Integration Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid="log-entry-1">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Gemini AI: Generated farmer summary</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid="log-entry-2">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">SendGrid: Compliance alert sent</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid="log-entry-3">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Weather API: Using mock data (API key not configured)</p>
                      <p className="text-xs text-muted-foreground">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}