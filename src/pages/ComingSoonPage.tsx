import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Construction, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface ComingSoonPageProps {
  feature: string;
}

export function ComingSoonPage({ feature }: ComingSoonPageProps) {
  const getFeatureDescription = (feature: string) => {
    switch (feature) {
      case 'Overview':
        return {
          description: "Advanced dashboard with comprehensive attendance analytics, performance metrics, and detailed insights.",
          features: ["Performance Analytics", "Attendance Trends", "Employee Insights", "Quick Actions"]
        };
      case 'Calendar':
        return {
          description: "Interactive calendar view with year-over-year comparison, detailed day views, and attendance patterns.",
          features: ["Year View Calendar", "Day Details", "Pattern Analysis", "Export Options"]
        };
      case 'Reports':
        return {
          description: "Comprehensive reporting system with custom filters, charts, and exportable reports.",
          features: ["Custom Reports", "Advanced Filters", "Visual Charts", "Multiple Export Formats"]
        };
      default:
        return {
          description: "This feature is currently under development and will be available soon.",
          features: ["Coming Soon", "Stay Tuned", "In Development"]
        };
    }
  };

  const { description, features } = getFeatureDescription(feature);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-gradient-card border-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <Construction className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {feature} Section
            </CardTitle>
            <Badge variant="secondary" className="mx-auto mt-2 bg-status-late/20 text-status-late">
              <Clock className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground text-lg leading-relaxed">
              {description}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {features.map((featureItem, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{featureItem}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">What's Coming:</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Advanced analytics and reporting</p>
                <p>• Interactive calendar with detailed views</p>
                <p>• Custom report generation and export</p>
                <p>• Real-time data visualization</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/">
                <Button className="w-full sm:w-auto gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Attendance
                </Button>
              </Link>
              <Button variant="outline" className="w-full sm:w-auto" disabled>
                <Clock className="h-4 w-4 mr-2" />
                Notify When Ready
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card className="mt-6 bg-background border-border">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold">Currently Available</h3>
              <div className="flex justify-center gap-4">
                <Link to="/">
                  <Badge className="bg-status-present text-white hover:bg-status-present/90 cursor-pointer">
                    Attendance Dashboard
                  </Badge>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                Use the Attendance section to view your current attendance records and real-time data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ComingSoonPage;
